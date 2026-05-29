import { Mail, Globe, Phone, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const contacts = [
  {
    name: "Daniel Wright",
    role: "CEO & Co-founder",
    priority: "Primary",
    insight: "Public proponent of AI transformation. Recently spoke at SAP Sapphire about automation ROI.",
    strategy: "Lead with strategic vision and ROI metrics. Avoid feature lists.",
    email: "daniel.w@visionary-ai.com",
    confidence: 95,
  },
  {
    name: "Linh Tran",
    role: "Chief Revenue Officer",
    priority: "Primary",
    insight: "Owns revenue tooling stack. Tracks pipeline ROI personally.",
    strategy: "Lead with quantifiable revenue impact and case studies from similar Series B companies.",
    email: "linh.t@visionary-ai.com",
    confidence: 91,
  },
  {
    name: "Marcus Webb",
    role: "Chief Operating Officer",
    priority: "Secondary",
    insight: "Operations focus, recently hired VP of Sales Ops who is evaluating tools.",
    strategy: "Influence through VP Sales Ops. Forward technical specs and integration docs.",
    email: "marcus.w@visionary-ai.com",
    confidence: 78,
  },
  {
    name: "Sofia Reyes",
    role: "Chief Marketing Officer",
    priority: "Secondary",
    insight: "Recently posted about AI-driven content personalization on LinkedIn.",
    strategy: "Share AI personalization case study. Position as marketing-sales alignment tool.",
    email: "sofia.r@visionary-ai.com",
    confidence: 82,
  },
];

export function ContactIntelTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((c) => (
          <Card key={c.name} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                {c.name.split(" ").map((p) => p[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-slate-900 truncate">{c.name}</p>
                  {c.priority === "Primary" ? (
                    <Badge variant="danger"><Star className="h-2.5 w-2.5" /> Primary</Badge>
                  ) : (
                    <Badge variant="default">Secondary</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500">{c.role}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">AI Insight</p>
                <p className="text-slate-700">{c.insight}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">Engagement Strategy</p>
                <p className="text-slate-700">{c.strategy}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Email verified · {c.confidence}% confidence
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" title="Email"><Mail className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" title="LinkedIn"><Globe className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" title="Call"><Phone className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
