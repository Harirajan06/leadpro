"use client";
import { useState, useTransition } from "react";
import { Search, Plus, FileText, Copy, Trash2, Edit3, Sparkles, MoreHorizontal, AlertCircle } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useFeedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { createEmailTemplate, updateEmailTemplate, deleteEmailTemplate, type EmailTemplateRow } from "@/lib/queries/templates";
import { formatDate } from "@/lib/utils";

export function TemplatesView({ templates }: { templates: EmailTemplateRow[] }) {
  const { confirm } = useFeedback();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<EmailTemplateRow | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ template_name: "", subject: "", body: "" });
  const [error, setError] = useState<string | null>(null);

  const filtered = templates.filter((t) => !search || t.template_name.toLowerCase().includes(search.toLowerCase()));

  function openNew() {
    setForm({ template_name: "", subject: "", body: "" });
    setError(null);
    setEditing("new");
  }
  function openEdit(t: EmailTemplateRow) {
    setForm({ template_name: t.template_name, subject: t.subject || "", body: t.body || "" });
    setError(null);
    setEditing(t);
  }

  function handleSave() {
    setError(null);
    if (!form.template_name.trim()) { setError("Name required"); return; }
    start(async () => {
      try {
        if (editing === "new") {
          await createEmailTemplate(form);
        } else if (editing) {
          await updateEmailTemplate(editing.id, form);
        }
        setEditing(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!(await confirm({ title: "Delete template?", message: "Delete this template?", confirmLabel: "Delete", danger: true }))) return;
    start(async () => { await deleteEmailTemplate(id); });
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title="Email Templates"
        description="Reusable templates with variable placeholders"
        actions={<Button onClick={openNew}><Plus className="h-4 w-4" /> New template</Button>}
      />

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search templates..."
            className="max-w-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No templates yet. Click <strong>New template</strong> to create your first one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {filtered.map((t) => (
              <Card key={t.id} className="p-5 hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <button className="p-1 rounded-md hover:bg-slate-100"><MoreHorizontal className="h-4 w-4 text-slate-400" /></button>
                </div>

                <h3 className="font-semibold text-slate-900 mb-1">{t.template_name}</h3>
                <p className="text-sm text-slate-500 line-clamp-1 font-mono">{t.subject || "(no subject)"}</p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    <p className="text-slate-400">Modified {formatDate(t.updated_at)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Edit3 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon"><Copy className="h-3.5 w-3.5" /></Button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-md hover:bg-red-50" disabled={pending}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "New template" : "Edit template"} size="lg">
        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Template name</label>
            <Input placeholder="e.g. Welcome Email" value={form.template_name} onChange={(e) => setForm({ ...form, template_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject line</label>
            <Input placeholder="Welcome to {{companyName}}!" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">Email body</label>
              <Button variant="ghost" size="sm" disabled><Sparkles className="h-3.5 w-3.5" /> Generate with AI</Button>
            </div>
            <Textarea rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-700 mb-2">AVAILABLE VARIABLES</p>
            <div className="flex flex-wrap gap-1.5">
              {["{{firstName}}", "{{lastName}}", "{{companyName}}", "{{industry}}", "{{senderName}}"].map((v) => (
                <Badge key={v} variant="blue"><code className="font-mono">{v}</code></Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditing(null)} disabled={pending}>Cancel</Button>
          <Button onClick={handleSave} disabled={pending}>{pending ? "Saving..." : "Save template"}</Button>
        </div>
      </Modal>
    </div>
  );
}
