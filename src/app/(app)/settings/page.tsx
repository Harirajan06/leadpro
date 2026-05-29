"use client";
import { useState } from "react";
import { User, Mail, Bell, Key, ShieldCheck, Ban, CreditCard, Plus, Check, Trash2, ExternalLink } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

const sections = [
  { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  { id: "email", label: "Email Accounts", icon: <Mail className="h-4 w-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  { id: "api", label: "API Keys", icon: <Key className="h-4 w-4" /> },
  { id: "blocklist", label: "Blocklist", icon: <Ban className="h-4 w-4" /> },
  { id: "billing", label: "Billing", icon: <CreditCard className="h-4 w-4" /> },
  { id: "security", label: "Security", icon: <ShieldCheck className="h-4 w-4" /> },
];

export default function SettingsPage() {
  const [active, setActive] = useState("profile");

  return (
    <div className="max-w-[1400px] mx-auto">
      <PageHeader title="Settings" description="Configure your account, integrations, and platform preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <Card className="p-2 h-fit">
          <ul className="space-y-0.5">
            {sections.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active === s.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {s.icon} {s.label}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-4">
          {active === "profile" && (
            <>
              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 mb-1">Profile</h3>
                <p className="text-sm text-slate-500 mb-5">Update your personal information</p>

                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center">AR</div>
                  <div>
                    <Button variant="outline" size="sm">Upload photo</Button>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG, max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                    <Input defaultValue="Anuradha Ramachandran" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <Input defaultValue="anu@leadpro.ai" type="email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                    <Input defaultValue="Admin" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Timezone</label>
                    <Select>
                      <option>America / Los Angeles</option>
                      <option>America / New York</option>
                      <option>Asia / Kolkata</option>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-5">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save changes</Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 mb-1">Change password</h3>
                <p className="text-sm text-slate-500 mb-5">Update your account password</p>
                <div className="space-y-3 max-w-md">
                  <Input type="password" placeholder="Current password" />
                  <Input type="password" placeholder="New password" />
                  <Input type="password" placeholder="Confirm new password" />
                  <Button>Update password</Button>
                </div>
              </Card>
            </>
          )}

          {active === "email" && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-1">Connected email accounts</h3>
              <p className="text-sm text-slate-500 mb-5">Connect SMTP accounts for sending campaigns</p>

              <div className="space-y-3">
                {[
                  { email: "anu@leadpro.ai", provider: "Google Workspace", verified: true, sent: 284, default: true },
                  { email: "james@leadpro.ai", provider: "Outlook 365", verified: true, sent: 192, default: false },
                  { email: "sales@leadpro.ai", provider: "Custom SMTP", verified: false, sent: 47, default: false },
                ].map((a) => (
                  <div key={a.email} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Mail className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{a.email}</p>
                          {a.default && <Badge variant="blue">Default</Badge>}
                        </div>
                        <p className="text-xs text-slate-500">{a.provider} · {a.sent} sent today</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.verified ? (
                        <Badge variant="success"><Check className="h-2.5 w-2.5" /> Verified</Badge>
                      ) : (
                        <Badge variant="warning">Warming up</Badge>
                      )}
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full"><Plus className="h-4 w-4" /> Connect new email account</Button>
              </div>
            </Card>
          )}

          {active === "notifications" && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-1">Notification preferences</h3>
              <p className="text-sm text-slate-500 mb-5">Choose what you want to be notified about</p>
              <div className="space-y-3">
                {[
                  { label: "Hot lead alerts", desc: "When a lead score crosses 80", on: true },
                  { label: "Campaign completion", desc: "When a campaign finishes sending", on: true },
                  { label: "New replies in inbox", desc: "Email notification for new replies", on: true },
                  { label: "Weekly performance digest", desc: "Summary every Monday morning", on: true },
                  { label: "Workflow errors", desc: "When an automation fails", on: false },
                  { label: "AI scoring updates", desc: "When AI re-scores major prospects", on: false },
                ].map((n) => (
                  <label key={n.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-slate-900">{n.label}</p>
                      <p className="text-sm text-slate-500">{n.desc}</p>
                    </div>
                    <button
                      className={`relative h-6 w-11 rounded-full transition-colors ${n.on ? "bg-blue-600" : "bg-slate-300"}`}
                    >
                      <span className={`absolute top-0.5 ${n.on ? "right-0.5" : "left-0.5"} h-5 w-5 rounded-full bg-white shadow transition`} />
                    </button>
                  </label>
                ))}
              </div>
            </Card>
          )}

          {active === "api" && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-1">API & Integration Keys</h3>
              <p className="text-sm text-slate-500 mb-5">Manage credentials for AI and third-party services</p>

              <div className="space-y-3">
                {[
                  { name: "OpenAI API Key", masked: "sk-•••••••••••••••••3a92", icon: "🤖" },
                  { name: "SendGrid API Key", masked: "SG.•••••••••••••••K27a", icon: "📧" },
                  { name: "HubSpot Access Token", masked: "pat-na1-•••••••••••e9f4", icon: "🟧" },
                  { name: "Webhook Secret", masked: "whsec_•••••••••••••••12b8", icon: "🔐" },
                ].map((k) => (
                  <div key={k.name} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">{k.icon}</div>
                      <div>
                        <p className="font-semibold text-slate-900">{k.name}</p>
                        <code className="text-xs text-slate-500 font-mono">{k.masked}</code>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">Regenerate</Button>
                      <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full"><Plus className="h-4 w-4" /> Add new key</Button>
              </div>
            </Card>
          )}

          {active === "blocklist" && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-1">Blocklist</h3>
              <p className="text-sm text-slate-500 mb-5">Email addresses and domains excluded from all campaigns</p>
              <div className="flex gap-2 mb-4">
                <Input placeholder="email@example.com or @domain.com" />
                <Button>Add</Button>
              </div>
              <div className="space-y-2">
                {["competitor.com", "@example.org", "spam@bad.com", "@blocked-domain.io"].map((b) => (
                  <div key={b} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <code className="text-sm text-slate-700 font-mono">{b}</code>
                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {active === "billing" && (
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-slate-900">Current plan</h3>
                    <p className="text-sm text-slate-500">Manage your subscription</p>
                  </div>
                  <Badge variant="purple">Pro</Badge>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
                  <p className="text-sm text-blue-100">Pro Plan</p>
                  <p className="text-3xl font-bold mt-1">$249<span className="text-base font-normal text-blue-100">/mo</span></p>
                  <p className="text-sm text-blue-100 mt-2">Next billing: June 28, 2026</p>
                  <Button variant="outline" className="mt-4 bg-white">Upgrade plan</Button>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Usage</h3>
                <div className="space-y-3">
                  {[
                    { label: "AI credits", used: 2847, total: 5000 },
                    { label: "Emails sent", used: 9517, total: 25000 },
                    { label: "Active leads", used: 2847, total: 10000 },
                  ].map((u) => (
                    <div key={u.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{u.label}</span>
                        <span className="text-slate-500">{u.used.toLocaleString()} / {u.total.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(u.used / u.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {active === "security" && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-1">Security</h3>
              <p className="text-sm text-slate-500 mb-5">Multi-factor authentication and session management</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-900">Email OTP verification</p>
                    <p className="text-sm text-slate-500">Required on every login</p>
                  </div>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-900">Authenticator app</p>
                    <p className="text-sm text-slate-500">Use Google Authenticator or Authy</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-900">Active sessions</p>
                    <p className="text-sm text-slate-500">3 active sessions across 2 devices</p>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
