"use client";
import { Suspense, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Play,
  Zap,
  Mail,
  Clock,
  GitBranch,
  UserPlus,
  Bell,
  RefreshCw,
  FileDown,
  MessageSquare,
  Settings,
  ScrollText,
  AlertCircle,
} from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import {
  createWorkflow,
  getWorkflowById,
  testRunWorkflow,
  updateWorkflow,
  type WorkflowNode,
  type TestRunResult,
} from "@/lib/queries/workflows";
import { WorkflowCanvas } from "@/components/workflows/workflow-canvas";

interface PaletteItem {
  icon: React.ReactNode;
  label: string;
  type: WorkflowNode["type"];
  subtype: string;
  description: string;
}

const palette: { group: string; color: string; items: PaletteItem[] }[] = [
  {
    group: "Triggers",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
    items: [
      { icon: <FileDown className="h-3.5 w-3.5" />, label: "New Lead (Form)", type: "trigger", subtype: "form_submit", description: "Triggered when /api/leads POST received" },
      { icon: <Zap className="h-3.5 w-3.5" />, label: "Guide Downloaded", type: "trigger", subtype: "guide_download", description: "Triggered on guide download" },
      { icon: <UserPlus className="h-3.5 w-3.5" />, label: "Webinar Registered", type: "trigger", subtype: "webinar_register", description: "Triggered on webinar signup" },
    ],
  },
  {
    group: "Actions",
    color: "border-blue-200 bg-blue-50 text-blue-700",
    items: [
      { icon: <Mail className="h-3.5 w-3.5" />, label: "Send Email", type: "action", subtype: "send_email", description: "Send a templated email" },
      { icon: <RefreshCw className="h-3.5 w-3.5" />, label: "Add to CRM", type: "action", subtype: "add_to_crm", description: "Sync lead to external CRM" },
      { icon: <Bell className="h-3.5 w-3.5" />, label: "Notify Team", type: "action", subtype: "notify_team", description: "Send internal notification" },
      { icon: <UserPlus className="h-3.5 w-3.5" />, label: "Add to Segment", type: "action", subtype: "add_to_segment", description: "Place lead in segment" },
    ],
  },
  {
    group: "Logic",
    color: "border-amber-200 bg-amber-50 text-amber-700",
    items: [
      { icon: <Clock className="h-3.5 w-3.5" />, label: "Wait / Delay", type: "delay", subtype: "wait", description: "Pause before next step" },
      { icon: <GitBranch className="h-3.5 w-3.5" />, label: "Condition (If/Else)", type: "condition", subtype: "condition", description: "Branch based on a rule" },
      { icon: <MessageSquare className="h-3.5 w-3.5" />, label: "Update Lead Score", type: "action", subtype: "update_score", description: "Adjust lead score" },
    ],
  },
];

const SAMPLE_NODES: WorkflowNode[] = [
  { id: "n_sample_1", type: "trigger", subtype: "form_submit", label: "New lead via web form", description: "Triggered when /api/leads POST received" },
  { id: "n_sample_2", type: "action", subtype: "add_to_crm", label: "Add lead to CRM", description: "Sync to HubSpot pipeline 'New Inbound'" },
  { id: "n_sample_3", type: "action", subtype: "send_email", label: "Send Welcome Email", description: "Template: Welcome Email" },
];

