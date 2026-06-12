"use client";
import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, MoreHorizontal, Inbox, BarChart3, Mail, Pause, Play, Copy, Trash2, Pencil, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { useFeedback } from "@/components/ui/feedback";
import { setCampaignStatus, deleteCampaign, duplicateCampaign, type CampaignRow } from "@/lib/queries/campaigns";
import { formatDate } from "@/lib/utils";

function todayStr() { const d = new window.Date(); return d.toISOString().slice(0,10); }

const statusVariant: Record<string, "success" | "warning" | "default" | "blue"> = {
  Active: "success",
  Paused: "warning",
  Draft: "default",
  Completed: "blue",
};

export function CampaignsView({ campaigns, stats }: {
  campaigns: CampaignRow[];
  stats: { active: number; totalSent: number; avgOpen: number; avgReply: number };
}) {
  const { confirm } = useFeedback();
  const [tab, setTab] = useState("sequences");
  const [pending, start] = useTransition();
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const filtered = campaigns.filter((c) => !search || c.campaign_name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!openId) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenId(null);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openId]);

  function toggleStatus(c: CampaignRow) {
    start(async () => {
      await setCampaignStatus(c.id, c.status === "Active" ? "Paused" : "Active");
    });
  }
  async function handleDelete(id: string) {
    if (!(await confirm({ title: "Delete campaign?", message: "Delete this campaign?", confirmLabel: "Delete", danger: true }))) return;
    start(async () => { await deleteCampaign(id); });
  }
  function handleDuplicate(id: string) {
    setOpenId(null);
    start(async () => { await duplicateCampaign(id); });
  }
  function handleExport(c: CampaignRow) {
    setOpenId(null);
    const headers = ["Name", "Status", "Sent", "Open Rate", "Reply Rate", "Bounce Rate"];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const row = [
      esc(c.campaign_name),
      esc(c.status),
      String(c.sent_count ?? 0),
      `${Number(c.open_rate || 0)}%`,
      `${Number(c.reply_rate || 0)}%`,
      `${Number(c.bounce_rate || 0)}%`,
    ];
    const csv = headers.map(esc).join(",") + "\n" + row.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${c.campaign_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${todayStr()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title="Campaigns"
        description="Manage AI-powered outbound email sequences"
        actions={
          <>
            <Link href="/inbox"><Button variant="outline"><Inbox className="h-4 w-4" /> Inbox</Button></Link>
            <Link href="/analytics"><Button variant="outline"><BarChart3 className="h-4 w-4" /> Analytics</Button></Link>
            <Link href="/campaigns/builder">
              <Button><Plus className="h-4 w-4" /> New Campaign</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Active campaigns", value: stats.active },
          { label: "Emails sent", value: stats.totalSent.toLocaleString() },
          { label: "Avg. open rate", value: `${stats.avgOpen}%` },
          { label: "Avg. reply rate", value: `${stats.avgReply}%` },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "sequences", label: "Sequences", icon: <Mail className="h-4 w-4" /> },
          { id: "accounts", label: "Email Accounts" },
          { id: "blocklist", label: "Blocklist" },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-4"
      />

      {tab === "sequences" && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="flex-1 max-w-md">
              <Input
                leftIcon={<Search className="h-4 w-4" />}
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-semibold">Campaign</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Sent</th>
                  <th className="px-4 py-3 font-semibold">Open rate</th>
                  <th className="px-4 py-3 font-semibold">Reply rate</th>
                  <th className="px-4 py-3 font-semibold">Bounce</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-slate-500">No campaigns yet. Click <strong>New Campaign</strong> to create one.</td></tr>
                )}
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/campaigns/builder?id=${c.id}`} className="block group">
                        <p className="font-medium text-slate-900 group-hover:text-blue-600">{c.campaign_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Modified {formatDate(c.updated_at)}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[c.status] || "default"}>{c.status}</Badge></td>
                    <td className="px-4 py-3 text-slate-600">{c.sent_count.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.open_rate}%` }} />
                        </div>
                        <span className="text-slate-700 font-medium">{Number(c.open_rate || 0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-emerald-700 font-medium">{Number(c.reply_rate || 0)}%</span></td>
                    <td className="px-4 py-3 text-slate-600">{Number(c.bounce_rate || 0)}%</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {c.status === "Active" ? (
                          <Button variant="ghost" size="icon" title="Pause" onClick={() => toggleStatus(c)} disabled={pending}><Pause className="h-4 w-4" /></Button>
                        ) : c.status === "Paused" ? (
                          <Button variant="ghost" size="icon" title="Resume" onClick={() => toggleStatus(c)} disabled={pending}><Play className="h-4 w-4" /></Button>
                        ) : null}
                        <Button variant="ghost" size="icon" title="Duplicate" onClick={() => handleDuplicate(c.id)} disabled={pending}><Copy className="h-4 w-4" /></Button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 disabled:opacity-50" disabled={pending}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="relative" ref={openId === c.id ? menuRef : undefined}>
                          <button
                            className="p-1.5 rounded-md hover:bg-slate-100"
                            onClick={() => setOpenId(openId === c.id ? null : c.id)}
                            aria-haspopup="menu"
                            aria-expanded={openId === c.id}
                          >
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </button>
                          {openId === c.id && (
                            <div role="menu" className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-sm">
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                onClick={() => { setOpenId(null); router.push(`/campaigns/builder?id=${c.id}`); }}
                              >
                                <Pencil className="h-4 w-4" /> Edit
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 disabled:opacity-50"
                                onClick={() => handleDuplicate(c.id)}
                                disabled={pending}
                              >
                                <Copy className="h-4 w-4" /> Duplicate
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                onClick={() => handleExport(c)}
                              >
                                <Download className="h-4 w-4" /> Export stats CSV
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 disabled:opacity-50"
                                onClick={() => { setOpenId(null); handleDelete(c.id); }}
                                disabled={pending}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "accounts" && (
        <Card className="p-5">
          <div className="space-y-3">
            {[
              { email: "anu@leadpro.ai", name: "Anuradha Ramachandran", status: "Verified", sent: "284 today" },
              { email: "james@leadpro.ai", name: "James Wilson", status: "Verified", sent: "192 today" },
              { email: "sales@leadpro.ai", name: "Sales Team", status: "Warming up", sent: "47 today" },
            ].map((a) => (
              <div key={a.email} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Mail className="h-4 w-4" /></div>
                  <div>
                    <p className="font-medium text-slate-900">{a.email}</p>
                    <p className="text-xs text-slate-500">{a.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">{a.sent}</span>
                  <Badge variant={a.status === "Verified" ? "success" : "warning"}>{a.status}</Badge>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full"><Plus className="h-4 w-4" /> Connect new email account</Button>
          </div>
        </Card>
      )}

      {tab === "blocklist" && (
        <Card className="p-5">
          <div className="mb-4">
            <Input placeholder="Add email or domain to block..." />
          </div>
          <div className="space-y-2">
            {["competitor.com", "@example.org", "spam@bad.com", "@blocked-domain.io"].map((b) => (
              <div key={b} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <code className="text-sm text-slate-700">{b}</code>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-600" /></Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
