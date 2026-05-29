"use client";
import { useState } from "react";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { industries, interestAreas } from "@/lib/mock-data";
import { User, Building2 } from "lucide-react";

export function LeadForm({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState("details");
  const [mode, setMode] = useState<"person" | "company">("person");

  return (
    <div>
      <div className="px-5 pt-4">
        <Tabs
          tabs={[
            { id: "details", label: "Lead Details" },
            { id: "additional", label: "Additional Info" },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className="p-5 space-y-4">
        {tab === "details" && (
          <>
            {/* Mode toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
              <button
                onClick={() => setMode("person")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                  mode === "person" ? "bg-white shadow-sm text-slate-900" : "text-slate-600"
                }`}
              >
                <User className="h-3.5 w-3.5" /> Person
              </button>
              <button
                onClick={() => setMode("company")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                  mode === "company" ? "bg-white shadow-sm text-slate-900" : "text-slate-600"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" /> Company
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {mode === "person" ? "Full Name" : "Company Name"} *
                </label>
                <Input placeholder={mode === "person" ? "John Smith" : "ABC Corporation"} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                <Input type="email" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Website URL</label>
                <Input placeholder="company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                <Input placeholder="+1 415 555 0142" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">LinkedIn Profile URL</label>
                <Input placeholder="linkedin.com/in/..." />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message / Request</label>
                <Textarea placeholder="What is the lead interested in?" rows={3} />
              </div>
            </div>
          </>
        )}

        {tab === "additional" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
              <Select>
                <option value="">Select industry</option>
                {industries.map((i) => <option key={i}>{i}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Interest Area</label>
              <Select>
                <option value="">Select interest</option>
                {interestAreas.map((a) => <option key={a}>{a}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Source</label>
              <Select>
                <option>Website Form</option>
                <option>Ebook Download</option>
                <option>Webinar</option>
                <option>Cold Email</option>
                <option>Referral</option>
                <option>LinkedIn</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <Select>
                <option>New</option>
                <option>Warm</option>
                <option>Hot</option>
                <option>Scored</option>
                <option>Converted</option>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={onClose}>Save lead</Button>
      </div>
    </div>
  );
}
