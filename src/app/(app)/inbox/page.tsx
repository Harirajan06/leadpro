"use client";
import { useState } from "react";
import { Search, Filter, Reply, Forward, Archive, Star, Send, Paperclip, MoreHorizontal, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { inboxConversations } from "@/lib/mock-data";

export default function InboxPage() {
  const [active, setActive] = useState(inboxConversations[0]);

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader title="Smart Inbox" description="Unified inbox for all campaign replies" />

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] h-[calc(100vh-220px)]">
          {/* Conversation list */}
          <div className="border-r border-slate-100 flex flex-col">
            <div className="p-3 border-b border-slate-100 space-y-2">
              <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search messages..." />
              <div className="flex items-center gap-1">
                <button className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">All</button>
                <button className="px-3 py-1 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-100">Unread</button>
                <button className="px-3 py-1 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-100">Replied</button>
                <button className="ml-auto p-1.5 rounded-md hover:bg-slate-100"><Filter className="h-3.5 w-3.5 text-slate-500" /></button>
              </div>
            </div>

            <ul className="overflow-y-auto divide-y divide-slate-100 flex-1">
              {inboxConversations.map((c) => (
                <li
                  key={c.id}
                  onClick={() => setActive(c)}
                  className={`p-3 cursor-pointer transition-colors ${active.id === c.id ? "bg-blue-50" : "hover:bg-slate-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                      {c.lead.split(" ").map((p) => p[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-sm truncate ${c.unread ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                          {c.lead}
                        </p>
                        <span className="text-xs text-slate-400 flex-shrink-0">{c.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1 truncate">{c.company}</p>
                      <p className={`text-xs line-clamp-2 ${c.unread ? "text-slate-700" : "text-slate-500"}`}>{c.preview}</p>
                      <div className="mt-1.5 flex items-center gap-1">
                        <Badge variant="blue">{c.campaign}</Badge>
                        {c.unread && <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Conversation view */}
          <div className="flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center">
                  {active.lead.split(" ").map((p) => p[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{active.lead}</p>
                  <p className="text-xs text-slate-500">{active.company} · {active.campaign}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon"><Star className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Tag className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Archive className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {/* Sent */}
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                  <p className="text-sm leading-relaxed">Hi {active.lead.split(" ")[0]}, would love to set up a 15-minute demo to walk you through our AI-driven lead nurturing platform. Open to a chat next week?</p>
                  <p className="text-xs text-blue-100 mt-1.5">You · 1 day ago</p>
                </div>
              </div>

              {/* Reply */}
              <div className="flex">
                <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed">{active.preview}</p>
                  <p className="text-xs text-slate-400 mt-1.5">{active.lead.split(" ")[0]} · {active.time}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-4">
              <div className="bg-white border border-slate-200 rounded-xl p-3">
                <textarea
                  placeholder="Type your reply..."
                  rows={3}
                  className="w-full resize-none outline-none text-sm placeholder:text-slate-400"
                />
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm">Templates</Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm"><Forward className="h-3.5 w-3.5" /> Forward</Button>
                    <Button size="sm"><Send className="h-3.5 w-3.5" /> Send</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
