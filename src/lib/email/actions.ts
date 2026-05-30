"use server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, emailConfigured, emailDomainVerified } from "./resend";
import { getLeadById } from "@/lib/queries/leads";
import { revalidatePath } from "next/cache";

export async function getEmailStatus() {
  return { configured: emailConfigured, domainVerified: emailDomainVerified };
}

export interface SendLeadEmailResult {
  ok: boolean;
  error?: string;
  redirectedTo?: string;
}

/**
 * Sends an email to a lead via Resend and logs it as an outbound message
 * in the inbox thread so it shows up in conversation history.
 */
export async function sendLeadEmail(leadId: string, subject: string, body: string): Promise<SendLeadEmailResult> {
  const lead = await getLeadById(leadId);
  if (!lead) return { ok: false, error: "Lead not found" };
  if (!lead.email) return { ok: false, error: "This lead has no email address" };

  const result = await sendEmail({
    to: lead.email,
    subject,
    text: body,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  // Log to inbox as outbound message
  const supabase = await createClient();
  await supabase.from("inbox_messages").insert({
    lead_id: leadId,
    direction: "outbound",
    subject,
    body,
    is_read: true,
  });

  revalidatePath("/inbox");
  revalidatePath(`/leads/${leadId}`);

  return { ok: true, redirectedTo: result.redirectedTo };
}

/** Sends a one-off test email to the configured test inbox. */
export async function sendTestEmail(subject: string, body: string): Promise<SendLeadEmailResult> {
  const result = await sendEmail({
    to: process.env.EMAIL_TEST_RECIPIENT || "",
    subject,
    text: body,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}
