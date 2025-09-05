"use server";
import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { categories, request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Description } from "@radix-ui/react-dialog";
import { revalidatePath } from "next/cache";

const genAi =new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serialize = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};
export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized User");
    //RATE LIMITING USING ARCJET

    //get request data for arcJet

    const req = await request();
    //Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, //specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Try again later.");
      }

      throw new Error("Request Blocked.");
    }

    // check if user exists
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User Not Found");

    // ✅ fetch the account first
    const account = await db.account.findUnique({
      where: { id: data.accountId },
    });
    if (!account) throw new Error("Account not found");

    // get the amount change
    const balanceChange =
      data.type === "DEBIT" ? -Number(data.amount) : Number(data.amount);

    const newBalance = account.balance.toNumber() + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serialize(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

export async function scanTransaction(file) {
  try {
    const model = genAi.getGenerativeModel({ model: "gemini-2.5-flash" });

    //convert file to array buffer so we can give it to model
    const arrayBuffer = await file.arrayBuffer();
    //convert array buffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
  Analyze this receipt image or payment screenshot and extract the following information in JSON format:
  - Total amount (just the number)
  - Date (in ISO format)
  - Description or items purchased (brief summary, if not available use "Payment")
  - Merchant/store name (or "Paid to" field for payment apps like GPay/Paytm/PhonePe)
  - Suggested category (one of: housing, transportation, groceries, utilities, entertainment, food, shopping, healthcare, education, personal, travel, insurance, gifts, bills, other-expense)

  Only respond with valid JSON in this exact format:
  {
    "amount": number,
    "date": "ISO date string",
    "description": "string",
    "merchantName": "string",
    "category": "string"
  }

  If it's not a receipt or a payment screenshot, return an empty object.
`;

    //send request
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64String,
                mimeType: file.type,
              },
            },
            {
              text: prompt, // ✅ put your instruction here
            },
          ],
        },
      ],
    });

    //recieve response and convert it to text
    const response = await result.response;
    const text = response.text();
    const cleantext = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      
      const data=JSON.parse(cleantext)
      return{
        amount:parseFloat(data.amount),
        date:new Date(data.date),
        description:data.description,
        category:data.category,
        merchantName:data.merchantName,
      }

    } catch (parseError) {
      console.error("Error parsing JSON response:",parseError)
      throw new Error("Invalid response format from AI")
    }

  } catch (error) {
    console.log("Error scanning:", error.message)
    throw new Error("Failed to scan the transaction")
  }
}

export async function getTransaction(id){
  const { userId }=await auth();
        if(!userId) throw new Error("Unauthorized User")

        
        //check if user is in database
        const user=await db.user.findUnique({
            where:{clerkUserId: userId},
        })
        //if not send error
        if(!user){
            throw new Error("User Not Found")
        }
  
  const transaction=await db.transaction.findUnique({
    where:{
      id,
      userId:user.id,
    }
  })

    if(!transaction) throw new Error("Transaction not found");

    return serialize(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serialize(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}