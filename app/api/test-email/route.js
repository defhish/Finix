// app/api/test-email/route.ts
import { Resend } from "resend";
import { BudgetEmail } from "@/emails/template";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function GET() {
  try {
    const data = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>", // must be verified in Resend
      to: ["nitheeshmp1203@gmail.com"],          // your test inbox
      subject: "Test Budget Alert",
      react: (
        <BudgetEmail
          userName="Test User"
          percentageUsed={88}
          budgetAmount={5000}
          totalExpenses={4400}
        />
      ),
    });

    console.log("Resend response:", data); // log for debugging
    return new Response(JSON.stringify({ message: "Test email sent!", data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    return new Response(JSON.stringify({ error: "Failed to send test email", details: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
