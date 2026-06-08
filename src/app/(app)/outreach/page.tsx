import { Suspense } from "react";
import { getSequences, getSequenceStats } from "@/lib/queries/outreach";
import { getOutreachAccounts, isUnipileConfigured } from "@/lib/queries/outreach-accounts";
import { getLeads } from "@/lib/queries/leads";
import { OutreachView } from "@/components/outreach/outreach-view";

export default async function OutreachPage() {
  const [sequences, stats, leads, accounts, unipileReady] = await Promise.all([
    getSequences(),
    getSequenceStats(),
    getLeads(),
    getOutreachAccounts(),
    isUnipileConfigured(),
  ]);
  return (
    <Suspense fallback={null}>
      <OutreachView sequences={sequences} stats={stats} leads={leads} accounts={accounts} unipileReady={unipileReady} />
    </Suspense>
  );
}
