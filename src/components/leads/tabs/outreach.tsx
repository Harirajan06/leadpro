import { Sparkles, Edit3, Mail, RefreshCw, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const steps = [
  {
    day: "Day 1",
    subject: "Daniel — saw your Sapphire talk on AI ROI",
    preview: "Hi Daniel, your talk at SAP Sapphire on AI transformation ROI resonated deeply. We've helped 12 Series B AI companies cut prospecting time by 60%...",
    target: "Daniel Wright, CEO",
    color: "bg-blue-500",
  },
  {
    day: "Day 3",
    subject: "Quick thought on your VP Sales Ops hire",
    preview: "Hi Marcus, congrats on the recent VP Sales Ops hire. We've built tooling specifically for that maturity stage — would love 15 min to share what's worked for similar Series B teams...",
    target: "Marcus Webb, COO",
    color: "bg-purple-500",
  },
  {
    day: "Day 5",
    subject: "Case study: how a similar Series B AI co. tripled qualified pipeline",
    preview: "Hi Daniel, sharing a case study from a Series B company in your space that 3x'd qualified pipeline in 90 days using AI-driven lead nurturing...",
    target: "Daniel Wright, CEO",
    color: "bg-emerald-500",
  },
  {
    day: "Day 8",
    subject: "Re: AI ROI — 15 min next week?",
    preview: "Hi Daniel, following up — would love 15 min to walk through how we'd map ROI for Visionary AI specifically. Are you open Tuesday or Wednesday next week?",
    target: "Daniel Wright, CEO",
    color: "bg-amber-500",
  },
];

export function OutreachTab() {
  return (
    <div className="space-y-4">
      <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">AI-Generated Outreach Sequence</h3>
              <p className="text-sm text-slate-600 mt-0.5">Tailored to Daniel&apos;s public stance on AI ROI and Visionary AI&apos;s recent Series B milestone.</p>
            </div>
          </div>
          <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5" /> Regenerate</Button>
        </div>
      </Card>

      <div className="space-y-3">
        {steps.map((s) => (
          <Card key={s.day} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 flex-shrink-0 w-20">
                <div className={`h-10 w-10 rounded-full ${s.color} text-white flex items-center justify-center`}>
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <Clock className="h-3 w-3" /> {s.day}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs text-slate-500">To: <span className="font-medium text-slate-700">{s.target}</span></p>
                  <Badge variant="purple"><Sparkles className="h-2.5 w-2.5" /> AI</Badge>
                </div>
                <p className="font-semibold text-slate-900 mb-2">{s.subject}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{s.preview}</p>
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="outline" size="sm"><Edit3 className="h-3.5 w-3.5" /> Edit</Button>
                  <Button variant="ghost" size="sm">Preview full email</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline">+ Add step</Button>
        <Button><Mail className="h-4 w-4" /> Launch sequence</Button>
      </div>
    </div>
  );
}
