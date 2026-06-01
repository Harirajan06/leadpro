"use client";
import { createContext, useContext, useState } from "react";

interface SidebarCtx {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  toggleMobile: () => void;
}

const Ctx = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <Ctx.Provider value={{ mobileOpen, setMobileOpen, toggleMobile: () => setMobileOpen(!mobileOpen) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSidebar() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSidebar must be used inside SidebarProvider");
  return v;
}
