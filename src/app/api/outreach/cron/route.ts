import { NextResponse, type NextRequest } from "next/server";
import { processDueJobs } from "@/lib/outreach/processor";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Drains the outreach job queue. Called every minute by Supabase pg_cron
 * (see supabase/migrations/0017_outreach_real.sql) with:
 *   Authorization: Bearer <OUTREACH_CRON_SECRET>
 */
async function run(request: NextRequest) {
  const secret = process.env.OUTREACH_CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await processDueJobs(50);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Processing failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return run(request);
}

// GET allowed too, for easy manual testing with curl.
export async function GET(request: NextRequest) {
  return run(request);
}
