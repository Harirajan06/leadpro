import { getWorkflows } from "@/lib/queries/workflows";
import { WorkflowsList } from "@/components/workflows/workflows-list";

export default async function WorkflowsPage() {
  const workflows = await getWorkflows();
  return <WorkflowsList workflows={workflows} />;
}
