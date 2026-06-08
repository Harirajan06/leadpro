import { LayoutDashboard, Users2, Send, Layers3, Workflow, FileText, BarChart3, Inbox, Newspaper, UserCog, Settings, Link2, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Role = "Super Admin" | "Sales Admin" | "Marketing Admin" | string;

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Which roles can see this nav item */
  roles: Role[];
}

const ALL: Role[] = ["Super Admin", "Sales Admin", "Marketing Admin"];
const SALES: Role[] = ["Super Admin", "Sales Admin"];
const MARKETING: Role[] = ["Super Admin", "Marketing Admin"];
const SUPER: Role[] = ["Super Admin"];

export const navMainItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ALL },
  { label: "Leads", href: "/leads", icon: Users2, roles: SALES },
  { label: "Segments", href: "/segments", icon: Layers3, roles: MARKETING },
  { label: "Campaigns", href: "/campaigns", icon: Send, roles: SALES },
  { label: "Outreach", href: "/outreach", icon: Rocket, roles: SALES },
  { label: "Newsletters", href: "/newsletters", icon: Newspaper, roles: MARKETING },
  { label: "Workflows", href: "/workflows", icon: Workflow, roles: ALL },
  { label: "Inbox", href: "/inbox", icon: Inbox, roles: SALES },
  { label: "Templates", href: "/templates", icon: FileText, roles: ALL },
  { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ALL },
];

export const navAdminItems: NavItem[] = [
  { label: "User Management", href: "/users", icon: UserCog, roles: SUPER },
  { label: "Capture Form", href: "/capture-form", icon: Link2, roles: SUPER },
  { label: "Settings", href: "/settings", icon: Settings, roles: ALL },
];

export function filterNavByRole(items: NavItem[], role: Role | null | undefined): NavItem[] {
  if (!role) return items;
  return items.filter((i) => i.roles.includes(role));
}
