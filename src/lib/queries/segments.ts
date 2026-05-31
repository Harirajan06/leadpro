"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SegmentRow {
  id: string;
  segment_name: string;
  description: string | null;
  segment_type: string;
  status: string;
  logic_type: string;
  created_at: string;
  updated_at: string;
}

export interface SegmentRule {
  id: string;
  segment_id: string;
  field: string;
  operator: string;
  value: string | null;
  rule_order: number;
}

export async function getSegments(): Promise<(SegmentRow & { contacts: number })[]> {
  const supabase = await createClient();
  const { data: segments } = await supabase
    .from("segments")
    .select("*")
    .order("created_at", { ascending: false });
  if (!segments) return [];

  // Count members per segment
  const counts = await Promise.all(
    segments.map(async (s) => {
      const { count } = await supabase
        .from("segment_members")
        .select("*", { count: "exact", head: true })
        .eq("segment_id", s.id);
      return count || 0;
    })
  );

  return segments.map((s, i) => ({ ...s, contacts: counts[i] }));
}

export async function getSegmentWithRules(id: string) {
  const supabase = await createClient();
  const { data: segment } = await supabase.from("segments").select("*").eq("id", id).single();
  const { data: rules } = await supabase
    .from("segment_rules")
    .select("*")
    .eq("segment_id", id)
    .order("rule_order");
  return { segment, rules: rules || [] };
}

export async function createSegment(name: string, description: string, type: string, rules: Omit<SegmentRule, "id" | "segment_id">[]) {
  const supabase = await createClient();
  const { data: segment, error } = await supabase
    .from("segments")
    .insert({ segment_name: name, description, segment_type: type, status: "Active" })
    .select()
    .single();
  if (error) throw error;

  if (rules.length > 0) {
    await supabase.from("segment_rules").insert(
      rules.map((r) => ({ segment_id: segment.id, ...r }))
    );
  }

  revalidatePath("/segments");
  return segment;
}

export async function deleteSegment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("segments").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/segments");
}

function csvEscape(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export async function exportSegmentCsv(segmentId: string): Promise<{ filename: string; csv: string }> {
  const supabase = await createClient();
  const { data: segment } = await supabase
    .from("segments")
    .select("segment_name")
    .eq("id", segmentId)
    .single();

  const segmentName = segment?.segment_name || "segment";

  const { data: members } = await supabase
    .from("segment_members")
    .select("leads(full_name, email, company_name, industry, lead_score, status)")
    .eq("segment_id", segmentId);

  const header = ["Name", "Email", "Company", "Industry", "Score", "Status"].join(",");
  const rows = (members || []).map((m) => {
    const lead = (m as { leads?: { full_name?: string; email?: string; company_name?: string; industry?: string; lead_score?: number; status?: string } }).leads;
    return [
      csvEscape(lead?.full_name),
      csvEscape(lead?.email),
      csvEscape(lead?.company_name),
      csvEscape(lead?.industry),
      csvEscape(lead?.lead_score),
      csvEscape(lead?.status),
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");
  const filename = segmentName.toLowerCase().replace(/\s+/g, "-") + ".csv";
  return { filename, csv };
}
