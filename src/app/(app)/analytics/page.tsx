"use client";
import { Calendar, Download, ArrowUp, ArrowDown, Mail, Mouse, MessageCircle, AlertOctagon } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Funnel, FunnelChart, LabelList, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { campaignPerfData, conversionFunnel, leadGrowthData } from "@/lib/mock-data";

const engagementData = [
  { day: "Mon", opens: 142, clicks: 38, replies: 12 },
  { day: "Tue", opens: 218, clicks: 54, replies: 18 },
  { day: "Wed", opens: 195, clicks: 47, replies: 15 },
  { day: "Thu", opens: 248, clicks: 62, replies: 22 },
  { day: "Fri", opens: 187, clicks: 41, replies: 14 },
  { day: "Sat", opens: 89, clicks: 18, replies: 4 },
  { day: "Sun", opens: 76, clicks: 14, replies: 3 },
];

export default function AnalyticsPage() {
  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title="Analytics"
        description="Campaign performance, conversion funnel & engagement insights"
        actions={
          <>
            <Select className="max-w-[160px]">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
            </Select>
            <Button variant="outline"><Calendar className="h-4 w-4" /> Custom range</Button>
            <Button variant="outline"><Download className="h-4 w-4" /> Export</Button>
          </>
        }
      />

      {/* Email KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Emails sent", value: "9,517", delta: 12.4, icon: <Mail className="h-4 w-4" />, color: "bg-blue-50 text-blue-600" },
          { label: "Open rate", value: "48.2%", delta: 5.1, icon: <Mail className="h-4 w-4" />, color: "bg-emerald-50 text-emerald-600" },
          { label: "Click rate", value: "12.8%", delta: 2.4, icon: <Mouse className="h-4 w-4" />, color: "bg-purple-50 text-purple-600" },
          { label: "Reply rate", value: "13.4%", delta: -1.2, icon: <MessageCircle className="h-4 w-4" />, color: "bg-amber-50 text-amber-600" },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500">{s.label}</p>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <div className={`flex items-center gap-0.5 text-xs font-semibold mt-1 ${s.delta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {s.delta >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(s.delta)}% vs last period
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Engagement over time */}
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Engagement over time</h3>
          <p className="text-sm text-slate-500 mb-4">Opens, clicks, and replies — last 7 days</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="opens" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="clicks" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="replies" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Funnel */}
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Conversion funnel</h3>
          <p className="text-sm text-slate-500 mb-4">All leads · last 90 days</p>
          <div className="space-y-2">
            {conversionFunnel.map((s, i) => {
              const max = conversionFunnel[0].value;
              const pct = (s.value / max) * 100;
              const prev = i > 0 ? conversionFunnel[i - 1].value : null;
              const conv = prev ? ((s.value / prev) * 100).toFixed(1) : null;
              return (
                <div key={s.stage}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium">{s.stage}</span>
                    <span className="font-semibold text-slate-900">{s.value.toLocaleString()}</span>
                  </div>
                  <div className="h-7 bg-slate-100 rounded-md overflow-hidden">
                    <div className="h-full rounded-md flex items-center justify-end px-2" style={{ width: `${pct}%`, backgroundColor: s.fill }}>
                      <span className="text-xs font-semibold text-white">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  {conv && <p className="text-xs text-slate-500 mt-0.5">{conv}% conversion from prev stage</p>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Campaign comparison */}
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Campaign comparison</h3>
          <p className="text-sm text-slate-500 mb-4">Performance across top 5 campaigns</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignPerfData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="openRate" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Open %" />
                <Bar dataKey="replyRate" fill="#10b981" radius={[6, 6, 0, 0]} name="Reply %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Lead growth */}
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Lead growth</h3>
          <p className="text-sm text-slate-500 mb-4">New leads + hot lead conversions</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadGrowthData}>
                <defs>
                  <linearGradient id="ga1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="leads" stroke="#2563eb" strokeWidth={2.5} fill="url(#ga1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
