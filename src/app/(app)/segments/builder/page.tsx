"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Eye, Save, Users2, Sparkles, GripVertical, AlertCircle } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createSegment } from "@/lib/queries/segments";

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const fields = ["Industry", "Interest Area", "Lead Score", "Status", "Source", "Visited Pricing Page", "Email Opened", "Webinar Attended", "Country", "Company Size"];
const operators = ["equals", "not equals", "contains", "greater than", "less than", "is true", "is false", "in the last X days"];

export default function SegmentBuilderPage() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState("High Intent CRM Leads");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Dynamic");
  const [logic, setLogic] = useState<"AND" | "OR">("AND");
  const [error, setError] = useState<string | null>(null);
  const [rules, setRules] = useState<Rule[]>([
    { id: "1", field: "Industry", operator: "equals", value: "Technology" },
    { id: "2", field: "Lead Score", operator: "greater than", value: "70" },
  ]);

  const addRule = () =>
    setRules([...rules, { id: Date.now().toString(), field: "Industry", operator: "equals", value: "" }]);
  const removeRule = (id: string) => setRules(rules.filter((r) => r.id !== id));
  const updateRule = (id: string, patch: Partial<Rule>) =>
    setRules(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  function handleSave() {
    setError(null);
    if (!name.trim()) { setError("Segment name is required"); return; }
    start(async () => {
      try {
        await createSegment(
          name.trim(),
          description,
          type,
          rules.map((r, i) => ({ field: r.field, operator: r.operator, value: r.value, rule_order: i }))
        );
        router.push("/segments");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <Link href="/segments" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to segments
      </Link>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-2xl font-bold border-transparent bg-transparent !h-auto px-0 hover:bg-slate-50 focus:bg-white focus:px-3 transition-all w-fit min-w-[300px]"
          />
          <p className="text-sm text-slate-500 mt-1">Define rules to dynamically group matching leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Eye className="h-4 w-4" /> Preview</Button>
          <Button onClick={handleSave} disabled={pending}><Save className="h-4 w-4" /> {pending ? "Saving..." : "Save segment"}</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Matching rules</h3>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-slate-500">Match leads where</span>
              <div className="flex p-0.5 bg-slate-100 rounded-md">
                {(["AND", "OR"] as const).map((l) => (
                  <button key={l} onClick={() => setLogic(l)}
                    className={`px-3 py-1 rounded text-xs font-semibold ${logic === l ? "bg-white shadow-sm text-blue-700" : "text-slate-600"}`}>
                    {l}
                  </button>
                ))}
              </div>
              <span className="text-sm text-slate-500">of the following match</span>
            </div>

            <div className="space-y-2.5">
              {rules.map((r, i) => (
                <div key={r.id} className="flex items-center gap-2 group">
                  <button className="p-1 text-slate-300 hover:text-slate-500 cursor-grab"><GripVertical className="h-4 w-4" /></button>
                  <div className="w-10 text-xs font-semibold text-slate-400 text-right">{i === 0 ? "WHERE" : logic}</div>
                  <Select className="max-w-[180px]" value={r.field} onChange={(e) => updateRule(r.id, { field: e.target.value })}>
                    {fields.map((f) => <option key={f}>{f}</option>)}
                  </Select>
                  <Select className="max-w-[160px]" value={r.operator} onChange={(e) => updateRule(r.id, { operator: e.target.value })}>
                    {operators.map((o) => <option key={o}>{o}</option>)}
                  </Select>
                  <Input value={r.value} onChange={(e) => updateRule(r.id, { value: e.target.value })} placeholder="Value..." className="flex-1" />
                  <button onClick={() => removeRule(r.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={addRule}><Plus className="h-3.5 w-3.5" /> Add condition</Button>
              <Button variant="ghost" size="sm">+ Add nested group</Button>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-1">AI Suggestion</h4>
                <p className="text-sm text-slate-700 mb-3">
                  Based on your campaign goals, consider adding <strong>&quot;Email Opened in last 30 days&quot;</strong> to focus on engaged prospects.
                </p>
                <Button variant="outline" size="sm">Apply suggestion</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Preview</h3>
              <Badge variant="success">Live</Badge>
            </div>
            <div className="text-center py-4">
              <div className="h-12 w-12 mx-auto rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                <Users2 className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">~{Math.floor(Math.random() * 200 + 50)}</p>
              <p className="text-sm text-slate-500">estimated matches</p>
              <p className="text-xs text-slate-400 mt-2">(real-time count after save)</p>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Segment settings</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Type</label>
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="Dynamic">Dynamic (auto-update)</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Engagement">Engagement</option>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-slate-700">
                <input type="checkbox" defaultChecked className="rounded" />
                Auto-sync to CRM
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
