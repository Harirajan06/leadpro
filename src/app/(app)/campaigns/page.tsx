import { getCampaigns, getCampaignStats } from "@/lib/queries/campaigns";
import { CampaignsView } from "@/components/campaigns/campaigns-view";

export default async function CampaignsPage() {
  const [campaigns, stats] = await Promise.all([getCampaigns(), getCampaignStats()]);
  return <CampaignsView campaigns={campaigns} stats={stats} />;
}
