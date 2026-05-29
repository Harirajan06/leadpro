"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Plus, MoreHorizontal, Inbox, BarChart3, Mail, Pause, Play, Copy, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { campaigns } from "@/lib/mock-data";

const statusVariant: Record<string, "success" | "warning" | "default" | "blue"> = {
  Active: "success",
  Paused: "warning",
  Draft: "default",
  Completed: "blue",
};

export default function CampaignsPage() {
  const [tab, setTab] = useState("sequences");

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title="Campaigns"
        description="Manage AI-powered outbound email sequences"
        actions={
          <>
            <Button variant="outline"><Inbox className="h-4 w-4" /> Inbox</Button>
            <Button variant="outline"><BarChart3 className="h-4 w-4" /> Analytics</Button>
            <Link href="/campaigns/builder">
              <Button><Plus className="h-4 w-4" /> New Campaign</Button>
            </Link>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Active campaigns", value: 4, color: "text-emerald-600 bg-emerald-50" },
          { label: "Emails sent", value: "9,517", color: "text-blue-600 bg-blue-50" },
          { label: "Avg. open rate", value: "48.2%", color: "text-purple-600 bg-purple-50" },
          { label: "Avg. reply rate", value: "13.4%", color: "text-amber-600 bg-amber-50" },
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
              <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search campaigns..." />
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
                  <th className="px-4 py-3 font-semibold">Open rate</th>
                  <th className="px-4 py-3 font-semibold">Reply rate</th>
                  <th className="px-4 py-3 font-semibold">Bounce</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href="/campaigns/builder" className="block group">
                        <p className="font-medium text-slate-900 group-hover:text-blue-600">{c.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Modified {c.lastModified}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3"><Badge variant={statusVariant[c.status]}>{c.status}</Badge></td>
                    <td className="px-4 py-3 font-medium text-slate-700">{c.leads.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">{c.sent.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.openRate}%` }} />
                        </div>
                        <span className="text-slate-700 font-medium">{c.openRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-700 font-medium">{c.replyRate}%</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.bounceRate}%</td>
                    <td className="px-4 py-3 text-slate-600">{c.owner}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {c.status === "Active" ? (
                          <Button variant="ghost" size="icon" title="Pause"><Pause className="h-4 w-4" /></Button>
                        ) : (
                          <Button variant="ghost" size="icon" title="Resume"><Play className="h-4 w-4" /></Button>
                        )}
                        <Button variant="ghost" size="icon" title="Duplicate"><Copy className="h-4 w-4" /></Button>
                        <button className="p-1.5 rounded-md hover:bg-slate-100"><MoreHorizontal className="h-4 w-4 text-slate-400" /></button>
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
                  <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
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
