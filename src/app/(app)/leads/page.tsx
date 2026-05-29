"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Upload, Plus, MoreHorizontal, Trash2, ChevronDown, Download, Users2, Flame, Sparkles, Target } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { leads, industries, interestAreas, type LeadStatus } from "@/lib/mock-data";
import { LeadForm } from "@/components/leads/lead-form";
import { CsvUpload } from "@/components/leads/csv-upload";

const statusVariant: Record<LeadStatus, "default" | "blue" | "warning" | "danger" | "success" | "purple"> = {
  New: "blue",
  Warm: "warning",
  Hot: "danger",
  Converted: "success",
  Scored: "purple",
};

export default function LeadsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showCsv, setShowCsv] = useState(false);

  const filtered = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.companyName.toLowerCase().includes(search.toLowerCase()) ||
      l.websiteUrl.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = !industryFilter || l.industry === industryFilter;
    return matchSearch && matchIndustry;
  });

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((l) => l.id));

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
          { label: "Total leads", value: 2847, icon: <Users2 className="h-4 w-4" />, color: "text-blue-600 bg-blue-50" },
          { label: "Hot leads", value: 487, icon: <Flame className="h-4 w-4" />, color: "text-amber-600 bg-amber-50" },
          { label: "AI scored", value: 1247, icon: <Sparkles className="h-4 w-4" />, color: "text-purple-600 bg-purple-50" },
          { label: "Converted", value: 67, icon: <Target className="h-4 w-4" />, color: "text-emerald-600 bg-emerald-50" },
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
          {selected.length > 0 && (
            <div className="ml-auto flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
              <span className="text-sm text-blue-700 font-medium">{selected.length} selected</span>
              <button className="text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 text-sm">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
              <button className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 text-sm">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
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
                <th className="px-4 py-3 font-semibold">Last Activity</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => (
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
                        {l.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 group-hover:text-blue-600">{l.fullName}</p>
                        <p className="text-xs text-slate-500">{l.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{l.companyName}</td>
                  <td className="px-4 py-3 text-slate-600">{l.industry}</td>
                  <td className="px-4 py-3 text-slate-600">{l.interestArea}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${l.leadScore >= 80 ? "bg-red-500" : l.leadScore >= 60 ? "bg-amber-500" : "bg-blue-500"}`}
                          style={{ width: `${l.leadScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{l.leadScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[l.status]}>{l.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{l.source}</td>
                  <td className="px-4 py-3 text-slate-500">{l.lastActivity}</td>
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
