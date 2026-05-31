"use client";
import * as React from "react";
import {
  Plus,
  X,
  Zap,
  Mail,
  Clock,
  GitBranch,
  UserPlus,
  Bell,
  RefreshCw,
  FileDown,
  MessageSquare,
} from "lucide-react";
import type { WorkflowNode } from "@/lib/queries/workflows";

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  onChange: (nodes: WorkflowNode[]) => void;
  onNodeClick?: (id: string) => void;
}

const nodeStyles: Record<WorkflowNode["type"], string> = {
  trigger: "border-emerald-300 bg-emerald-50 text-emerald-900",
  action: "border-blue-300 bg-blue-50 text-blue-900",
  delay: "border-amber-300 bg-amber-50 text-amber-900",
  condition: "border-purple-300 bg-purple-50 text-purple-900",
};

const iconColor: Record<WorkflowNode["type"], string> = {
  trigger: "text-emerald-600",
  action: "text-blue-600",
  delay: "text-amber-600",
  condition: "text-purple-600",
};

function getIcon(node: WorkflowNode) {
  const cls = `h-4 w-4 ${iconColor[node.type]}`;
  const map: Record<string, React.ReactNode> = {
    form_submit: <FileDown className={cls} />,
    guide_download: <Zap className={cls} />,
    webinar_register: <UserPlus className={cls} />,
    send_email: <Mail className={cls} />,
    add_to_crm: <RefreshCw className={cls} />,
    notify_team: <Bell className={cls} />,
    add_to_segment: <UserPlus className={cls} />,
    wait: <Clock className={cls} />,
    condition: <GitBranch className={cls} />,
    update_score: <MessageSquare className={cls} />,
  };
  return map[node.subtype] ?? <Zap className={cls} />;
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

export function WorkflowCanvas({ nodes, onChange, onNodeClick }: WorkflowCanvasProps) {
  function removeNode(id: string) {
    onChange(nodes.filter((n) => n.id !== id));
  }

  function addPlaceholder() {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: "action",
      subtype: "send_email",
      label: "New action",
      description: "Click to configure",
    };
    onChange([...nodes, newNode]);
  }

  return (
    <div className="flex flex-col items-center">
      {nodes.length === 0 && (
        <div className="text-sm text-slate-500 py-12 text-center">
          Your canvas is empty. Click a step in the left palette to add it.
        </div>
      )}
      {nodes.map((node, i) => (
        <React.Fragment key={node.id}>
          {i > 0 && <Connector />}
          <div
            onClick={() => onNodeClick?.(node.id)}
            className={`relative w-64 p-3.5 rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${nodeStyles[node.type]}`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNode(node.id);
              }}
              aria-label="Remove step"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-slate-300 text-slate-500 hover:text-red-600 hover:border-red-300 flex items-center justify-center shadow-sm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center">
                {getIcon(node)}
              </div>
              <span className="text-xs uppercase font-bold tracking-wider opacity-70">
                {node.type}
              </span>
            </div>
            <p className="font-semibold text-sm">{node.label}</p>
            {node.description && (
              <p className="text-xs opacity-75 mt-0.5">{node.description}</p>
            )}
          </div>
        </React.Fragment>
      ))}

      {nodes.length > 0 && <Connector />}
      <button
        onClick={addPlaceholder}
        className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        <Plus className="h-4 w-4" /> Add step
      </button>
    </div>
  );
}