function newId() {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function WorkflowBuilderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [pending, start] = useTransition();
  const [loading, setLoading] = useState(Boolean(id));
  const [tab, setTab] = useState("builder");
  const [name, setName] = useState("Lead Capture & Welcome Email");
  const [description, setDescription] = useState("Triggered when new lead submits website form");
  const [folder, setFolder] = useState("Lead Generation");
  const [statusBadge, setStatusBadge] = useState<"Draft" | "Active" | "Paused">("Draft");
  const [nodes, setNodes] = useState<WorkflowNode[]>(SAMPLE_NODES);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestRunResult | null>(null);

  // Load existing workflow if ?id= is present
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const wf = await getWorkflowById(id);
        if (cancelled || !wf) return;
        setName(wf.workflow_name);
        setDescription(wf.description ?? "");
        setFolder(wf.folder);
        if (wf.status === "Draft" || wf.status === "Active" || wf.status === "Paused") {
          setStatusBadge(wf.status);
        }
        if (wf.config?.nodes?.length) {
          setNodes(wf.config.nodes);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load workflow");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function addFromPalette(item: PaletteItem) {
    const node: WorkflowNode = {
      id: newId(),
      type: item.type,
      subtype: item.subtype,
      label: item.label,
      description: item.description,
    };
    setNodes((prev) => [...prev, node]);
  }

  function handleTest() {
    setError(null);
    setTestResult(null);
    start(async () => {
      try {
        const result = await testRunWorkflow(id ?? null, name, { nodes });
        setTestResult(result);
        setTab("logs");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Test failed");
      }
    });
  }

  function handleSave(status: "Draft" | "Active") {
    setError(null);
    if (!name.trim()) {
      setError("Name required");
      return;
    }
    start(async () => {
      try {
        const payload = {
          workflow_name: name.trim(),
          description,
          folder,
          status,
          config: { nodes },
        };
        if (id) {
          await updateWorkflow(id, payload);
        } else {
          await createWorkflow(payload);
        }
        router.push("/workflows");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto py-20 text-center text-sm text-slate-500">
        Loading workflow…
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <Link
            href="/workflows"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to workflows
          </Link>
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-bold border-transparent !h-auto px-0 hover:bg-slate-50 focus:bg-white focus:px-3 transition-all min-w-[400px]"
            />
            <Badge variant={statusBadge === "Active" ? "success" : "default"}>{statusBadge}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTest} disabled={pending}>
            Test automation
          </Button>
          <Button variant="outline" onClick={() => handleSave("Draft")} disabled={pending}>
            <Save className="h-4 w-4" /> Save
          </Button>
          <Button onClick={() => handleSave("Active")} disabled={pending}>
            <Play className="h-4 w-4" /> {pending ? "Activating..." : "Activate"}
          </Button>
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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Click to add
            </p>
            <div className="space-y-4">
              {palette.map((g) => (
                <div key={g.group}>
                  <p className="text-xs font-semibold text-slate-700 mb-1.5">{g.group}</p>
                  <div className="space-y-1.5">
                    {g.items.map((i) => (
                      <button
                        key={i.label}
                        onClick={() => addFromPalette(i)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium hover:shadow-sm ${g.color}`}
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
            <WorkflowCanvas nodes={nodes} onChange={setNodes} />
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
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Execution logs</h3>
            <Button variant="outline" size="sm" onClick={handleTest} disabled={pending}>
              Run test again
            </Button>
          </div>
          {testResult ? (
            <ul className="divide-y divide-slate-100">
              {testResult.steps.map((s, i) => (
                <li key={i} className="p-4 flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      s.status === "ok" ? "bg-emerald-500" : s.status === "error" ? "bg-red-500" : "bg-slate-300"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">
                      {s.name}
                      {s.branch ? ` (branch: ${s.branch})` : ""}
                    </p>
                    <p className="text-xs text-slate-500">
                      {s.durationMs}ms · {s.status}
                      {s.type ? ` · ${s.type}` : ""}
                    </p>
                  </div>
                  <Badge variant={s.status === "ok" ? "success" : "default"}>
                    {s.status === "ok" ? "Success" : s.status === "error" ? "Error" : "Skipped"}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              Click <strong>Test automation</strong> to simulate a run.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default function WorkflowBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1600px] mx-auto py-20 text-center text-sm text-slate-500">
          Loading…
        </div>
      }
    >
      <WorkflowBuilderInner />
    </Suspense>
  );
}
