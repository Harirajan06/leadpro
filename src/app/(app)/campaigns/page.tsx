import { Suspense } from "react";
import { getCampaigns, getCampaignStats } from "@/lib/queries/campaigns";
import { getSequences, getSequenceStats } from "@/lib/queries/outreach";
import { getOutreachAccounts, isUnipileConfigured } from "@/lib/queries/outreach-accounts";
import { getLeads } from "@/lib/queries/leads";
import { CampaignsHub } from "@/components/campaigns/campaigns-hub";

export default async function CampaignsPage() {
  const [campaigns, stats, sequences, seqStats, leads, accounts, unipileReady] = await Promise.all([
    getCampaigns(),
    getCampaignStats(),
    getSequences(),
    getSequenceStats(),
    getLeads(),
    getOutreachAccounts(),
    isUnipileConfigured(),
  ]);

  return (
    <Suspense fallback={null}>
      <CampaignsHub
        outreach={{ sequences, stats: seqStats, leads, accounts, unipileReady }}
        campaigns={{ campaigns, stats }}
      />
    </Suspense>
  );
}
