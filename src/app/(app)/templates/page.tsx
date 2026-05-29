"use client";
import { useState } from "react";
import { Search, Plus, FileText, Copy, Trash2, Edit3, Sparkles, MoreHorizontal } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { emailTemplates } from "@/lib/mock-data";

export default function TemplatesPage() {
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title="Email Templates"
        description="Reusable templates with variable placeholders"
        actions={<Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New template</Button>}
      />

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search templates..." className="max-w-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
          {emailTemplates.map((t) => (
            <Card key={t.id} className="p-5 hover:shadow-md hover:border-blue-200 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <button className="p-1 rounded-md hover:bg-slate-100">
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              <h3 className="font-semibold text-slate-900 mb-1">{t.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-1 font-mono">{t.subject}</p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  <p>By {t.createdBy}</p>
                  <p className="text-slate-400">Modified {t.lastModified}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(t.id)}><Edit3 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon"><Copy className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon"><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "New template" : "Edit template"} size="lg">
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Template name</label>
            <Input placeholder="e.g. Welcome Email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject line</label>
            <Input placeholder="Welcome to {{companyName}}!" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">Email body</label>
              <Button variant="ghost" size="sm"><Sparkles className="h-3.5 w-3.5" /> Generate with AI</Button>
            </div>
            <Textarea
              rows={10}
              defaultValue="Hi {{firstName}},

Welcome to LeadPro! We're excited to have {{companyName}} on board.

To get started, here are 3 quick steps...

Best,
{{senderName}}"
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-700 mb-2">AVAILABLE VARIABLES</p>
            <div className="flex flex-wrap gap-1.5">
              {["{{firstName}}", "{{lastName}}", "{{companyName}}", "{{industry}}", "{{senderName}}", "{{eventName}}"].map((v) => (
                <Badge key={v} variant="blue"><code className="font-mono">{v}</code></Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={() => setEditing(null)}>Save template</Button>
        </div>
      </Modal>
    </div>
  );
}
