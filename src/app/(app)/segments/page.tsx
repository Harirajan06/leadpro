"use client";
import Link from "next/link";
import { Plus, Send, Workflow, Download, RefreshCw, UserPlus, Sparkles, Tags, MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { segments } from "@/lib/mock-data";

const typeColor: Record<string, "blue" | "purple" | "pink"> = {
  Dynamic: "blue",
  Behavioral: "purple",
  Engagement: "pink",
};

const statusColor: Record<string, "success" | "warning" | "default"> = {
  Active: "success",
  Paused: "warning",
  Draft: "default",
};

export default function SegmentsPage() {
  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title="Audience Segments"
        description="Organize leads into targeted groups for personalized campaigns"
        actions={
          <Link href="/segments/builder">
            <Button><Plus className="h-4 w-4" /> Create Segment</Button>
          </Link>
        }
      />

      {/* Bulk action toolbar */}
      <Card className="p-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs text-slate-500 mr-2 pl-2">Quick actions:</p>
          {[
            { label: "Send campaign", icon: <Send className="h-3.5 w-3.5" /> },
            { label: "Start workflow", icon: <Workflow className="h-3.5 w-3.5" /> },
            { label: "Export CSV", icon: <Download className="h-3.5 w-3.5" /> },
            { label: "Sync to CRM", icon: <RefreshCw className="h-3.5 w-3.5" /> },
            { label: "Assign sales rep", icon: <UserPlus className="h-3.5 w-3.5" /> },
            { label: "AI recommendation", icon: <Sparkles className="h-3.5 w-3.5" /> },
            { label: "Add tags", icon: <Tags className="h-3.5 w-3.5" /> },
          ].map((a) => (
            <button key={a.label} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-slate-700 hover:bg-slate-100">
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="flex-1 max-w-md">
            <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search segments..." />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-3 font-semibold">Segment</th>
                <th className="px-4 py-3 font-semibold">Contacts</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {segments.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                  <td className="px-4 py-3">
                    <Link href="/segments/builder" className="block group">
                      <p className="font-medium text-slate-900 group-hover:text-blue-600">{s.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900">{s.contacts.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3"><Badge variant={typeColor[s.type]}>{s.type}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={statusColor[s.status]}>{s.status}</Badge></td>
                  <td className="px-4 py-3 text-slate-500">{s.createdOn}</td>
                  <td className="px-4 py-3">
                    <button className="p-1 rounded-md hover:bg-slate-100">
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </button>
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
