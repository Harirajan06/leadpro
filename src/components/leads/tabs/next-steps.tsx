import { Target, Mail, Users, Eye, MessageSquare, TrendingUp, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const recommendations = [
  {
    priority: "Now",
    color: "bg-red-500",
    title: "Send personalized email to CEO Daniel Wright",
    desc: "Reference his SAP Sapphire talk on AI ROI. AI-generated draft is ready.",
    icon: <Mail className="h-4 w-4" />,
    impact: "High",
  },
  {
    priority: "This week",
    color: "bg-amber-500",
    title: "Find warm intro to CRO Linh Tran",
    desc: "3 mutual connections via LinkedIn. Strongest path: Sarah Kim (your portfolio investor).",
    icon: <Users className="h-4 w-4" />,
    impact: "High",
  },
  {
    priority: "This week",
    color: "bg-amber-500",
    title: "Monitor hiring activity for Sales Ops team",
    desc: "Recently posted VP Sales Ops role. Track new joiners for fresh entry point.",
    icon: <Eye className="h-4 w-4" />,
    impact: "Medium",
  },
  {
    priority: "Next 2 weeks",
    color: "bg-blue-500",
    title: "Engage on competitor evaluation messaging",
    desc: "G2 activity suggests active vendor comparison. Pre-position differentiators on AI personalization.",
    icon: <MessageSquare className="h-4 w-4" />,
    impact: "Medium",
  },
  {
    priority: "Watch",
    color: "bg-slate-400",
    title: "Tailor messaging to Series B funding milestone",
    desc: "Reference recent $45M raise in subject lines for higher open rates.",
    icon: <TrendingUp className="h-4 w-4" />,
    impact: "Low",
  },
];

const timing = [
  { label: "Decision timeline", value: "30–45 days", trend: "accelerating" },
  { label: "Best contact window", value: "Tue–Thu, 10am–12pm PT", trend: "based on email opens" },
  { label: "Likely close size", value: "$48k–$72k ARR", trend: "based on similar deals" },
];

export function NextStepsTab() {
  return (
    <div className="space-y-4">
      <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Target className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">AI-Recommended Actions</h3>
            <p className="text-sm text-slate-700 mt-1">
              Prioritized based on buying signals, decision-maker analysis, and outreach readiness. Act on top items first to maximize conversion probability.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recommended Actions</h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {recommendations.map((r, i) => (
            <li key={i} className="p-5 hover:bg-slate-50 transition-colors flex items-start gap-4 group cursor-pointer">
              <div className={`h-9 w-9 rounded-lg ${r.color} text-white flex items-center justify-center flex-shrink-0`}>
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={r.priority === "Now" ? "danger" : r.priority === "Watch" ? "default" : "warning"}>
                    {r.priority}
                  </Badge>
                  <span className="text-xs text-slate-500">Impact: <strong className="text-slate-700">{r.impact}</strong></span>
                </div>
                <p className="font-semibold text-slate-900">{r.title}</p>
                <p className="text-sm text-slate-500 mt-1">{r.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Timing & Sales Cycle Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {timing.map((t) => (
            <div key={t.label} className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">{t.label}</p>
              <p className="font-semibold text-slate-900">{t.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t.trend}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
