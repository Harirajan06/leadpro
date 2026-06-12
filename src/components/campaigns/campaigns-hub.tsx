"use client";
import { useState } from "react";
import { Rocket, Mail } from "lucide-react";
import { OutreachView } from "@/components/outreach/outreach-view";
import { CampaignsView } from "@/components/campaigns/campaigns-view";
import type { ComponentProps } from "react";

type OutreachProps = ComponentProps<typeof OutreachView>;
type CampaignsProps = ComponentProps<typeof CampaignsView>;

/**
 * Unified Campaigns screen — merges the old Campaigns and Outreach tabs.
 * "Sequences" (multichannel, actually sends via the job queue) is the primary
 * experience; "Email Campaigns" is the legacy email-only builder.
 */
export function CampaignsHub({ outreach, campaigns }: { outreach: OutreachProps; campaigns: CampaignsProps }) {
  const [tab, setTab] = useState<"sequences" | "email">("sequences");

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex items-center gap-8 border-b border-slate-200 mb-6">
        <button
          onClick={() => setTab("sequences")}
          className={`relative pb-3 text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${
            tab === "sequences" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Rocket className="h-4 w-4" /> Sequences
          {tab === "sequences" && <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-blue-600" />}
        </button>
        <button
          onClick={() => setTab("email")}
          className={`relative pb-3 text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${
            tab === "email" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Mail className="h-4 w-4" /> Email Campaigns
          {tab === "email" && <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-blue-600" />}
        </button>
      </div>

      {tab === "sequences" ? <OutreachView {...outreach} /> : <CampaignsView {...campaigns} />}
    </div>
  );
}
