import "server-only";

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "LeadPro <onboarding@resend.dev>";
const DOMAIN_VERIFIED = process.env.EMAIL_DOMAIN_VERIFIED === "true";
const TEST_RECIPIENT = process.env.EMAIL_TEST_RECIPIENT;

export const emailConfigured = Boolean(API_KEY);
export const emailDomainVerified = DOMAIN_VERIFIED;

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
  redirectedTo?: string; // when sandboxed, the real recipient we fell back to
}

interface SendArgs {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Sends an email via Resend.
 * In sandbox mode (no verified domain), Resend only allows sending to the
 * account owner. We auto-redirect to EMAIL_TEST_RECIPIENT and report it,
 * so the UI can show "sent to your test inbox instead of the real lead".
 */
export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<SendResult> {
  if (!API_KEY) return { ok: false, error: "Email not configured (missing RESEND_API_KEY)" };

  const realTo = to;
  let effectiveTo = to;
  let redirectedTo: string | undefined;

  // In sandbox mode, redirect any non-owner recipient to the test inbox
  if (!DOMAIN_VERIFIED && TEST_RECIPIENT && to.toLowerCase() !== TEST_RECIPIENT.toLowerCase()) {
    effectiveTo = TEST_RECIPIENT;
    redirectedTo = TEST_RECIPIENT;
  }

  const body =
    html ||
    `<div style="font-family:sans-serif;line-height:1.6;color:#0f172a">${(text || "").replace(/\n/g, "<br>")}</div>`;

  const sandboxNote = redirectedTo
    ? `<div style="margin-top:24px;padding:12px;background:#fef3c7;border:1px solid #fde68a;border-radius:8px;font-family:sans-serif;font-size:12px;color:#92400e">⚠️ Sandbox mode: this email was intended for <b>${realTo}</b> but Resend has no verified domain yet, so it was redirected to your test inbox. Verify a domain at resend.com/domains to send to real leads.</div>`
    : "";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: effectiveTo,
      subject,
      html: body + sandboxNote,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    let msg = errText;
    try {
      msg = JSON.parse(errText).message || errText;
    } catch {}
    return { ok: false, error: msg.slice(0, 300) };
  }

  const data = await res.json();
  return { ok: true, id: data.id, redirectedTo };
}
