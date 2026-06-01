"use client";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";

interface Props {
  userName: string;
  userEmail: string;
  userRole: string;
  children: React.ReactNode;
}

function Shell({ userName, userEmail, userRole, children }: Props) {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={userRole} />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} role={userRole} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar userName={userName} userEmail={userEmail} userRole={userRole} />
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

export function AppShell(props: Props) {
  return (
    <SidebarProvider>
      <Shell {...props} />
    </SidebarProvider>
  );
}
