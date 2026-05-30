import { getLeads, getLeadStats } from "@/lib/queries/leads";
import { LeadsTable } from "@/components/leads/leads-table";

export default async function LeadsPage() {
  const [leads, stats] = await Promise.all([getLeads(), getLeadStats()]);
  return <LeadsTable leads={leads} stats={stats} />;
}
