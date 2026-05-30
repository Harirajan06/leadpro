"use client";
import { useState, useTransition } from "react";
import { Search, Filter, Forward, Archive, Star, Send, Paperclip, MoreHorizontal, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { markRead, sendReply, type InboxConversation } from "@/lib/queries/inbox";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function InboxView({ conversations }: { conversations: InboxConversation[] }) {
  const [pending, start] = useTransition();
  const [active, setActive] = useState(conversations[0] || null);
  const [reply, setReply] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "replied">("all");
  const [search, setSearch] = useState("");

  const filtered = conversations
    .filter((c) => filter === "all" || (filter === "unread" && !c.is_read) || (filter === "replied" && c.is_read))
    .filter((c) => !search || (c.lead_name?.toLowerCase().includes(search.toLowerCase()) ?? false));

  function handleSelect(c: InboxConversation) {
    setActive(c);
    if (!c.is_read) start(async () => { await markRead(c.id); });
  }

  function handleSend() {
    if (!active?.lead_id || !reply.trim()) return;
    start(async () => {
      await sendReply(active.lead_id!, `Re: ${active.subject || ""}`, reply.trim());
      setReply("");
    });
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader title="Smart Inbox" description="Unified inbox for all campaign replies" />

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] h-[calc(100vh-220px)]">
          {/* Conversation list */}
          <div className="border-r border-slate-100 flex flex-col">
            <div className="p-3 border-b border-slate-100 space-y-2">
              <Input
                leftIcon={<Search className="h-4 w-4" />}
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex items-center gap-1">
                {(["all", "unread", "replied"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      filter === f ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {f}
                  </button>
                ))}
                <button className="ml-auto p-1.5 rounded-md hover:bg-slate-100"><Filter className="h-3.5 w-3.5 text-slate-500" /></button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 text-center">No messages</p>
            ) : (
              <ul className="overflow-y-auto divide-y divide-slate-100 flex-1">
                {filtered.map((c) => (
                  <li
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className={`p-3 cursor-pointer transition-colors ${active?.id === c.id ? "bg-blue-50" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                        {(c.lead_name || "??").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className={`text-sm truncate ${!c.is_read ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                            {c.lead_name}
                          </p>
                          <span className="text-xs text-slate-400 flex-shrink-0">{relativeTime(c.created_at)}</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-1 truncate">{c.lead_company || "—"}</p>
                        <p className={`text-xs line-clamp-2 ${!c.is_read ? "text-slate-700" : "text-slate-500"}`}>{c.body}</p>
                        <div className="mt-1.5 flex items-center gap-1">
                          {c.campaign_name && <Badge variant="blue">{c.campaign_name}</Badge>}
                          {!c.is_read && <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Conversation view */}
          {active ? (
            <div className="flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center">
                    {(active.lead_name || "??").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{active.lead_name}</p>
                    <p className="text-xs text-slate-500">{active.lead_company || "—"} · {active.campaign_name || "Direct"}</p>
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
                <div className="flex">
                  <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed">{active.body}</p>
                    <p className="text-xs text-slate-400 mt-1.5">{active.lead_name} · {relativeTime(active.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 p-4">
                <div className="bg-white border border-slate-200 rounded-xl p-3">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
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
                      <Button size="sm" onClick={handleSend} disabled={!reply.trim() || pending}><Send className="h-3.5 w-3.5" /> {pending ? "Sending..." : "Send"}</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center text-slate-400">
              Select a conversation
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
