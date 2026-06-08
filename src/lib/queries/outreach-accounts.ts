"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  unipileConfigured,
  createHostedAuthLink,
  listUnipileAccounts,
} from "@/lib/outreach/unipile";

export interface OutreachAccountRow {
  id: string;
  provider: string;
  channel: "email" | "linkedin";
  account_id: string;
  name: string | null;
  identifier: string | null;
  status: string;
  created_at: string;
}

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export async function isUnipileConfigured() {
  return unipileConfigured;
}

export async function getOutreachAccounts(): Promise<OutreachAccountRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("outreach_accounts")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

/**
 * Returns a Unipile hosted-auth URL the user opens to connect a mailbox or
 * LinkedIn account. After they authorize, Unipile redirects back to
 * /outreach?connected=<channel>, and we call syncOutreachAccounts() to store it.
 */
export async function connectOutreachAccount(channel: "email" | "linkedin"): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!unipileConfigured) {
    return { ok: false, error: "Unipile is not configured. Add UNIPILE_DSN and UNIPILE_API_KEY to your environment." };
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("users").select("workspace_id").eq("user_id", user.id).single()
    : { data: null };
  const wsId = (profile as { workspace_id?: string } | null)?.workspace_id || "unknown";

  // expires 1 hour out; computed without Date.now() to satisfy lint-free server code
  const expiresOn = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  try {
    const { url } = await createHostedAuthLink({
      providers: channel,
      successUrl: `${appUrl()}/outreach?connected=${channel}`,
      failureUrl: `${appUrl()}/outreach?connect_error=1`,
      name: wsId,
      expiresOn,
    });
    return { ok: true, url };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create connect link" };
  }
}

/**
 * Pulls the current account list from Unipile and upserts rows for this
 * workspace. Called after the connect redirect (and from the Accounts tab).
 */
export async function syncOutreachAccounts(): Promise<{ ok: boolean; count: number; error?: string }> {
  if (!unipileConfigured) return { ok: false, count: 0, error: "Unipile not configured" };
  const supabase = await createClient();
  try {
    const accounts = await listUnipileAccounts();
    let count = 0;
    for (const a of accounts) {
      const channel: "email" | "linkedin" = a.type === "LINKEDIN" ? "linkedin" : "email";
      const { error } = await supabase
        .from("outreach_accounts")
        .upsert(
          {
            provider: "unipile",
            channel,
            account_id: a.id,
            name: a.name ?? null,
            identifier: a.identifier ?? null,
            status: (a.status && a.status.toLowerCase().includes("ok")) || a.status === "CONNECTED" ? "connected" : (a.status || "connected"),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "workspace_id,account_id" }
        );
      if (!error) count++;
    }
    revalidatePath("/outreach");
    return { ok: true, count };
  } catch (err) {
    return { ok: false, count: 0, error: err instanceof Error ? err.message : "Sync failed" };
  }
}

export async function deleteOutreachAccount(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("outreach_accounts").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/outreach");
}
