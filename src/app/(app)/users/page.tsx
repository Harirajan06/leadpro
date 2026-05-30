import { getUsers, getRoles, getMenus } from "@/lib/queries/users";
import { UsersView } from "@/components/users/users-view";

export default async function UsersPage() {
  const [users, roles, menus] = await Promise.all([getUsers(), getRoles(), getMenus()]);
  return <UsersView users={users} roles={roles} menus={menus} />;
}
