import "server-only";

/**
 * Unipile client — one provider for BOTH Gmail/Outlook email and LinkedIn.
 *
 * Setup (see docs/OUTREACH_SETUP.md):
 *   UNIPILE_DSN      e.g. https://api8.unipile.com:13851   (from your Unipile dashboard)
 *   UNIPILE_API_KEY  your API access token
 *
 * If these are unset, `unipileConfigured` is false and callers fall back
 * (email → Resend, LinkedIn → logged-only), so the app keeps working.
 */
const DSN = process.env.UNIPILE_DSN;
const API_KEY = process.env.UNIPILE_API_KEY;

export const unipileConfigured = Boolean(DSN && API_KEY);

function baseUrl() {
  if (!DSN) throw new Error("Unipile not configured (missing UNIPILE_DSN)");
  return DSN.replace(/\/+$/, "") + "/api/v1";
}

async function unipileFetch(path: string, init: RequestInit = {}) {
  if (!unipileConfigured) throw new Error("Unipile not configured");
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      "X-API-KEY": API_KEY!,
      "Content-Type": "application/json",
      accept: "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    // Unipile returns { status, type, title, detail } — surface detail/title so
    // failures are human-readable in the activity log (not just "HTTP 500").
    let msg = `HTTP ${res.status}`;
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      msg = String(d.detail || d.title || d.message || msg);
    } else if (typeof data === "string" && data) {
      msg = data;
    }
    throw new Error(`Unipile (${res.status}): ${msg.slice(0, 300)}`);
  }
  return data;
}

export interface UnipileAccount {
  id: string;
  type: string;            // "MAIL" | "LINKEDIN" | ...
  name?: string;
  identifier?: string;     // email or linkedin handle
  status?: string;
}

/**
 * Creates a Unipile-hosted auth wizard link. The user clicks it, authorizes
 * their Gmail/Outlook or LinkedIn, and Unipile redirects back to `successUrl`.
 * We then sync accounts to pick up the newly connected one.
 */
export async function createHostedAuthLink(opts: {
  providers: "email" | "linkedin";
  successUrl: string;
  failureUrl: string;
  name: string; // our correlation id (workspace id)
  expiresOn: string; // ISO timestamp
}): Promise<{ url: string }> {
  const providerMap = { email: ["GOOGLE", "OUTLOOK", "MAIL"], linkedin: ["LINKEDIN"] };
  const data = await unipileFetch("/hosted/accounts/link", {
    method: "POST",
    body: JSON.stringify({
      type: "create",
      providers: providerMap[opts.providers],
      api_url: baseUrl().replace(/\/api\/v1$/, ""),
      expiresOn: opts.expiresOn,
      success_redirect_url: opts.successUrl,
      failure_redirect_url: opts.failureUrl,
      name: opts.name,
    }),
  });
  const url = (data as { url?: string })?.url;
  if (!url) throw new Error("Unipile did not return a hosted auth url");
  return { url };
}

/** Lists all accounts connected to this Unipile workspace. */
export async function listUnipileAccounts(): Promise<UnipileAccount[]> {
  const data = await unipileFetch("/accounts", { method: "GET" });
  const items = (data as { items?: unknown[] })?.items ?? [];
  return items.map((a) => {
    const acc = a as Record<string, unknown>;
    return {
      id: String(acc.id ?? ""),
      type: String(acc.type ?? ""),
      name: acc.name ? String(acc.name) : undefined,
      identifier: acc.identifier ? String(acc.identifier) : undefined,
      status: acc.status ? String(acc.status) : undefined,
    };
  });
}

/** Sends an email from a connected mailbox. */
export async function unipileSendEmail(opts: {
  accountId: string;
  to: string;
  subject: string;
  body: string; // HTML or text
}): Promise<{ id?: string }> {
  const data = await unipileFetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      account_id: opts.accountId,
      to: [{ identifier: opts.to }],
      subject: opts.subject,
      body: opts.body,
    }),
  });
  return { id: (data as { id?: string })?.id };
}

/** Sends a LinkedIn connection (invitation) request, with optional note. */
export async function unipileSendInvite(opts: {
  accountId: string;
  providerId: string; // recipient's LinkedIn provider id (resolved from profile)
  message?: string;
}): Promise<{ id?: string }> {
  const data = await unipileFetch("/users/invite", {
    method: "POST",
    body: JSON.stringify({
      account_id: opts.accountId,
      provider_id: opts.providerId,
      message: opts.message || undefined,
    }),
  });
  return { id: (data as { id?: string })?.id };
}

/** Sends a LinkedIn direct message (requires being connected / open profile). */
export async function unipileSendLinkedInMessage(opts: {
  accountId: string;
  providerId: string;
  text: string;
}): Promise<{ id?: string }> {
  const data = await unipileFetch("/chats", {
    method: "POST",
    body: JSON.stringify({
      account_id: opts.accountId,
      attendees_ids: [opts.providerId],
      text: opts.text,
    }),
  });
  return { id: (data as { id?: string })?.id };
}

/** Resolves a LinkedIn profile (from a public URL) to its provider id. */
export async function unipileResolveProfile(opts: {
  accountId: string;
  identifier: string; // public LinkedIn url or handle
}): Promise<{ providerId: string | null }> {
  const handle = opts.identifier.replace(/\/+$/, "").split("/in/").pop()?.split(/[/?]/)[0] || opts.identifier;
  try {
    const data = await unipileFetch(`/users/${encodeURIComponent(handle)}?account_id=${encodeURIComponent(opts.accountId)}`, { method: "GET" });
    const pid = (data as { provider_id?: string })?.provider_id;
    return { providerId: pid ? String(pid) : null };
  } catch {
    return { providerId: null };
  }
}
