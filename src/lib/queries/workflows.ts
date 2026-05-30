"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface WorkflowRow {
  id: string;
  workflow_name: string;
  description: string | null;
  folder: string;
  status: string;
  config: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export async function getWorkflows(): Promise<(WorkflowRow & { executions: number })[]> {
  const supabase = await createClient();
  const { data: workflows } = await supabase.from("workflows").select("*").order("updated_at", { ascending: false });
  if (!workflows) return [];
  const counts = await Promise.all(
    workflows.map(async (w) => {
      const { count } = await supabase
        .from("workflow_executions")
        .select("*", { count: "exact", head: true })
        .eq("workflow_id", w.id);
      return count || 0;
    })
  );
  return workflows.map((w, i) => ({ ...w, executions: counts[i] }));
}

export async function getWorkflowById(id: string): Promise<WorkflowRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("workflows").select("*").eq("id", id).single();
  return data;
}

export async function createWorkflow(payload: Partial<WorkflowRow>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workflows")
    .insert({ workflow_name: payload.workflow_name || "Untitled Workflow", folder: "Lead Generation", status: "Draft", ...payload })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/workflows");
  return data;
}

export async function updateWorkflow(id: string, payload: Partial<WorkflowRow>) {
  const supabase = await createClient();
  const { error } = await supabase.from("workflows").update(payload).eq("id", id);
  if (error) throw error;
  revalidatePath("/workflows");
}

export async function deleteWorkflow(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("workflows").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/workflows");
}
