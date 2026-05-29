import { Building2, DollarSign, Users, MapPin, Briefcase, TrendingUp, Sparkles, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const firmographics = [
  { label: "Type", value: "Private", icon: <Building2 className="h-4 w-4" /> },
  { label: "Revenue", value: "$42M ARR", icon: <DollarSign className="h-4 w-4" /> },
  { label: "Employees", value: "240+", icon: <Users className="h-4 w-4" /> },
  { label: "HQ", value: "San Francisco, CA", icon: <MapPin className="h-4 w-4" /> },
  { label: "Founded", value: "2018", icon: <Briefcase className="h-4 w-4" /> },
  { label: "Last Funding", value: "Series B · $45M", icon: <TrendingUp className="h-4 w-4" /> },
];

const signals = [
  { title: "Hiring in AI engineering", desc: "Posted 8 new ML/AI roles in last 30 days — signals platform expansion", level: "Strong" },
  { title: "Recent Series B raise", desc: "$45M funding closed in April — increased budget availability", level: "Strong" },
  { title: "Tech stack alignment", desc: "Using Salesforce + HubSpot — compatible with our integrations", level: "Medium" },
  { title: "Competitor evaluation", desc: "Comparing against Salesloft + Outreach in G2 review activity", level: "Watch" },
];

export function CompanyIntelTab() {
  return (
    <div className="space-y-4">
      {/* Firmographics */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Firmographics</h3>
          <Badge variant="purple"><Sparkles className="h-3 w-3" /> AI Enriched</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {firmographics.map((f) => (
            <div key={f.label} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                {f.icon} {f.label}
              </div>
              <p className="font-semibold text-slate-900">{f.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Signals */}
      <Card>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" /> Key Signals
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">AI-detected buying signals from the past 90 days</p>
          </div>
        </div>
        <ul className="divide-y divide-slate-100">
          {signals.map((s) => (
            <li key={s.title} className="p-5 flex items-start gap-4">
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{s.title}</p>
                <p className="text-sm text-slate-500 mt-1">{s.desc}</p>
              </div>
              <Badge variant={s.level === "Strong" ? "success" : s.level === "Medium" ? "warning" : "default"}>
                {s.level}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>

      {/* Competitive positioning */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-3">Competitive Position</h3>
        <p className="text-sm text-slate-600 mb-4">
          AI analysis suggests this prospect is actively evaluating multiple solutions. Our differentiators map to their stated priorities.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "AI Personalization Depth", us: 92, them: 64 },
            { label: "Workflow Flexibility", us: 88, them: 71 },
            { label: "CRM Integrations", us: 76, them: 82 },
            { label: "Price Competitiveness", us: 70, them: 88 },
          ].map((c) => (
            <div key={c.label} className="p-3 border border-slate-100 rounded-lg">
              <p className="text-sm font-medium text-slate-700 mb-2">{c.label}</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-700 font-medium w-16">LeadPro</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${c.us}%` }} />
                  </div>
                  <span className="text-slate-700 font-semibold w-8 text-right">{c.us}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 w-16">Competitor</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${c.them}%` }} />
                  </div>
                  <span className="text-slate-500 font-semibold w-8 text-right">{c.them}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
