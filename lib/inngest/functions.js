import { sendEmail } from "@/actions/sendemail";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/template";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Runs every 4 hours
export const checkBudgetAlert = inngest.createFunction(
  { id: "check-budget-alerts" },
  { cron: "0 */4 * * *" },
  async ({ step }) => {
    // 1) Load budgets with users and their default accounts
    const budgets = await step.run("fetch-budgets-and-users", async () => {
      return db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: { isDefault: true },
              },
            },
          },
        },
      });
    });

    for (const budget of budgets) {
      // Pick the default account
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      // 2) Compute this month’s total debit for the default account
      const debitAggregation = await step.run(
        `calculate-debit-${budget.id}`,
        async () => {
          const now = new Date();
          const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

          return db.transaction.aggregate({
            where: {
              userId: budget.userId,
              accountId: defaultAccount.id,
              type: "DEBIT",
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
            _sum: { amount: true },
          });
        }
      );

      // Safely convert Prisma Decimal (or number) to number
      const rawTotal = debitAggregation?._sum?.amount ?? 0;
      const totalExpenses =
        typeof rawTotal === "object" && rawTotal.toNumber
          ? rawTotal.toNumber()
          : Number(rawTotal);

      const rawBudget = budget.amount ?? 0;
      const budgetAmount =
        typeof rawBudget === "object" && rawBudget.toNumber
          ? rawBudget.toNumber()
          : Number(rawBudget);

      const percentageUsed =
        budgetAmount > 0 ? (totalExpenses / budgetAmount) * 100 : 0;

      // 3) Determine if an alert should be sent
      const nowDate = new Date();
      const shouldAlert =
        percentageUsed >= 85 &&
        (!budget.lastAlertSent || isNewMonth(budget.lastAlertSent, nowDate));

      if (shouldAlert) {
        // Send the email
        await step.run(`send-alert-${budget.id}`, async () => {
          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert: You've used ${percentageUsed.toFixed(0)}% of your budget`,
            react: (
              <EmailTemplate
                type="budget-alert"
                userName={budget.user.name}
                data={{
                  percentageUsed,
                  budgetAmount,
                  totalExpenses,
                  accountName: defaultAccount.name,
                }}
              />
            ),
          });
        });

        // Update last alert timestamp
        await step.run(`update-last-alert-sent-${budget.id}`, async () => {
          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: nowDate },
          });
        });
      }
    }
  }
);

// Helper function to check if the alert is for a new month
function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" }, //executes every midnight
  async ({ step }) => {
    //step 1: Fetch all due recurring transactions
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions", //name of step
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null }, //never processed
              { nextRecurringDate: { lte: new Date() } }, //due date passed
            ],
          },
        });
      }
    );

    //step 2: Create events for each transaction
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: { transactionId: transaction.id, userId: transaction.userId },
      }));

      //step 3: Send these to inggest to be processed
      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  }
);

export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    throttle: {
      limit: 10, //10 transacations
      period: "1m", //per minute
      key: "event.data.userId", //per userId
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    //validate event data
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data:", event);
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          //join account where userid and transaction id, and give the account information as well
          account: true,
        },
      });
      if (!transaction || !isTransactionDue(transaction)) return;

      // Create new transaction and update account balance in a transaction
      await db.$transaction(async (tx) => {
        // Create new transaction
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        // Update account balance
        const balanceChange =
          transaction.type === "DEBIT"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        // Update last processed date and next recurring date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    });
  }
);

function isTransactionDue(transaction) {
  // If no lastProcessed date, transaction is due
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  // Compare with nextDue date
  return nextDue <= today;
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

export const generateMonthlyReport = inngest.createFunction(
  {
    id: "generate-monthly-report",
    name: "generate Monthly Report",
  },
  { cron: "0 0 1 * *" }, //runs on the first of every month
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: { accounts: true },
      });
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: (
            <EmailTemplate
              type="monthly-report"
              userName={user.name}
              data={{
                stats,
                month: monthName,
                insights,
                accountName: user.accounts[0]?.name || "Your Account", // optional
              }}
            />
          ),
        });
      });
    }

    return { processed: users.length };
  }
);

async function generateFinancialInsights(stats, month) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Helper to format numbers as INR
  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);

  // Calculate percentages for each category
  const totalExpenses = stats.totalExpenses || 0;
  const categoryStrings = Object.entries(stats.byCategory || {}).map(([category, amount]) => {
    const percent = totalExpenses ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
    return `${category}: ${formatINR(amount)} (${percent}%)`;
  });

  // Construct the prompt
  const prompt = `
  You are an expert financial assistant. Analyze the financial data below and provide exactly 3 actionable insights. 
  Focus ONLY on financial patterns, overspending, and ways to improve savings. 
  
  Do NOT reference the app, suggest using features, or give any marketing/sales instructions. 
  Do NOT mention “tracking expenses” or “setting up budgets manually.” 
  Tone: friendly, professional, concise.
  
  Financial Data for ${month}:
  - Total Income: ${formatINR(stats.totalIncome)}
  - Total Expenses: ${formatINR(stats.totalExpenses)}
  - Net Savings: ${formatINR(stats.totalIncome - stats.totalExpenses)}
  - Expense Categories: ${categoryStrings.join(", ")}
  
  Return ONLY a JSON array of 3 concise insights, e.g. ["Insight 1", "Insight 2", "Insight 3"].
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // Clean AI output
    text = text.replace(/```(?:json)?/g, "").trim();
    text = text.replace(/,\s*]$/, "]"); // fix trailing comma

    const insights = JSON.parse(text);

    // Validate output
    if (!Array.isArray(insights) || insights.length !== 3) {
      throw new Error("AI returned invalid insight format");
    }

    return insights;
  } catch (error) {
    console.error("Error generating insights:", error);
    // Fallback insights
    return [
      "Review your largest expense categories to find potential savings.",
      "Set up a budget for categories with high spending.",
      "Track recurring expenses to spot opportunities to save.",
    ];
  }
}


async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "DEBIT") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}
