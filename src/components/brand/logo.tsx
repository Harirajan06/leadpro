import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-bold text-slate-900 text-lg tracking-tight">LeadPro</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">AI Engagement</span>
        </div>
      )}
    </div>
  );
}
