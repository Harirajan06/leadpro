"use server";
import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  totalLeads: number;
  hotLeads: number;
  avgOpenRate: number;
  conversionRate: number;
  leadGrowth: { date: string; leads: number; hot: number }[];
  campaignPerf: { name: string; openRate: number; replyRate: number }[];
  recentActivities: { id: string; lead: string; action: string; type: string; time: string }[];
  hotLeadAlerts: { name: string; company: string; score: number }[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [{ data: leads }, { data: campaigns }, { data: activities }] = await Promise.all([
    supabase.from("leads").select("id, full_name, company_name, lead_score, status, created_at"),
    supabase.from("campaigns").select("campaign_name, sent_count, open_rate, reply_rate").order("sent_count", { ascending: false }).limit(5),
    supabase.from("lead_activities")
      .select("id, activity_type, created_at, leads(full_name, company_name)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const totalLeads = leads?.length || 0;
  const hotLeads = leads?.filter((l) => l.status === "Hot").length || 0;
  const converted = leads?.filter((l) => l.status === "Converted").length || 0;
  const conversionRate = totalLeads ? Math.round((converted / totalLeads) * 1000) / 10 : 0;

  // Avg open rate from campaigns with sent emails
  const sentCampaigns = (campaigns || []).filter((c) => (c.sent_count || 0) > 0);
  const avgOpenRate = sentCampaigns.length
    ? Math.round(sentCampaigns.reduce((s, c) => s + Number(c.open_rate || 0), 0) / sentCampaigns.length * 10) / 10
    : 0;

  // Group leads by month for growth chart (last 5 months)
  const now = new Date();
  const months: { date: string; leads: number; hot: number }[] = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.getTime();
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1).getTime();
    const monthLeads = (leads || []).filter((l) => {
      const t = new Date(l.created_at).getTime();
      return t >= start && t < end;
    });
    months.push({
      date: MONTHS[d.getMonth()],
      leads: monthLeads.length,
      hot: monthLeads.filter((l) => l.status === "Hot").length,
    });
  }

  const campaignPerf = (campaigns || []).map((c) => ({
    name: c.campaign_name.length > 14 ? c.campaign_name.slice(0, 12) + "…" : c.campaign_name,
    openRate: Math.round(Number(c.open_rate || 0)),
    replyRate: Math.round(Number(c.reply_rate || 0)),
  }));

  const recentActivities = (activities || []).map((a) => ({
    id: a.id,
    // @ts-expect-error joined object
    lead: a.leads?.full_name || a.leads?.company_name || "Unknown",
    action: humanizeAction(a.activity_type),
    type: activityType(a.activity_type),
    time: relativeTime(new Date(a.created_at)),
  }));

  const hotLeadAlerts = (leads || [])
    .filter((l) => l.status === "Hot")
    .sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0))
    .slice(0, 3)
    .map((l) => ({
      name: l.full_name || l.company_name || "—",
      company: l.company_name || "—",
      score: l.lead_score || 0,
    }));

  return {
    totalLeads,
    hotLeads,
    avgOpenRate,
    conversionRate,
    leadGrowth: months,
    campaignPerf,
    recentActivities,
    hotLeadAlerts,
  };
}

function humanizeAction(type: string): string {
  const map: Record<string, string> = {
    PAGE_VISITED: "visited a page",
    EMAIL_OPENED: "opened an email",
    EMAIL_CLICKED: "clicked an email link",
    GUIDE_DOWNLOADED: "downloaded a guide",
    WEBINAR_ATTENDED: "attended a webinar",
    WEBINAR_REGISTERED: "registered for a webinar",
    CONSULTATION_REQUESTED: "booked consultation",
    LEAD_SCORE_UPDATED: "lead score updated",
    LEAD_CREATED: "was added as a lead",
    HOT_LEAD_IDENTIFIED: "became a hot lead",
  };
  return map[type] || type.toLowerCase().replace(/_/g, " ");
}

function activityType(type: string): string {
  if (type.startsWith("EMAIL_")) return "email";
  if (type.includes("PAGE")) return "page";
  if (type.includes("GUIDE") || type.includes("DOWNLOAD")) return "download";
  if (type.includes("WEBINAR")) return "webinar";
  if (type.includes("CONSULTATION") || type.includes("MEETING")) return "meeting";
  if (type.includes("CLICK")) return "click";
  if (type.includes("SCORE")) return "score";
  return "page";
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

// ============================================================================
// Analytics page
// ============================================================================
export async function getAnalyticsStats() {
  const supabase = await createClient();
  const [{ data: campaigns }, { data: leads }, { data: activities }] = await Promise.all([
    supabase.from("campaigns").select("campaign_name, sent_count, open_rate, reply_rate, bounce_rate"),
    supabase.from("leads").select("status, lead_score, created_at"),
    supabase.from("lead_activities").select("activity_type, created_at"),
  ]);

  const allCampaigns = campaigns || [];
  const sentCampaigns = allCampaigns.filter((c) => (c.sent_count || 0) > 0);

  const emailsSent = allCampaigns.reduce((s, c) => s + (c.sent_count || 0), 0);
  const avgOpen = sentCampaigns.length ? sentCampaigns.reduce((s, c) => s + Number(c.open_rate || 0), 0) / sentCampaigns.length : 0;
  const avgReply = sentCampaigns.length ? sentCampaigns.reduce((s, c) => s + Number(c.reply_rate || 0), 0) / sentCampaigns.length : 0;
  const avgClick = avgOpen * 0.25; // approximation

  // Funnel: New / Warm / Hot / Qualified / Converted
  const funnel = ["New", "Warm", "Hot", "Scored", "Converted"].map((stage) => {
    const count = (leads || []).filter((l) => l.status === stage).length;
    return { stage, value: count };
  });

  // Engagement last 7 days
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const engagement: { day: string; opens: number; clicks: number; replies: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const start = new Date(d.setHours(0,0,0,0)).getTime();
    const end = start + 86400000;
    const dayActs = (activities || []).filter((a) => {
      const t = new Date(a.created_at).getTime();
      return t >= start && t < end;
    });
    engagement.push({
      day: days[new Date(start).getDay()],
      opens: dayActs.filter((a) => a.activity_type === "EMAIL_OPENED").length,
      clicks: dayActs.filter((a) => a.activity_type === "EMAIL_CLICKED").length,
      replies: dayActs.filter((a) => a.activity_type === "EMAIL_REPLIED").length,
    });
  }

  // Lead growth (last 5 months)
  const leadGrowth: { date: string; leads: number; hot: number }[] = [];
  const now = new Date();
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.getTime();
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1).getTime();
    const monthLeads = (leads || []).filter((l) => {
      const t = new Date(l.created_at).getTime();
      return t >= start && t < end;
    });
    leadGrowth.push({
      date: MONTHS[d.getMonth()],
      leads: monthLeads.length,
      hot: monthLeads.filter((l) => l.status === "Hot").length,
    });
  }

  const campaignPerf = sentCampaigns.slice(0, 5).map((c) => ({
    name: c.campaign_name.length > 14 ? c.campaign_name.slice(0, 12) + "…" : c.campaign_name,
    openRate: Math.round(Number(c.open_rate || 0)),
    replyRate: Math.round(Number(c.reply_rate || 0)),
  }));

  return {
    emailsSent,
    openRate: Math.round(avgOpen * 10) / 10,
    clickRate: Math.round(avgClick * 10) / 10,
    replyRate: Math.round(avgReply * 10) / 10,
    funnel,
    engagement,
    leadGrowth,
    campaignPerf,
  };
}
