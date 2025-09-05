"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Decimal } from 'decimal.js';

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

export async function updateDefaultAccount(accountId) {
    //we need to check user exists or not and all that stuff, so copy from dashboardaccount.js
    try{
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

        //find accounts which is/are default and then make them false
        await db.account.updateMany({
            where: { userId: user.id, isDefault: true }, //find whichever old account was default
            data: { isDefault: false }                   // make it false
        });

        //find the account which the user is making default and make it default
        const account=await db.account.update({
            where:{
                id:accountId,
                userId: user.id,
            },
            data:{isDefault:true},
        })

        revalidatePath("/dashboard");

        return{ success:true, data:serialize(account)   };

    }catch(error){
        return{ success:false, error:error.message };
    }
}
export async function getAccountTransactions(accountId) {
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
  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account) return null;

  return {
    ...serialize(account),
    transactions: account.transactions.map(serialize),
  };
}

export async function bulkDeleteTransactions(transactionIds) {
    try {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized User");
  
      // check if user exists
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
      if (!user) throw new Error("User Not Found");
  
      // fetch transactions to be deleted
      const transactions = await db.transaction.findMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });
  
      // --- START OF FIX ---
      // calculate account balance changes with precision
      const accountBalanceChanges = transactions.reduce((acc, transaction) => {
        const transactionAmount = new Decimal(transaction.amount);
  
        // When deleting, the effect on the balance is reversed.
        const change =
          transaction.type === "DEBIT"
            ? transactionAmount
            : transactionAmount.negated(); // Use .negated() for -amount
  
        const currentChange = acc[transaction.accountId] || new Decimal(0);
        acc[transaction.accountId] = currentChange.plus(change); // Use .plus() for addition
  
        return acc;
      }, {});
      // --- END OF FIX ---
  
      // run all updates in a single transaction
      await db.$transaction(async (tx) => {
        // delete transactions
        await tx.transaction.deleteMany({
          where: {
            id: { in: transactionIds },
            userId: user.id,
          },
        });
  
        // update account balances
        for (const [accountId, balanceChange] of Object.entries(
          accountBalanceChanges
        )) {
          await tx.account.update({
            where: { id: accountId },
            data: {
              balance: {
                increment: balanceChange, // Prisma works directly with decimal.js objects
              },
            },
          });
        }
      });
  
      revalidatePath("/dashboard");
      revalidatePath("/account/[id]");
  
      return { success: true };
    } catch (error) {
      console.error("BULK DELETE FAILED:", error); // Keep this for debugging
      return { success: false, error: error.message };
    }
  }
  

  export async function deleteAccount(accountId) {
    try {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized User");
  
      // check if user exists
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
      if (!user) throw new Error("User Not Found");
  
      // check if the account exists and belongs to user
      const account = await db.account.findUnique({
        where: { id: accountId },
      });
      if (!account || account.userId !== user.id) throw new Error("Account Not Found");
  
      const isDefault = account.isDefault;
  
      // delete the account (transactions will cascade)
      await db.account.delete({
        where: { id: accountId },
      });
  
      // If it was the default account, assign a new default if any accounts exist
      if (isDefault) {
        const anotherAccount = await db.account.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" }, // pick oldest or newest
        });
  
        if (anotherAccount) {
          await db.account.update({
            where: { id: anotherAccount.id },
            data: { isDefault: true },
          });
        }
      }
  
      // Revalidate dashboard and accounts pages
      revalidatePath("/dashboard");
      revalidatePath(`/account/${accountId}`);
  
      return { success: true };
    } catch (error) {
      console.error("DELETE ACCOUNT FAILED:", error);
      return { success: false, error: error.message };
    }
  }