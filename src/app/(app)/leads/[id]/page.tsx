"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, AtSign, Globe, Calendar, Star, Send, Building2, Target, Users, BarChart3, MoreHorizontal, MapPin } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { leads } from "@/lib/mock-data";
import { ProspectScoreTab } from "@/components/leads/tabs/prospect-score";
import { CompanyIntelTab } from "@/components/leads/tabs/company-intel";
import { ContactIntelTab } from "@/components/leads/tabs/contact-intel";
import { OutreachTab } from "@/components/leads/tabs/outreach";
import { NextStepsTab } from "@/components/leads/tabs/next-steps";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const lead = leads.find((l) => l.id === id) ?? leads[0];
  const [tab, setTab] = useState("score");

  return (
    <div className="max-w-[1600px] mx-auto">
      <Link href="/leads" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to leads
      </Link>

      {/* Hero card */}
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold flex items-center justify-center flex-shrink-0">
            {lead.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2)}
          </div>

          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{lead.fullName}</h1>
              <Badge variant="danger">{lead.status}</Badge>
              <Badge variant="purple">AI Scored</Badge>
            </div>
            <p className="text-slate-500 mb-3">{lead.companyName} · {lead.industry}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" /> {lead.email}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" /> {lead.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Globe className="h-4 w-4 text-slate-400" /> {lead.websiteUrl}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <AtSign className="h-4 w-4 text-slate-400" /> LinkedIn
              </div>
            </div>
          </div>

          {/* Score badge */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="relative h-20 w-20">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" stroke="#f1f5f9" strokeWidth="6" fill="none" />
                  <circle cx="40" cy="40" r="32" stroke="#2563eb" strokeWidth="6" fill="none"
                    strokeDasharray={`${(lead.leadScore / 100) * 201} 201`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold text-slate-900">{lead.leadScore}</span>
                  <span className="text-[10px] text-slate-500 -mt-1">SCORE</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button><Send className="h-4 w-4" /> Send Email</Button>
              <Button variant="outline"><Calendar className="h-4 w-4" /> Schedule Call</Button>
              <Button variant="ghost" size="icon" className="self-end"><MoreHorizontal className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main column with tabs */}
        <div>
          <Tabs
            tabs={[
              { id: "score", label: "Prospect Score", icon: <Star className="h-4 w-4" /> },
              { id: "company", label: "Company Intel", icon: <Building2 className="h-4 w-4" /> },
              { id: "contacts", label: "Contacts", icon: <Users className="h-4 w-4" /> },
              { id: "outreach", label: "Outreach", icon: <Send className="h-4 w-4" /> },
              { id: "next", label: "Next Steps", icon: <Target className="h-4 w-4" /> },
            ]}
            active={tab}
            onChange={setTab}
            className="mb-6"
          />

          {tab === "score" && <ProspectScoreTab />}
          {tab === "company" && <CompanyIntelTab />}
          {tab === "contacts" && <ContactIntelTab />}
          {tab === "outreach" && <OutreachTab />}
          {tab === "next" && <NextStepsTab />}
        </div>

        {/* Activity timeline */}
        <div>
          <Card>
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" /> Activity Timeline
              </h3>
            </div>
            <div className="p-5">
              <ol className="relative border-l border-slate-200 ml-3 space-y-5">
                {[
                  { type: "Visited pricing page", time: "2 mins ago", color: "bg-blue-500" },
                  { type: "Opened campaign email", time: "1 hour ago", color: "bg-emerald-500" },
                  { type: "Downloaded SAP AI Guide", time: "1 day ago", color: "bg-purple-500" },
                  { type: "Attended Webinar", time: "3 days ago", color: "bg-amber-500" },
                  { type: "Clicked CTA link", time: "5 days ago", color: "bg-cyan-500" },
                  { type: "Lead created", time: "May 20, 2026", color: "bg-slate-400" },
                ].map((e, i) => (
                  <li key={i} className="ml-4">
                    <span className={`absolute -left-1.5 h-3 w-3 rounded-full ${e.color} ring-4 ring-white`} />
                    <p className="text-sm font-medium text-slate-900">{e.type}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{e.time}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          <Card className="mt-4">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" /> Lead Source
              </h3>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Source</span>
                <span className="font-medium text-slate-900">{lead.source}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Created</span>
                <span className="font-medium text-slate-900">{lead.createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Owner</span>
                <span className="font-medium text-slate-900">James Wilson</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Segment</span>
                <Badge variant="blue">High Intent CRM</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
