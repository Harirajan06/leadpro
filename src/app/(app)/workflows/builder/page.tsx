"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Play, Zap, Mail, Clock, GitBranch, UserPlus, Bell, RefreshCw, FileDown, MessageSquare, Settings, ScrollText, Plus, AlertCircle } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { createWorkflow } from "@/lib/queries/workflows";

const palette = [
  { group: "Triggers", color: "border-emerald-200 bg-emerald-50 text-emerald-700", items: [
    { icon: <FileDown className="h-3.5 w-3.5" />, label: "New Lead (Form)" },
    { icon: <Zap className="h-3.5 w-3.5" />, label: "Guide Downloaded" },
    { icon: <UserPlus className="h-3.5 w-3.5" />, label: "Webinar Registered" },
  ]},
  { group: "Actions", color: "border-blue-200 bg-blue-50 text-blue-700", items: [
    { icon: <Mail className="h-3.5 w-3.5" />, label: "Send Email" },
    { icon: <RefreshCw className="h-3.5 w-3.5" />, label: "Add to CRM" },
    { icon: <Bell className="h-3.5 w-3.5" />, label: "Notify Team" },
    { icon: <UserPlus className="h-3.5 w-3.5" />, label: "Add to Segment" },
  ]},
  { group: "Logic", color: "border-amber-200 bg-amber-50 text-amber-700", items: [
    { icon: <Clock className="h-3.5 w-3.5" />, label: "Wait / Delay" },
    { icon: <GitBranch className="h-3.5 w-3.5" />, label: "Condition (If/Else)" },
    { icon: <MessageSquare className="h-3.5 w-3.5" />, label: "Update Lead Score" },
  ]},
];

const nodeStyles: Record<string, string> = {
  trigger: "border-emerald-300 bg-emerald-50 text-emerald-900",
  action: "border-blue-300 bg-blue-50 text-blue-900",
  delay: "border-amber-300 bg-amber-50 text-amber-900",
  condition: "border-purple-300 bg-purple-50 text-purple-900",
};

function Node({ type, icon, title, desc }: { type: keyof typeof nodeStyles; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className={`relative w-64 p-3.5 rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow ${nodeStyles[type]}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center">{icon}</div>
        <span className="text-xs uppercase font-bold tracking-wider opacity-70">{type}</span>
      </div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs opacity-75 mt-0.5">{desc}</p>
    </div>
  );
}

function Connector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center my-1">
      <div className="w-0.5 h-6 bg-slate-300" />
      {label && (
        <div className="bg-white border border-slate-200 rounded-full px-2 py-0.5 text-[10px] font-semibold text-slate-500 -my-1.5 z-10">
          {label}
        </div>
      )}
      <div className="w-0.5 h-6 bg-slate-300" />
      <div className="w-2 h-2 border-r-2 border-b-2 border-slate-300 rotate-45 -mt-1.5" />
    </div>
  );
}

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [tab, setTab] = useState("builder");
  const [name, setName] = useState("Lead Capture & Welcome Email");
  const [description, setDescription] = useState("Triggered when new lead submits website form");
  const [folder, setFolder] = useState("Lead Generation");
  const [error, setError] = useState<string | null>(null);

  function handleSave(status: "Draft" | "Active") {
    setError(null);
    if (!name.trim()) { setError("Name required"); return; }
    start(async () => {
      try {
        await createWorkflow({ workflow_name: name.trim(), description, folder, status });
        router.push("/workflows");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <Link href="/workflows" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to workflows
          </Link>
          <div className="flex items-center gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="text-2xl font-bold border-transparent !h-auto px-0 hover:bg-slate-50 focus:bg-white focus:px-3 transition-all min-w-[400px]" />
            <Badge variant="default">Draft</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Test automation</Button>
          <Button variant="outline" onClick={() => handleSave("Draft")} disabled={pending}><Save className="h-4 w-4" /> Save</Button>
          <Button onClick={() => handleSave("Active")} disabled={pending}><Play className="h-4 w-4" /> {pending ? "Activating..." : "Activate"}</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Tabs
        tabs={[
          { id: "builder", label: "Builder", icon: <GitBranch className="h-4 w-4" /> },
          { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
          { id: "logs", label: "Logs", icon: <ScrollText className="h-4 w-4" /> },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-4"
      />

      {tab === "builder" && (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          <Card className="p-4 h-fit sticky top-20">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Drag to add</p>
            <div className="space-y-4">
              {palette.map((g) => (
                <div key={g.group}>
                  <p className="text-xs font-semibold text-slate-700 mb-1.5">{g.group}</p>
                  <div className="space-y-1.5">
                    {g.items.map((i) => (
                      <button
                        key={i.label}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-grab ${g.color}`}
                      >
                        {i.icon} {i.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 bg-[radial-gradient(circle,_#e2e8f0_1px,_transparent_1px)] bg-[length:20px_20px] min-h-[700px]">
            <div className="flex flex-col items-center">
              <Node type="trigger" icon={<FileDown className="h-4 w-4 text-emerald-600" />} title="New lead via web form" desc="Triggered when /api/leads POST received" />
              <Connector />
              <Node type="action" icon={<RefreshCw className="h-4 w-4 text-blue-600" />} title="Add lead to CRM" desc="Sync to HubSpot pipeline 'New Inbound'" />
              <Connector />
              <Node type="action" icon={<Mail className="h-4 w-4 text-blue-600" />} title="Send Welcome Email" desc="Template: Welcome Email" />
              <Connector />
              <Node type="delay" icon={<Clock className="h-4 w-4 text-amber-600" />} title="Wait 1 day" desc="Pause before next step" />
              <Connector />
              <Node type="condition" icon={<GitBranch className="h-4 w-4 text-purple-600" />} title="Did they open the email?" desc="Check open event in last 24 hours" />

              <div className="flex items-start justify-center gap-12 mt-2 w-full">
                <div className="flex flex-col items-center">
                  <Connector label="YES" />
                  <Node type="action" icon={<Mail className="h-4 w-4 text-blue-600" />} title="Send Case Study" desc="Template: Customer Success" />
                </div>
                <div className="flex flex-col items-center">
                  <Connector label="NO" />
                  <Node type="action" icon={<Bell className="h-4 w-4 text-blue-600" />} title="Send Reminder Email" desc="Template: Quick reminder" />
                </div>
              </div>

              <button className="mt-8 flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                <Plus className="h-4 w-4" /> Add step
              </button>
            </div>
          </Card>
        </div>
      )}

      {tab === "settings" && (
        <Card className="p-6 max-w-2xl">
          <h3 className="font-semibold text-slate-900 mb-4">Workflow settings</h3>
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Folder</label>
              <Select value={folder} onChange={(e) => setFolder(e.target.value)}>
                <option>Lead Generation</option>
                <option>Marketing</option>
                <option>Customer Support</option>
                <option>Internal</option>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {tab === "logs" && (
        <Card>
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Execution logs</h3>
          </div>
          <div className="p-12 text-center text-slate-500 text-sm">
            No executions yet. Logs will appear after workflow runs.
          </div>
        </Card>
      )}
    </div>
  );
}
