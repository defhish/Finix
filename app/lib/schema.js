import {z} from "zod";

export const accountSchema=z.object({
    name: z.string().min(1,"Enter Name"), //name is a string, which should of minimum 1 letter, or "Enter Name" appears
    type: z.enum(["CURRENT","SAVINGS"]), //in our databse current is an enum with these values
    balance: z.string().min(1,"Enter Initial Balance"),
    isDefault: z.boolean().default(false),

})

export const transactionSchema = z.object({
    type: z.enum(["CREDIT", "DEBIT"]),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().optional(),
    date: z.date({ required_error: "Date is required" }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  }).superRefine((data, ctx) => {  //AFTER THE FORM IS SUBMITTER THIS SUPERREFINE IS USED TO MAKE SOME CHECKS
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: "custom",
        message: "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }
  });