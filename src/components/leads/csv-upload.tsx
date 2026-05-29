"use client";
import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CsvUpload({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"upload" | "preview">("upload");

  return (
    <div>
      <div className="p-5 space-y-5">
        {step === "upload" && (
          <>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center bg-slate-50">
              <div className="h-12 w-12 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium text-slate-900 mb-1">Drop your CSV file here</p>
              <p className="text-sm text-slate-500 mb-4">or click to browse</p>
              <Button onClick={() => setStep("preview")}>Choose file</Button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="font-semibold text-slate-900 text-sm mb-2">Required CSV columns:</p>
              <ul className="text-sm text-slate-700 space-y-1.5">
                <li className="flex items-center gap-2"><span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">Full Name</span> or <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">CompanyName</span> required</li>
                <li className="flex items-center gap-2"><span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">Email</span> or <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">webUrl</span> required</li>
                <li className="flex items-center gap-2 text-slate-500"><span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">interestArea</span>, <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">linkedin</span> optional</li>
              </ul>
              <button className="text-sm text-blue-700 font-medium mt-3 hover:underline">Download template →</button>
            </div>
          </>
        )}

        {step === "preview" && (
          <>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
              <div className="flex-1">
                <p className="font-medium text-slate-900 text-sm">leads_export_may2026.csv</p>
                <p className="text-xs text-slate-500">142 rows · 12 KB</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-700">138</p>
                <p className="text-xs text-emerald-600 mt-1">Valid rows</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-700">3</p>
                <p className="text-xs text-amber-600 mt-1">Warnings</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-700">1</p>
                <p className="text-xs text-red-600 mt-1">Errors</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Full Name</th>
                    <th className="px-3 py-2 text-left font-semibold">Email</th>
                    <th className="px-3 py-2 text-left font-semibold">Company</th>
                    <th className="px-3 py-2 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="px-3 py-2">Jane Doe</td><td className="px-3 py-2">jane@acme.com</td><td className="px-3 py-2">Acme Inc</td><td className="px-3 py-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></td></tr>
                  <tr><td className="px-3 py-2">Mark Lee</td><td className="px-3 py-2">mark@beta.io</td><td className="px-3 py-2">Beta Co</td><td className="px-3 py-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></td></tr>
                  <tr className="bg-red-50/50"><td className="px-3 py-2 text-slate-400">—</td><td className="px-3 py-2 text-red-600">invalid</td><td className="px-3 py-2 text-slate-400">—</td><td className="px-3 py-2"><AlertCircle className="h-4 w-4 text-red-500" /></td></tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        {step === "preview" && <Button onClick={onClose}>Import 138 leads</Button>}
      </div>
    </div>
  );
}
