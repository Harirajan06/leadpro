"use client";
import { useState } from "react";
import { Search, Plus, MoreHorizontal, Shield, ShieldCheck, User } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { users, menuPermissions, permissionActions, type Role } from "@/lib/mock-data";

const roleIcon: Record<Role, React.ReactNode> = {
  Admin: <ShieldCheck className="h-3 w-3" />,
  Manager: <Shield className="h-3 w-3" />,
  "Sales Rep": <User className="h-3 w-3" />,
};

const roleVariant: Record<Role, "purple" | "blue" | "default"> = {
  Admin: "purple",
  Manager: "blue",
  "Sales Rep": "default",
};

export default function UsersPage() {
  const [showForm, setShowForm] = useState(false);
  const [showPerms, setShowPerms] = useState(false);
  const [perms, setPerms] = useState<Record<string, Record<string, boolean>>>(
    Object.fromEntries(
      menuPermissions.map((m) => [m, Object.fromEntries(permissionActions.map((a) => [a, a === "View"]))])
    )
  );

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title="User Management"
        description="Manage your team, roles, and permissions"
        actions={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Create User</Button>}
      />

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(["Admin", "Manager", "Sales Rep"] as Role[]).map((r) => {
          const count = users.filter((u) => u.role === r).length;
          return (
            <Card key={r} className="p-5 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                r === "Admin" ? "bg-purple-50 text-purple-600" : r === "Manager" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"
              }`}>
                {roleIcon[r]}
              </div>
              <div>
                <p className="text-sm text-slate-500">{r}s</p>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] max-w-md">
            <Input leftIcon={<Search className="h-4 w-4" />} placeholder="Search users..." />
          </div>
          <Select className="max-w-[160px]">
            <option>All roles</option>
            <option>Admin</option>
            <option>Manager</option>
            <option>Sales Rep</option>
          </Select>
          <Select className="max-w-[140px]">
            <option>All status</option>
            <option>Active</option>
            <option>Inactive</option>
          </Select>
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
                <th className="px-4 py-3 font-semibold">Last login</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center">
                        {u.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{u.fullName}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={roleVariant[u.role]}>{roleIcon[u.role]} {u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.manager || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-sm ${u.status === "Active" ? "text-emerald-700" : "text-slate-400"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.status === "Active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.createdAt}</td>
                  <td className="px-4 py-3 text-slate-500">{u.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setShowPerms(true)}>Permissions</Button>
                      <button className="p-1 rounded-md hover:bg-slate-100"><MoreHorizontal className="h-4 w-4 text-slate-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create user modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create new user" size="md">
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
            <Input placeholder="John Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
            <Input type="email" placeholder="john@leadpro.ai" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role *</label>
              <Select>
                <option>Admin</option>
                <option>Manager</option>
                <option>Sales Rep</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Assigned Manager</label>
              <Select>
                <option>—</option>
                <option>James Wilson</option>
                <option>Sophie Turner</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <div className="flex gap-2">
              <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 cursor-pointer">
                <input type="radio" name="status" defaultChecked className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Active</span>
              </label>
              <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer">
                <input type="radio" name="status" className="text-slate-600" />
                <span className="text-sm font-medium text-slate-600">Inactive</span>
              </label>
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button onClick={() => setShowForm(false)}>Create user</Button>
        </div>
      </Modal>

      {/* Permission Matrix Modal */}
      <Modal open={showPerms} onClose={() => setShowPerms(false)} title="Manage permissions" description="Configure access per module" size="lg">
        <div className="p-5">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm text-blue-900">
            Configuring permissions for <strong>Ryan Park</strong> · Sales Rep · Manager: James Wilson
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Module</th>
                  {permissionActions.map((a) => (
                    <th key={a} className="px-3 py-3 text-center font-semibold text-slate-700">{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {menuPermissions.map((m) => (
                  <tr key={m} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{m}</td>
                    {permissionActions.map((a) => (
                      <td key={a} className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={perms[m]?.[a] || false}
                          onChange={(e) =>
                            setPerms({ ...perms, [m]: { ...perms[m], [a]: e.target.checked } })
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
          <Button variant="outline" onClick={() => setShowPerms(false)}>Cancel</Button>
          <Button onClick={() => setShowPerms(false)}>Save permissions</Button>
        </div>
      </Modal>
    </div>
  );
}
