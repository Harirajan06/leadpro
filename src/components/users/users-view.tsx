"use client";
import { useState, useTransition, useEffect } from "react";
import { Search, Plus, MoreHorizontal, Shield, ShieldCheck, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { inviteUser, deleteUser, getUserPermissions, upsertPermission, type UserWithRole } from "@/lib/queries/users";

interface Props {
  users: UserWithRole[];
  roles: { role_id: number; role_name: string }[];
  menus: { menu_id: number; menu_name: string }[];
  isAdmin: boolean;
  currentUserId: string | null;
}

const roleIcon: Record<string, React.ReactNode> = {
  Admin: <ShieldCheck className="h-3 w-3" />,
  Manager: <Shield className="h-3 w-3" />,
  "Sales Rep": <User className="h-3 w-3" />,
};
const roleVariant: Record<string, "purple" | "blue" | "default"> = {
  Admin: "purple",
  Manager: "blue",
  "Sales Rep": "default",
};
const actionKeys = [
  { key: "can_create", label: "Create" },
  { key: "can_upload", label: "Upload" },
  { key: "can_delete", label: "Delete" },
  { key: "can_edit", label: "Edit" },
  { key: "can_view", label: "View" },
];

export function UsersView({ users, roles, menus, isAdmin, currentUserId }: Props) {
  const visibleUsers = isAdmin ? users : users.filter((u) => u.user_id === currentUserId);
  const [pending, start] = useTransition();
  const [showInvite, setShowInvite] = useState(false);
  const [permsUser, setPermsUser] = useState<UserWithRole | null>(null);
  const [perms, setPerms] = useState<Record<number, Record<string, boolean>>>({});
  const [form, setForm] = useState({ fullName: "", email: "", roleId: 3, managerId: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!permsUser) return;
    getUserPermissions(permsUser.user_id).then((data) => {
      const next: Record<number, Record<string, boolean>> = {};
      // Initialize all menus with default values
      menus.forEach((m) => {
        next[m.menu_id] = { can_view: false, can_create: false, can_upload: false, can_delete: false, can_edit: false };
      });
      // Apply existing permissions
      data.forEach((p) => {
        next[p.menu_id] = {
          can_view: p.can_view,
          can_create: p.can_create,
          can_upload: p.can_upload,
          can_delete: p.can_delete,
          can_edit: p.can_edit,
        };
      });
      setPerms(next);
    });
  }, [permsUser, menus]);

  const managers = users.filter((u) => u.role_name === "Manager");
  const filtered = visibleUsers.filter((u) => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  async function handleInvite() {
    setError(null);
    setSuccess(null);
    if (!form.fullName || !form.email) { setError("Name and email required"); return; }
    start(async () => {
      try {
        const result = await inviteUser(form.email, form.fullName, form.roleId, form.managerId || null);
        setSuccess(`User created. Temp password: ${result.tempPassword}`);
        setForm({ fullName: "", email: "", roleId: 3, managerId: "" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  }

  async function handleDelete(userId: string) {
    if (!confirm("Delete this user?")) return;
    start(async () => { await deleteUser(userId); });
  }

  async function handleSavePerms() {
    if (!permsUser) return;
    start(async () => {
      await Promise.all(
        Object.entries(perms).map(([menuId, p]) =>
          upsertPermission(permsUser.user_id, Number(menuId), p)
        )
      );
      setPermsUser(null);
    });
  }

  const adminCount = visibleUsers.filter((u) => u.role_name === "Admin").length;
  const managerCount = visibleUsers.filter((u) => u.role_name === "Manager").length;
  const repCount = visibleUsers.filter((u) => u.role_name === "Sales Rep").length;

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title="User Management"
        description="Manage your team, roles, and permissions"
        actions={isAdmin ? <Button onClick={() => { setShowInvite(true); setError(null); setSuccess(null); }}><Plus className="h-4 w-4" /> Create User</Button> : null}
      />

      {!isAdmin && (
        <div className="mb-6 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>You don&apos;t have permission to manage users. Please ask an admin.</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { role: "Admin", count: adminCount, color: "bg-purple-50 text-purple-600" },
          { role: "Manager", count: managerCount, color: "bg-blue-50 text-blue-600" },
          { role: "Sales Rep", count: repCount, color: "bg-slate-100 text-slate-600" },
        ].map((r) => (
          <Card key={r.role} className="p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${r.color}`}>
              {roleIcon[r.role]}
            </div>
            <div>
              <p className="text-sm text-slate-500">{r.role}s</p>
              <p className="text-2xl font-bold text-slate-900">{r.count}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] max-w-md">
            <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Manager</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-500">No users found.</td></tr>
              )}
              {filtered.map((u) => (
                <tr key={u.user_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center">
                        {(u.full_name || "").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{u.full_name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={roleVariant[u.role_name] || "default"}>{roleIcon[u.role_name]} {u.role_name}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.manager_name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-sm ${u.status === "ACTIVE" ? "text-emerald-700" : "text-slate-400"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-300"}`} />
                      {u.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setPermsUser(u)}>Permissions</Button>
                      <button onClick={() => handleDelete(u.user_id)} disabled={pending} className="p-1 rounded-md hover:bg-red-50 text-red-500 disabled:opacity-50">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Create new user" size="md">
        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" /><span>{success}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="John Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@leadpro.ai" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role *</label>
              <Select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: Number(e.target.value) })}>
                {roles.map((r) => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Manager</label>
              <Select value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })}>
                <option value="">—</option>
                {managers.map((m) => <option key={m.user_id} value={m.user_id}>{m.full_name}</option>)}
              </Select>
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowInvite(false)} disabled={pending}>Close</Button>
          <Button onClick={handleInvite} disabled={pending}>{pending ? "Creating..." : "Create user"}</Button>
        </div>
      </Modal>

      {/* Permissions modal */}
      <Modal open={permsUser !== null} onClose={() => setPermsUser(null)} title="Manage permissions" description={permsUser ? `For ${permsUser.full_name}` : ""} size="lg">
        <div className="p-5">
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Module</th>
                  {actionKeys.map((a) => (
                    <th key={a.key} className="px-3 py-3 text-center font-semibold text-slate-700">{a.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {menus.map((m) => (
                  <tr key={m.menu_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{m.menu_name}</td>
                    {actionKeys.map((a) => (
                      <td key={a.key} className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={perms[m.menu_id]?.[a.key] || false}
                          onChange={(e) =>
                            setPerms({ ...perms, [m.menu_id]: { ...perms[m.menu_id], [a.key]: e.target.checked } })
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPermsUser(null)} disabled={pending}>Cancel</Button>
          <Button onClick={handleSavePerms} disabled={pending}>{pending ? "Saving..." : "Save permissions"}</Button>
        </div>
      </Modal>
    </div>
  );
}
