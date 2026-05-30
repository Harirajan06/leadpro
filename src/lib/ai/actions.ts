"use server";
import { aiChat, aiJson, aiConfigured } from "./client";
import { getLeadById } from "@/lib/queries/leads";

export async function isAiConfigured() {
  return aiConfigured;
}

// ============================================================================
// AI Email Sequence Generation
// ============================================================================
export interface GeneratedEmail {
  day: string;
  subject: string;
  body: string;
}

export async function generateEmailSequence(goal: string, audience?: string): Promise<GeneratedEmail[]> {
  const system = `You are an expert B2B sales copywriter. You write concise, personalized cold email sequences that get replies. Use merge tags like {{firstName}}, {{companyName}}, and {{industry}} where personalization helps. Keep each email under 120 words. Return ONLY valid JSON.`;

  const prompt = `Write a 3-step cold email sequence for this campaign goal: "${goal}"${audience ? `\nTarget audience: ${audience}` : ""}

Return JSON in exactly this shape:
{
  "emails": [
    { "day": "Day 1", "subject": "...", "body": "..." },
    { "day": "Day 3", "subject": "...", "body": "..." },
    { "day": "Day 7", "subject": "...", "body": "..." }
  ]
}`;

  const result = await aiJson<{ emails: GeneratedEmail[] }>({ system, prompt, temperature: 0.8 });
  return result.emails || [];
}

// ============================================================================
// AI Lead Scoring + Insights
// ============================================================================
export interface AiScoreResult {
  overallScore: number;
  dimensions: {
    companyFit: number;
    contactAccess: number;
    opportunityQuality: number;
    competitivePosition: number;
  };
  insight: string;
  outreachReadiness: "High" | "Medium" | "Low";
  expectedSalesCycle: string;
  nextSteps: { priority: "Now" | "This week" | "Watch"; action: string; impact: "High" | "Medium" | "Low" }[];
}

export async function scoreLeadWithAi(leadId: string): Promise<AiScoreResult> {
  const lead = await getLeadById(leadId);
  if (!lead) throw new Error("Lead not found");

  const system = `You are an AI sales-intelligence engine. You evaluate B2B sales leads and return a structured score. Be realistic and concise. Return ONLY valid JSON. Do NOT invent specific facts (exact revenue, funding, employee counts) — reason only from the data provided and clearly general industry knowledge.`;

  const prompt = `Score this lead for a B2B AI/SaaS sales team.

Lead data:
- Name: ${lead.full_name || "(company lead)"}
- Company: ${lead.company_name || "unknown"}
- Industry: ${lead.industry || "unknown"}
- Interest area: ${lead.interest_area || "unknown"}
- Source: ${lead.source || "unknown"}
- Current status: ${lead.status}
- Existing engagement score: ${lead.lead_score}/100
- Website: ${lead.website_url || "none"}

Return JSON in exactly this shape (all scores 0-100 integers):
{
  "overallScore": 0,
  "dimensions": { "companyFit": 0, "contactAccess": 0, "opportunityQuality": 0, "competitivePosition": 0 },
  "insight": "2-3 sentence analysis of buying intent and fit",
  "outreachReadiness": "High|Medium|Low",
  "expectedSalesCycle": "e.g. 30-45 days",
  "nextSteps": [
    { "priority": "Now|This week|Watch", "action": "specific recommended action", "impact": "High|Medium|Low" }
  ]
}`;

  return aiJson<AiScoreResult>({ system, prompt, temperature: 0.5 });
}

// ============================================================================
// AI Company Intelligence (clearly labeled as AI estimate)
// ============================================================================
export interface AiCompanyIntel {
  estimatedType: string;
  estimatedSize: string;
  signals: { title: string; description: string; level: "Strong" | "Medium" | "Watch" }[];
  summary: string;
}

export async function generateCompanyIntel(leadId: string): Promise<AiCompanyIntel> {
  const lead = await getLeadById(leadId);
  if (!lead) throw new Error("Lead not found");

  const system = `You are a B2B research assistant. Generate plausible company intelligence ESTIMATES based on the industry and company name. Be clear these are AI estimates, not verified facts. Return ONLY valid JSON.`;

  const prompt = `Generate estimated company intelligence for "${lead.company_name || "this company"}" in the ${lead.industry || "technology"} industry.

Return JSON:
{
  "estimatedType": "e.g. Private SaaS",
  "estimatedSize": "e.g. 50-200 employees",
  "signals": [
    { "title": "short signal", "description": "why it matters for sales", "level": "Strong|Medium|Watch" }
  ],
  "summary": "2 sentence strategic summary"
}`;

  return aiJson<AiCompanyIntel>({ system, prompt, temperature: 0.6 });
}

// ============================================================================
// Single email regeneration / improvement
// ============================================================================
export async function improveEmail(currentBody: string, instruction: string): Promise<string> {
  return aiChat({
    system: "You are an expert sales copywriter. Rewrite the email per the instruction. Keep merge tags like {{firstName}}. Return only the rewritten email body, no preamble.",
    prompt: `Current email:\n${currentBody}\n\nInstruction: ${instruction}`,
    temperature: 0.7,
  });
}
