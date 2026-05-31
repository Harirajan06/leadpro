import { getUsers, getRoles, getMenus, getCurrentUserProfile } from "@/lib/queries/users";
import { UsersView } from "@/components/users/users-view";

export default async function UsersPage() {
  const [users, roles, menus, profile] = await Promise.all([
    getUsers(),
    getRoles(),
    getMenus(),
    getCurrentUserProfile(),
  ]);
  const p = profile as { role_id?: number | null; roles?: { role_name?: string } | null } | null;
  const isAdmin = p?.roles?.role_name === "Admin" || p?.role_id === 1;
  return <UsersView users={users} roles={roles} menus={menus} isAdmin={isAdmin} currentUserId={p ? (profile as { user_id: string }).user_id : null} />;
}
