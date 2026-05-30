"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Sparkles, Image, Link as LinkIcon, Type, Code, Calendar, Megaphone, PartyPopper, Mail, Plus, Clock, RefreshCw, Edit3, AlertCircle } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createCampaign } from "@/lib/queries/campaigns";

const suggestions = [
  { icon: <Calendar className="h-4 w-4" />, label: "Book demo meetings", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
  { icon: <Megaphone className="h-4 w-4" />, label: "Announce new product", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
  { icon: <PartyPopper className="h-4 w-4" />, label: "Welcome letter", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  { icon: <Calendar className="h-4 w-4" />, label: "Upcoming webinar", color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
  { icon: <Mail className="h-4 w-4" />, label: "Reach out to existing leads", color: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
];

export default function CampaignBuilderPage() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState("Untitled Campaign");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSave(status: "Draft" | "Active") {
    setError(null);
    if (!name.trim()) { setError("Campaign name required"); return; }
    start(async () => {
      try {
        await createCampaign({
          campaign_name: name.trim(),
          status,
          content: prompt,
          campaign_type: "Email Sequence",
        });
        router.push("/campaigns");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to campaigns
          </Link>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-2xl font-bold border-transparent !h-auto px-0 hover:bg-slate-50 focus:bg-white focus:px-3 transition-all min-w-[300px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Preview</Button>
          <Button variant="outline" onClick={() => handleSave("Draft")} disabled={pending}><Save className="h-4 w-4" /> Save draft</Button>
          <Button onClick={() => handleSave("Active")} disabled={pending}><Send className="h-4 w-4" /> {pending ? "Launching..." : "Launch"}</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Campaign settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Add leads from</label>
                <Select>
                  <option>— Select source —</option>
                  <option>Segment: High Intent CRM Leads</option>
                  <option>Segment: SAP Professionals</option>
                  <option>Segment: Webinar Attendees</option>
                  <option>All leads</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">From email account</label>
                <Select>
                  <option>anu@leadpro.ai (Anuradha)</option>
                  <option>james@leadpro.ai (James Wilson)</option>
                  <option>sales@leadpro.ai (Sales Team)</option>
                </Select>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Email format</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <Type className="h-3.5 w-3.5" />, label: "Text" },
                    { icon: <LinkIcon className="h-3.5 w-3.5" />, label: "Links" },
                    { icon: <Image className="h-3.5 w-3.5" />, label: "Images" },
                    { icon: <Code className="h-3.5 w-3.5" />, label: "HTML" },
                  ].map((f) => (
                    <label key={f.label} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="flex items-center gap-1.5 text-sm text-slate-700">{f.icon} {f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Send schedule</label>
                <Select>
                  <option>Send immediately</option>
                  <option>Schedule for later</option>
                  <option>Drip over time</option>
                </Select>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">AI Message Generator</h3>
              <Badge variant="purple">Powered by GPT-4</Badge>
            </div>

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your campaign goal... e.g. 'Book demo meetings with Series B AI startup founders who attended last week's webinar.'"
              rows={3}
              className="bg-white border-slate-200"
            />

            <div className="mt-3">
              <p className="text-xs font-medium text-slate-600 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${s.color} transition-colors`}
                    onClick={() => setPrompt(s.label)}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end mt-4">
              <Button type="button" disabled><Sparkles className="h-4 w-4" /> Generate sequence (requires OpenAI key)</Button>
            </div>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Email sequence</h3>
              <Button variant="outline" size="sm" disabled><RefreshCw className="h-3.5 w-3.5" /> Regenerate all</Button>
            </div>

            <div className="space-y-3">
              {[
                { day: "Day 1", subject: "Quick question — 15 min for a demo?", body: "Hi {{firstName}}, I noticed {{companyName}} is in {{industry}}. We've helped similar companies cut prospecting time by 60%...", color: "bg-blue-500" },
                { day: "Day 3", subject: "Following up — saw your recent post on AI", body: "Hi {{firstName}}, I came across your recent post about AI transformation and wanted to share a quick case study...", color: "bg-purple-500" },
                { day: "Day 7", subject: "Last note from me", body: "Hi {{firstName}}, I'll keep this brief. If AI-driven lead nurturing isn't a priority right now, no worries...", color: "bg-amber-500" },
              ].map((s, i) => (
                <Card key={i} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-full ${s.color} text-white flex items-center justify-center flex-shrink-0`}><Mail className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-500 inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {s.day}</span>
                        <Badge variant="purple"><Sparkles className="h-2.5 w-2.5" /> AI</Badge>
                      </div>
                      <Input value={s.subject} readOnly className="font-medium mb-2 bg-slate-50" />
                      <Textarea value={s.body} readOnly rows={2} className="bg-slate-50 text-sm" />
                    </div>
                    <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
                  </div>
                </Card>
              ))}

              <Button variant="outline" className="w-full"><Plus className="h-4 w-4" /> Add step</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
