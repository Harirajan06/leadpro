import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profile
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email, role_id, roles(role_name)")
    .eq("user_id", user.id)
    .single();

  const userName = profile?.full_name || user.email?.split("@")[0] || "User";
  const userEmail = profile?.email || user.email || "";
  const userRole =
    (profile as { roles?: { role_name?: string } } | null)?.roles?.role_name || "User";

  return (
    <AppShell userName={userName} userEmail={userEmail} userRole={userRole}>
      {children}
    </AppShell>
  );
}
