"use server";
import { createClient } from "@supabase/supabase-js";

/**
 * Public lead capture (no auth required).
 * Uses the anon key — RLS policy "Anon can capture leads" enforces validation.
 */
export async function capturePublicLead(payload: {
  fullName?: string;
  companyName?: string;
  email: string;
  phone?: string;
  websiteUrl?: string;
  industry?: string;
  interestArea?: string;
  message?: string;
  linkedin?: string;
}) {
  if (!payload.fullName && !payload.companyName) {
    return { ok: false, error: "Name or company is required" };
  }
  if (!payload.email && !payload.websiteUrl) {
    return { ok: false, error: "Email or website is required" };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase
    .from("leads")
    .insert({
      full_name: payload.fullName?.trim() || null,
      company_name: payload.companyName?.trim() || null,
      email: payload.email?.trim().toLowerCase() || null,
      phone: payload.phone?.trim() || null,
      website_url: payload.websiteUrl?.trim() || null,
      industry: payload.industry || null,
      interest_area: payload.interestArea || null,
      message: payload.message?.trim() || null,
      linkedin: payload.linkedin?.trim() || null,
      source: "Public Capture Form",
      status: "New",
      lead_score: 0,
    });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
