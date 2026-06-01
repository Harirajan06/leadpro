"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAiCreditsUsage } from "@/lib/queries/credits";
import { getUnreadInboxCount } from "@/lib/queries/inbox";
import { Sparkles, HelpCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { navMainItems, navAdminItems, filterNavByRole } from "@/lib/nav-config";

export function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const [credits, setCredits] = useState<{ used: number; total: number } | null>(null);
  const [inboxUnread, setInboxUnread] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    getAiCreditsUsage().then((c) => { if (!cancelled) setCredits(c); }).catch(() => {});
    getUnreadInboxCount().then((n) => { if (!cancelled) setInboxUnread(n); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const main = filterNavByRole(navMainItems, role);
  const admin = filterNavByRole(navAdminItems, role);

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-slate-100"><Logo /></div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        <div>
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
          <ul className="space-y-0.5">
            {main.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const showBadge = item.href === "/inbox" && inboxUnread > 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                      active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("h-4.5 w-4.5 flex-shrink-0", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} strokeWidth={2} />
                    <span className="flex-1">{item.label}</span>
                    {showBadge && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {inboxUnread > 9 ? "9+" : inboxUnread}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {admin.length > 0 && (
          <div>
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Admin</p>
            <ul className="space-y-0.5">
              {admin.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                        active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <Icon className={cn("h-4.5 w-4.5", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} strokeWidth={2} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-slate-100 space-y-2">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4" />
            <p className="font-semibold text-sm">AI Credits</p>
          </div>
          <p className="text-xs text-blue-100 mb-2">
            {credits ? `${credits.used.toLocaleString()} / ${credits.total.toLocaleString()} used` : "Loading..."}
          </p>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: credits ? `${Math.min(100, Math.round((credits.used / credits.total) * 100))}%` : "0%" }}
            />
          </div>
          <Link href="/billing" className="mt-3 inline-block text-xs font-medium text-white/90 hover:text-white">Upgrade plan →</Link>
        </div>

        <Link
          href="/help"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <HelpCircle className="h-4.5 w-4.5 text-slate-400" />
          Help & Support
        </Link>
      </div>
    </aside>
  );
}
