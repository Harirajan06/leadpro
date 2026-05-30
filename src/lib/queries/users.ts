"use server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UserRow {
  user_id: string;
  full_name: string;
  email: string;
  role_id: number | null;
  manager_id: string | null;
  status: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole extends UserRow {
  role_name: string;
  manager_name: string | null;
}

export async function getUsers(): Promise<UserWithRole[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select(`*, roles(role_name)`)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getUsers error:", error.message);
    return [];
  }
  if (!data) return [];

  // Build manager_name lookup from same data
  const byId = new Map(data.map((u) => [u.user_id, u.full_name as string]));

  return data.map((u) => {
    const row = u as typeof u & { roles?: { role_name?: string } };
    return {
      ...u,
      role_name: row.roles?.role_name || "—",
      manager_name: u.manager_id ? byId.get(u.manager_id) || null : null,
    };
  });
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("users")
    .select("*, roles(role_name)")
    .eq("user_id", user.id)
    .single();
  return data;
}

export async function getRoles() {
  const supabase = await createClient();
  const { data } = await supabase.from("roles").select("*").order("role_id");
  return data || [];
}

export async function getMenus() {
  const supabase = await createClient();
  const { data } = await supabase.from("menus").select("*").order("menu_id");
  return data || [];
}

export async function getUserPermissions(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_permissions")
    .select("*, menus(menu_name)")
    .eq("user_id", userId);
  return data || [];
}

export async function updateUserStatus(userId: string, status: string) {
  const supabase = await createClient();
  await supabase.from("users").update({ status }).eq("user_id", userId);
  revalidatePath("/users");
}

export async function updateUserRole(userId: string, roleId: number, managerId: string | null) {
  const supabase = await createClient();
  await supabase.from("users").update({ role_id: roleId, manager_id: managerId }).eq("user_id", userId);
  revalidatePath("/users");
}

export async function upsertPermission(userId: string, menuId: number, perms: { can_view?: boolean; can_create?: boolean; can_edit?: boolean; can_delete?: boolean; can_upload?: boolean }) {
  const supabase = await createClient();
  await supabase.from("user_permissions").upsert(
    { user_id: userId, menu_id: menuId, ...perms },
    { onConflict: "user_id,menu_id" }
  );
  revalidatePath("/users");
}

export async function inviteUser(email: string, fullName: string, roleId: number, managerId: string | null) {
  const admin = createAdminClient();
  const tempPassword = `Temp${Math.random().toString(36).slice(2, 10)}!A`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw error;
  // Update role + manager (trigger sets defaults)
  await admin.from("users").update({ role_id: roleId, manager_id: managerId, full_name: fullName }).eq("user_id", data.user.id);
  revalidatePath("/users");
  return { user: data.user, tempPassword };
}

export async function deleteUser(userId: string) {
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(userId);
  revalidatePath("/users");
}
