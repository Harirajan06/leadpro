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

/** Simulates a workflow run end-to-end and writes the result to workflow_executions. */
export async function testRunWorkflow(workflowId: string | null, workflowName: string) {
  const supabase = await createClient();

  // Create execution row
  const result = {
    steps: [
      { name: "New lead via web form", status: "ok", durationMs: 12 },
      { name: "Add lead to CRM", status: "ok", durationMs: 87 },
      { name: "Send Welcome Email", status: "ok", durationMs: 134 },
      { name: "Wait 1 day (simulated)", status: "skipped", durationMs: 0 },
      { name: "Condition: did they open?", status: "ok", branch: "NO", durationMs: 23 },
      { name: "Send Reminder Email", status: "ok", durationMs: 102 },
    ],
    simulated: true,
    workflowName,
  };

  if (workflowId) {
    await supabase.from("workflow_executions").insert({
      workflow_id: workflowId,
      status: "Success",
      result,
      completed_at: new Date().toISOString(),
    });
  }

  revalidatePath("/workflows");
  revalidatePath(`/workflows/builder`);
  return result;
}

export async function getRecentExecutions(workflowId?: string) {
  const supabase = await createClient();
  let query = supabase.from("workflow_executions").select("*").order("started_at", { ascending: false }).limit(20);
  if (workflowId) query = query.eq("workflow_id", workflowId);
  const { data } = await query;
  return data || [];
}
