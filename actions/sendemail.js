"use server";

import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Resend API key missing!");
    return { success: false, error: "Missing API key" };
  }

  const resend = new Resend(apiKey);

  try {
    // Pass the React element directly — Resend will render it on the server
    const data = await resend.emails.send({
      from: "Finix <onboarding@resend.dev>",
      to,
      subject,
      react, // Pass the component directly
    });

    console.log("Email sent successfully to:", to);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return { success: false, error };
  }
}
