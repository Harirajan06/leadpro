"use client";
import { Search, Bell, Plus, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex-1 max-w-md">
        <Input
          leftIcon={<Search className="h-4 w-4" />}
          placeholder="Search leads, campaigns, segments..."
          className="bg-slate-50 border-transparent focus:bg-white"
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="hidden md:inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Create
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        <button className="relative h-9 w-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1" />

        <button className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-lg hover:bg-slate-50">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
            AR
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-900 leading-tight">Anuradha R.</p>
            <p className="text-xs text-slate-500 leading-tight">Admin</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>
    </header>
  );
}
