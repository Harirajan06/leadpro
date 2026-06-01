"use server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";

/**
 * Direct signup that bypasses Resend's sandbox restriction on email confirmation.
 * - Creates the user with email_confirm: true (no Supabase email sent)
 * - Sends a courtesy notification to the Resend account owner email
 * - User can log in immediately with their password
 */
export async function signUpDirect(args: { email: string; password: string; fullName: string }): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();

  // 1. Create user (auto-confirmed, no email sent by Supabase)
  const { data, error } = await admin.auth.admin.createUser({
    email: args.email,
    password: args.password,
    email_confirm: true,
    user_metadata: { full_name: args.fullName },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // 2. Send a courtesy notification to the Resend account owner — informational,
  //    not a confirmation step. The user is already confirmed and can log in.
  const ownerEmail = process.env.EMAIL_TEST_RECIPIENT || "harirajanncse@gmail.com";
  try {
    await sendEmail({
      to: ownerEmail,
      subject: `New LeadPro signup — ${args.fullName}`,
      html: `<div style="font-family:sans-serif;line-height:1.6;color:#0f172a;padding:24px;background:#f8fafc">
        <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px;border:1px solid #e2e8f0">
          <h2 style="margin:0 0 16px;color:#0f172a">New LeadPro signup</h2>
          <p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(args.fullName)}</p>
          <p style="margin:0 0 4px"><strong>Email:</strong> ${escapeHtml(args.email)}</p>
          <p style="margin:0 0 4px"><strong>User ID:</strong> <code style="font-size:12px">${data.user.id}</code></p>
          <p style="margin:16px 0 0;color:#64748b;font-size:13px">A fresh workspace was created. The user can log in immediately with the password they entered.</p>
        </div>
      </div>`,
    });
  } catch {
    // Swallow notification errors — signup itself should succeed regardless.
  }

  return { ok: true };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
