"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Workflow, Play, Pause, FolderOpen, Megaphone, Headphones, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import type { WorkflowRow } from "@/lib/queries/workflows";
import { formatDate } from "@/lib/utils";

const folderIcons: Record<string, React.ReactNode> = {
  "Lead Generation": <Megaphone className="h-4 w-4" />,
  "Marketing": <FileText className="h-4 w-4" />,
  "Customer Support": <Headphones className="h-4 w-4" />,
  "Internal": <FolderOpen className="h-4 w-4" />,
};

export function WorkflowsList({ workflows }: { workflows: (WorkflowRow & { executions: number })[] }) {
  const [activeFolder, setActiveFolder] = useState("All");
  const [search, setSearch] = useState("");

  const folders = [
    { name: "All", icon: <Workflow className="h-4 w-4" />, count: workflows.length },
    { name: "Lead Generation", icon: <Megaphone className="h-4 w-4" />, count: workflows.filter((w) => w.folder === "Lead Generation").length },
    { name: "Marketing", icon: <FileText className="h-4 w-4" />, count: workflows.filter((w) => w.folder === "Marketing").length },
    { name: "Customer Support", icon: <Headphones className="h-4 w-4" />, count: workflows.filter((w) => w.folder === "Customer Support").length },
    { name: "Internal", icon: <FolderOpen className="h-4 w-4" />, count: workflows.filter((w) => w.folder === "Internal").length },
  ];

  const filtered = workflows
    .filter((w) => activeFolder === "All" || w.folder === activeFolder)
    .filter((w) => !search || w.workflow_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title="Automation Workflows"
        description="Build and run AI-powered automations across your customer journey"
        actions={
          <Link href="/workflows/builder">
            <Button><Plus className="h-4 w-4" /> Create Workflow</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <Card className="p-3 h-fit">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1.5">Folders</p>
          <ul className="space-y-0.5 mt-1">
            {folders.map((f) => (
              <li key={f.name}>
                <button
                  onClick={() => setActiveFolder(f.name)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFolder === f.name ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">{f.icon} {f.name}</span>
                  <span className="text-xs text-slate-400">{f.count}</span>
                </button>
              </li>
            ))}
            <li className="pt-2 mt-2 border-t border-slate-100">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50">
                <Plus className="h-4 w-4" /> New folder
              </button>
            </li>
          </ul>
        </Card>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 max-w-md">
              <Input
                leftIcon={<Search className="h-4 w-4" />}
                placeholder="Search workflows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card className="p-12 text-center text-slate-500">
              No workflows in this folder. Click <strong>Create Workflow</strong> to add one.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((w) => (
                <Link key={w.id} href={`/workflows/builder?id=${w.id}`}>
                  <Card className="p-5 hover:shadow-md hover:border-blue-200 transition-all h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        {folderIcons[w.folder] || <Workflow className="h-4.5 w-4.5" />}
                      </div>
                      <Badge variant={w.status === "Active" ? "success" : w.status === "Paused" ? "warning" : "default"}>
                        {w.status === "Active" ? <Play className="h-2.5 w-2.5" /> : w.status === "Paused" ? <Pause className="h-2.5 w-2.5" /> : null}
                        {w.status}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-slate-900 mb-1">{w.workflow_name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{w.description || "—"}</p>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400">Folder</p>
                        <p className="text-xs font-medium text-slate-700">{w.folder}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Runs</p>
                        <p className="text-xs font-medium text-slate-700">{w.executions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Updated</p>
                        <p className="text-xs font-medium text-slate-700">{formatDate(w.updated_at)}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
