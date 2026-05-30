"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface InboxMessage {
  id: string;
  lead_id: string | null;
  campaign_id: string | null;
  direction: string;
  subject: string | null;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

export interface InboxConversation extends InboxMessage {
  lead_name: string | null;
  lead_company: string | null;
  campaign_name: string | null;
}

export async function getInboxConversations(): Promise<InboxConversation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inbox_messages")
    .select(`
      *,
      leads(full_name, company_name),
      campaigns(campaign_name)
    `)
    .eq("direction", "inbound")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((m) => {
    const leads = (m as { leads?: { full_name?: string; company_name?: string } }).leads;
    const campaigns = (m as { campaigns?: { campaign_name?: string } }).campaigns;
    return {
      id: m.id,
      lead_id: m.lead_id,
      campaign_id: m.campaign_id,
      direction: m.direction,
      subject: m.subject,
      body: m.body,
      is_read: m.is_read,
      created_at: m.created_at,
      lead_name: leads?.full_name || leads?.company_name || "Unknown",
      lead_company: leads?.company_name || null,
      campaign_name: campaigns?.campaign_name || null,
    };
  });
}

export async function getInboxThread(leadId: string): Promise<InboxMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inbox_messages")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });
  return data || [];
}

export async function markRead(id: string) {
  const supabase = await createClient();
  await supabase.from("inbox_messages").update({ is_read: true }).eq("id", id);
  revalidatePath("/inbox");
}

export async function sendReply(leadId: string, subject: string, body: string) {
  const supabase = await createClient();
  await supabase.from("inbox_messages").insert({
    lead_id: leadId,
    direction: "outbound",
    subject,
    body,
    is_read: true,
  });
  revalidatePath("/inbox");
}
