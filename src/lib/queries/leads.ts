"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface LeadRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  industry: string | null;
  interest_area: string | null;
  source: string | null;
  message: string | null;
  linkedin: string | null;
  website_url: string | null;
  lead_score: number;
  status: string;
  verified: boolean;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function getLeads(): Promise<LeadRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getLeads error:", error);
    return [];
  }
  return data ?? [];
}

export async function getLeadById(id: string): Promise<LeadRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("leads").select("*").eq("id", id).single();
  return data;
}

export async function getLeadStats() {
  const supabase = await createClient();
  const { data } = await supabase.from("leads").select("status, lead_score");
  if (!data) return { total: 0, hot: 0, scored: 0, converted: 0 };
  return {
    total: data.length,
    hot: data.filter((l) => l.status === "Hot").length,
    scored: data.filter((l) => l.lead_score > 0).length,
    converted: data.filter((l) => l.status === "Converted").length,
  };
}

export async function createLead(payload: Partial<LeadRow>) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("leads").insert(payload).select().single();
  if (error) throw error;
  revalidatePath("/leads");
  return data;
}

export async function updateLead(id: string, payload: Partial<LeadRow>) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update(payload).eq("id", id);
  if (error) throw error;
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/leads");
}

export async function bulkDeleteLeads(ids: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().in("id", ids);
  if (error) throw error;
  revalidatePath("/leads");
}

export async function bulkInsertLeads(
  leads: Array<Partial<LeadRow>>
): Promise<{ inserted: number; error?: string }> {
  if (!leads.length) return { inserted: 0 };
  const supabase = await createClient();
  const rows = leads.map((l) => ({
    full_name: l.full_name ?? null,
    email: l.email ?? null,
    phone: l.phone ?? null,
    company_name: l.company_name ?? null,
    industry: l.industry ?? null,
    interest_area: l.interest_area ?? null,
    linkedin: l.linkedin ?? null,
    website_url: l.website_url ?? null,
    source: "CSV Upload",
    status: "New",
  }));
  const { data, error } = await supabase.from("leads").insert(rows).select("id");
  if (error) {
    console.error("bulkInsertLeads error:", error);
    return { inserted: 0, error: error.message };
  }
  revalidatePath("/leads");
  return { inserted: data?.length ?? 0 };
}
