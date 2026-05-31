"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, Filter, Upload, Plus, Trash2, ChevronDown, Download, Users2, Flame, Sparkles, Target } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { industries, interestAreas } from "@/lib/mock-data";
import { LeadForm } from "@/components/leads/lead-form";
import { CsvUpload } from "@/components/leads/csv-upload";
import { deleteLead, type LeadRow } from "@/lib/queries/leads";

const statusVariant: Record<string, "default" | "blue" | "warning" | "danger" | "success" | "purple"> = {
  New: "blue",
  Warm: "warning",
  Hot: "danger",
  Converted: "success",
  Scored: "purple",
};

interface Props {
  leads: LeadRow[];
  stats: { total: number; hot: number; scored: number; converted: number };
}

export function LeadsTable({ leads, stats }: Props) {
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showCsv, setShowCsv] = useState(false);

  const filtered = leads.filter((l) => {
    const name = l.full_name || l.company_name || "";
    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      (l.company_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (l.website_url?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchIndustry = !industryFilter || l.industry === industryFilter;
    return matchSearch && matchIndustry;
  });

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((l) => l.id));

  function todayStr() {
    const d = new window.Date();
    return d.toISOString().slice(0, 10);
  }

  async function handleBulkDelete() {
    if (!window.confirm(`Delete ${selected.length} leads?`)) return;
    const ids = [...selected];
    start(async () => {
      await Promise.all(ids.map((id) => deleteLead(id)));
      setSelected([]);
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this lead?")) return;
    start(async () => {
      await deleteLead(id);
      setSelected((s) => s.filter((x) => x !== id));
    });
  }

  function csvEscape(value: unknown): string {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes("\"") || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function handleExportCsv() {
    const rowsToExport = selected.length > 0
      ? filtered.filter((l) => selected.includes(l.id))
      : filtered;
    const headers = ["Name", "Email", "Company", "Industry", "Interest", "Score", "Status", "Source", "Created"];
    const lines = [headers.join(",")];
    for (const l of rowsToExport) {
      lines.push([
        csvEscape(l.full_name || l.company_name || ""),
        csvEscape(l.email || ""),
        csvEscape(l.company_name || ""),
        csvEscape(l.industry || ""),
        csvEscape(l.interest_area || ""),
        csvEscape(l.lead_score),
        csvEscape(l.status),
        csvEscape(l.source || ""),
        csvEscape(new window.Date(l.created_at).toISOString().slice(0, 10)),
      ].join(","));
    }
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${todayStr()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title="Leads"
        description={`${leads.length} total leads across all sources`}
        actions={
          <>
            <Button variant="outline" onClick={() => setShowCsv(true)}>
              <Upload className="h-4 w-4" /> Upload CSV
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> New lead
            </Button>
          </>
        }
      />

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total leads", value: stats.total, icon: <Users2 className="h-4 w-4" />, color: "text-blue-600 bg-blue-50" },
          { label: "Hot leads", value: stats.hot, icon: <Flame className="h-4 w-4" />, color: "text-amber-600 bg-amber-50" },
          { label: "AI scored", value: stats.scored, icon: <Sparkles className="h-4 w-4" />, color: "text-purple-600 bg-purple-50" },
          { label: "Converted", value: stats.converted, icon: <Target className="h-4 w-4" />, color: "text-emerald-600 bg-emerald-50" },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-xl font-bold text-slate-900">{s.value.toLocaleString()}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] max-w-md">
            <Input
              leftIcon={<Search className="h-4 w-4" />}
              placeholder="Search by name, company, or website"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="max-w-[180px]">
            <option value="">All industries</option>
            {industries.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </Select>
          <Select className="max-w-[180px]">
            <option>All interest areas</option>
            {interestAreas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" /> More filters
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            {selected.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                <span className="text-sm text-blue-700 font-medium">{selected.length} selected</span>
                <button onClick={handleBulkDelete} disabled={pending} className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 text-sm disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Industry</th>
                <th className="px-4 py-3 font-semibold">Interest</th>
                <th className="px-4 py-3 font-semibold">Score</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-slate-500">
                    No leads yet. Click <strong>New lead</strong> or <strong>Upload CSV</strong> to add some.
                  </td>
                </tr>
              )}
              {filtered.map((l) => {
                const displayName = l.full_name || l.company_name || "—";
                return (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(l.id)}
                        onChange={() => toggle(l.id)}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/leads/${l.id}`} className="flex items-center gap-3 group">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {displayName.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-blue-600">{displayName}</p>
                          <p className="text-xs text-slate-500">{l.email || "—"}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{l.company_name || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{l.industry || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{l.interest_area || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${l.lead_score >= 80 ? "bg-red-500" : l.lead_score >= 60 ? "bg-amber-500" : "bg-blue-500"}`}
                            style={{ width: `${l.lead_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{l.lead_score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[l.status] || "default"}>{l.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{l.source || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(l.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(l.id)}
                        disabled={pending}
                        title="Delete lead"
                        className="p-1 rounded-md hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <span>Showing {filtered.length} of {leads.length}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next <ChevronDown className="h-3.5 w-3.5 -rotate-90" /></Button>
          </div>
        </div>
      </Card>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create new lead" description="Add a lead manually" size="lg">
        <LeadForm onClose={() => setShowForm(false)} />
      </Modal>

      <Modal open={showCsv} onClose={() => setShowCsv(false)} title="Upload CSV" description="Bulk import leads from a CSV file" size="md">
        <CsvUpload onClose={() => setShowCsv(false)} />
      </Modal>
    </div>
  );
}
