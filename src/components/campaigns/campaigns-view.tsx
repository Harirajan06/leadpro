"use client";
import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Mail, Rocket, Pause, Play, Copy, Trash2, Pencil, Search, LayoutTemplate, ChevronDown } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useFeedback } from "@/components/ui/feedback";
import { setCampaignStatus, deleteCampaign, duplicateCampaign, type CampaignRow } from "@/lib/queries/campaigns";
import { setSequenceStatus, deleteSequence, duplicateSequence, type OutreachSequenceRow } from "@/lib/queries/outreach";
import { campaignTemplates } from "@/lib/campaign-templates";
import { formatDate } from "@/lib/utils";

const statusVariant: Record<string, "success" | "warning" | "default" | "blue"> = {
  Active: "success",
  Paused: "warning",
  Draft: "default",
  Completed: "blue",
};

const STATUS_FILTERS = ["All", "Active", "Paused", "Draft", "Completed"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

interface UnifiedRow {
  id: string;
  name: string;
  kind: "email" | "sequence";
  channel?: string;
  status: string;
  leads: number | null;
  sent: number;
  openRate: number | null;
  replyRate: number;
  updatedAt: string;
  href: string;
}

export function CampaignsView({
  campaigns,
  sequences,
  cStats,
  sStats,
}: {
  campaigns: CampaignRow[];
  sequences: OutreachSequenceRow[];
  cStats: { active: number; totalSent: number; avgOpen: number; avgReply: number };
  sStats: { active: number; enrolled: number; sent: number; replyRate: number };
}) {
  const { confirm } = useFeedback();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const tplRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (openId && menuRef.current && !menuRef.current.contains(t)) setOpenId(null);
      if (templatesOpen && tplRef.current && !tplRef.current.contains(t)) setTemplatesOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openId, templatesOpen]);

  // Merge both campaign types into one normalized list (Dripify shows one list).
  const rows: UnifiedRow[] = [
    ...campaigns.map((c): UnifiedRow => ({
      id: c.id,
      name: c.campaign_name,
      kind: "email",
      status: c.status,
      leads: null,
      sent: c.sent_count || 0,
      openRate: Number(c.open_rate || 0),
      replyRate: Number(c.reply_rate || 0),
      updatedAt: c.updated_at,
      href: `/campaigns/builder?id=${c.id}`,
    })),
    ...sequences.map((s): UnifiedRow => ({
      id: s.id,
      name: s.name,
      kind: "sequence",
      channel: s.channel,
      status: s.status,
      leads: s.enrolled_count || 0,
      sent: s.sent_count || 0,
      openRate: null,
      replyRate: s.sent_count ? Math.round((s.reply_count / s.sent_count) * 1000) / 10 : 0,
      updatedAt: s.updated_at,
      href: `/outreach/builder?id=${s.id}`,
    })),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const counts = STATUS_FILTERS.reduce((acc, f) => {
    acc[f] = f === "All" ? rows.length : rows.filter((r) => r.status === f).length;
    return acc;
  }, {} as Record<StatusFilter, number>);

  const filtered = rows.filter((r) => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "All" || r.status === filter;
    return matchSearch && matchStatus;
  });

  function toggleStatus(r: UnifiedRow) {
    setOpenId(null);
    const next = r.status === "Active" ? "Paused" : "Active";
    start(async () => {
      if (r.kind === "email") await setCampaignStatus(r.id, next);
      else await setSequenceStatus(r.id, next);
    });
  }
  async function handleDelete(r: UnifiedRow) {
    setOpenId(null);
    if (!(await confirm({ title: "Delete campaign?", message: `Delete “${r.name}”? This can't be undone.`, confirmLabel: "Delete", danger: true }))) return;
    start(async () => {
      if (r.kind === "email") await deleteCampaign(r.id);
      else await deleteSequence(r.id);
    });
  }
  function handleDuplicate(r: UnifiedRow) {
    setOpenId(null);
    start(async () => {
      if (r.kind === "email") await duplicateCampaign(r.id);
      else await duplicateSequence(r.id);
    });
  }

  const statCards = [
    { label: "Active campaigns", value: cStats.active + sStats.active },
    { label: "Messages sent", value: (cStats.totalSent + sStats.sent).toLocaleString() },
    { label: "Avg. open rate", value: `${cStats.avgOpen}%` },
    { label: "Avg. reply rate", value: `${cStats.avgReply || sStats.replyRate}%` },
  ];

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title="Campaigns"
        description="Create, launch and track your outreach — email or multichannel."
        actions={
          <>
            <Link href="/outreach/builder">
              <Button variant="outline"><Rocket className="h-4 w-4" /> New sequence</Button>
            </Link>
            <Link href="/campaigns/builder">
              <Button><Plus className="h-4 w-4" /> New Campaign</Button>
            </Link>
          </>
        }
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Campaign list — one list, status select + templates dropdown */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          {/* Status select — pick a status to see Active / Completed / etc. */}
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as StatusFilter)}
            className="max-w-[200px]"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f} value={f}>{f === "All" ? "All statuses" : f} ({counts[f]})</option>
            ))}
          </Select>

          <div className="ml-auto flex items-center gap-2 w-full sm:w-auto">
            {/* Templates button → dropdown of pre-built templates */}
            <div className="relative" ref={tplRef}>
              <Button variant="outline" onClick={() => setTemplatesOpen((v) => !v)}>
                <LayoutTemplate className="h-4 w-4" /> Templates <ChevronDown className={`h-3.5 w-3.5 transition-transform ${templatesOpen ? "rotate-180" : ""}`} />
              </Button>
              {templatesOpen && (
                <div className="lp-anim-pop origin-top-right absolute right-0 top-full mt-1 z-20 w-72 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden p-1">
                  <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Start from a template</p>
                  <div className="max-h-80 overflow-y-auto">
                    {campaignTemplates.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => { setTemplatesOpen(false); router.push(`/campaigns/builder?template=${t.id}`); }}
                          className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-slate-50"
                        >
                          <span className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${t.accent}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-slate-900">{t.name} <span className="text-[11px] font-normal text-slate-400">· {t.steps.length} steps</span></span>
                            <span className="block text-xs text-slate-500 line-clamp-1">{t.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <Link href="/campaigns/builder" onClick={() => setTemplatesOpen(false)} className="block px-3 py-2 mt-1 border-t border-slate-100 text-sm font-medium text-blue-600 hover:bg-slate-50">
                    Start blank →
                  </Link>
                </div>
              )}
            </div>

            <div className="flex-1 sm:w-64">
              <Input
                leftIcon={<Search className="h-4 w-4" />}
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-semibold">Campaign</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Leads</th>
                <th className="px-4 py-3 font-semibold">Sent</th>
                <th className="px-4 py-3 font-semibold">Open</th>
                <th className="px-4 py-3 font-semibold">Reply</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                    No campaigns {filter !== "All" ? `with status “${filter}”` : "yet"}. Click <strong>New Campaign</strong> or pick a template above.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={`${r.kind}-${r.id}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={r.href} className="flex items-center gap-3 group">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${r.kind === "email" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                        {r.kind === "email" ? <Mail className="h-4.5 w-4.5" /> : <Rocket className="h-4.5 w-4.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 group-hover:text-blue-600 truncate">{r.name}</p>
                        <p className="text-xs text-slate-400">
                          {r.kind === "email" ? "Email campaign" : `Sequence · ${r.channel}`} · {formatDate(r.updatedAt)}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[r.status] || "default"}>{r.status}</Badge></td>
                  <td className="px-4 py-3 text-slate-600">{r.leads === null ? "—" : r.leads.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-600">{r.sent.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-600">{r.openRate === null ? "—" : `${r.openRate}%`}</td>
                  <td className="px-4 py-3"><span className="text-emerald-700 font-medium">{r.replyRate}%</span></td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() => setOpenId(openId === r.id ? null : r.id)}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                      aria-label="Campaign actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openId === r.id && (
                      <div ref={menuRef} className="lp-anim-pop origin-top-right absolute right-2 top-full z-20 w-44 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden p-1">
                        <Link href={r.href} onClick={() => setOpenId(null)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50">
                          <Pencil className="h-4 w-4 text-slate-400" /> Edit
                        </Link>
                        <button onClick={() => toggleStatus(r)} disabled={pending} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50">
                          {r.status === "Active" ? <><Pause className="h-4 w-4 text-slate-400" /> Pause</> : <><Play className="h-4 w-4 text-slate-400" /> Resume</>}
                        </button>
                        <button onClick={() => handleDuplicate(r)} disabled={pending} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50">
                          <Copy className="h-4 w-4 text-slate-400" /> Duplicate
                        </button>
                        <button onClick={() => handleDelete(r)} disabled={pending} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
