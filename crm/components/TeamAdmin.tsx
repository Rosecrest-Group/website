"use client";

import { useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import { USER_ROLE_OPTIONS } from "@/crm/lib/constants";
import type { AdminUserSummary, ApiUser, UserRole } from "@/crm/types";
import { toast } from "sonner";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextField from "@/crm/components/ui/TextField";
import SelectField from "@/crm/components/ui/SelectField";
import Table, { type Column } from "@/crm/components/ui/Table";
import StatusPill from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

function roleLabel(role: UserRole) {
  return USER_ROLE_OPTIONS.find((opt) => opt.value === role)?.label ?? role;
}

function canAccessTeam(role: UserRole) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function canManageTeam(role: UserRole) {
  return role === "SUPER_ADMIN";
}

type TeamRow = AdminUserSummary & Record<string, unknown>;

export default function TeamAdmin() {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [users, setUsers] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [invite, setInvite] = useState({ email: "", fullName: "", role: "OPS" as UserRole });
  const [inviting, setInviting] = useState(false);

  const isManager = currentUser ? canManageTeam(currentUser.role) : false;

  async function load() {
    setLoading(true);
    setError("");
    try {
      const me = await api.getMe();
      setCurrentUser(me);

      if (!canAccessTeam(me.role)) {
        setUsers([]);
        setError("You need Admin or Super Admin access to manage the team.");
        return;
      }

      const r = await api.listAdminUsers(true);
      setUsers(r.items as TeamRow[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load team";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!isManager) {
      toast.error("Only Super Admins can invite teammates");
      return;
    }

    setInviting(true);
    try {
      const user = await api.inviteTeamUser(invite);
      toast.success(`Invited ${user.fullName}`);
      setInvite({ email: "", fullName: "", role: "OPS" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  }

  async function updateUser(
    id: string,
    payload: { role?: string; isActive?: boolean; credentials?: string | null }
  ) {
    if (!isManager) {
      toast.error("Only Super Admins can update team members");
      return;
    }

    setSavingId(id);
    try {
      const updated = await api.updateTeamUser(id, payload);
      setUsers((list) => list.map((u) => (u.id === updated.id ? (updated as TeamRow) : u)));
      toast.success(`Updated ${updated.fullName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingId(null);
    }
  }

  const columns: Column<TeamRow>[] = [
    { key: "fullName", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "credentials",
      header: "Credentials",
      render: (value, row) =>
        isManager ? (
          <input
            type="text"
            defaultValue={typeof value === "string" ? value : ""}
            placeholder="e.g. MRICS, BSc"
            disabled={savingId === row.id}
            className="h-10 w-full min-w-[160px] rounded-xl border border-(--color-tc-20) bg-white px-3 text-sm text-(--color-tc-40) outline-none focus:ring-2 focus:ring-(--color-primary)/20"
            onBlur={(e) => {
              const next = e.target.value.trim();
              const current = (row.credentials ?? "").trim();
              if (next === current) return;
              void updateUser(row.id, { credentials: next || null });
            }}
          />
        ) : (
          <span className="text-sm text-(--color-tc-30)">
            {typeof value === "string" && value ? value : "—"}
          </span>
        ),
    },
    {
      key: "role",
      header: "Role",
      render: (value, row) =>
        isManager ? (
          <SelectField
            value={String(value)}
            onChange={(e) => updateUser(row.id, { role: e.target.value })}
            disabled={savingId === row.id}
          >
            {USER_ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectField>
        ) : (
          <span>{roleLabel(String(value) as UserRole)}</span>
        ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (value) => (
        <StatusPill
          variant={value !== false ? "completed" : "failed"}
          label={value !== false ? "Active" : "Inactive"}
        />
      ),
    },
    ...(isManager
      ? [
          {
            key: "id",
            header: "Actions",
            render: (_value: unknown, row: TeamRow) => (
              <SecondaryButton
                type="button"
                size="small"
                className="w-auto"
                disabled={savingId === row.id || row.id === currentUser?.id}
                onClick={() => updateUser(row.id, { isActive: row.isActive === false })}
              >
                {row.isActive === false ? "Reactivate" : "Deactivate"}
              </SecondaryButton>
            ),
          } satisfies Column<TeamRow>,
        ]
      : []),
  ];

  if (loading) {
    return (
      <CrmPageContent>
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  if (error && users.length === 0) {
    return (
      <CrmPageContent>
        <CrmPageHeader title="Team" subtitle="Invite teammates and manage CRM roles." />
        <CrmPanel title="Access restricted">
          <p className="text-sm text-(--color-tc-40)">{error}</p>
        </CrmPanel>
      </CrmPageContent>
    );
  }

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Team"
        subtitle={
          isManager
            ? "Invite teammates and manage CRM roles."
            : "View your Rosecrest CRM team. Contact a Super Admin to make changes."
        }
      />

      {isManager ? (
        <CrmPanel title="Invite teammate">
          <form className="grid gap-4 md:grid-cols-3" onSubmit={submitInvite}>
            <TextField
              label="Full name"
              value={invite.fullName}
              onChange={(e) => setInvite({ ...invite, fullName: e.target.value })}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={invite.email}
              onChange={(e) => setInvite({ ...invite, email: e.target.value })}
              required
            />
            <SelectField
              label="Role"
              value={invite.role}
              onChange={(e) => setInvite({ ...invite, role: e.target.value as UserRole })}
            >
              {USER_ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </SelectField>
            <div className="md:col-span-3">
              <PrimaryButton type="submit" className="w-auto" disabled={inviting}>
                {inviting ? "Sending invite…" : "Send invite"}
              </PrimaryButton>
            </div>
          </form>
        </CrmPanel>
      ) : null}

      {error ? <p className="mb-4 text-sm text-orange-700">{error}</p> : null}
      <Table
        title="Team members"
        columns={columns}
        data={users}
        getRowKey={(row) => row.id}
        emptyMessage="No team members yet"
        totalCount={users.length}
      />
    </CrmPageContent>
  );
}
