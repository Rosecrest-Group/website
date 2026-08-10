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
import TextField from "@/crm/components/ui/TextField";
import SelectField from "@/crm/components/ui/SelectField";
import Table, { type Column } from "@/crm/components/ui/Table";
import StatusPill from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import ConfirmModal from "@/crm/components/ui/ConfirmModal";

function roleLabel(role: UserRole) {
  return USER_ROLE_OPTIONS.find((opt) => opt.value === role)?.label ?? role;
}

function canAccessTeam(role: UserRole) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function canManageTeam(role: UserRole) {
  return role === "SUPER_ADMIN";
}

/** Name + post-nominals, e.g. "Barisuka, BSc, MRICS" */
function formatNameWithCredentials(fullName: string, credentials?: string | null) {
  const creds = credentials?.trim();
  if (!creds) return fullName;
  return `${fullName}, ${creds}`;
}

type TeamRow = AdminUserSummary & Record<string, unknown>;

export default function TeamAdmin() {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [users, setUsers] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [invite, setInvite] = useState({
    email: "",
    fullName: "",
    role: "OPS" as UserRole,
    credentials: "",
  });
  const [inviting, setInviting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamRow | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

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
      const credentials = invite.credentials.trim();
      const user = await api.inviteTeamUser({
        email: invite.email,
        fullName: invite.fullName,
        role: invite.role,
        ...(credentials ? { credentials } : {}),
      });
      toast.success(`Invite sent to ${user.fullName}. They’ll stay inactive until they set a password.`);
      setInvite({ email: "", fullName: "", role: "OPS", credentials: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setInviting(false);
    }
  }

  async function updateUser(
    id: string,
    payload: { role?: string; isActive?: boolean }
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

  async function confirmRemoveUser() {
    if (!removeTarget) return;
    if (!isManager) {
      toast.error("Only Super Admins can remove team members");
      return;
    }

    setRemoving(true);
    setRemoveError("");
    setSavingId(removeTarget.id);
    try {
      await api.removeTeamUser(removeTarget.id);
      setUsers((list) => list.filter((u) => u.id !== removeTarget.id));
      toast.success(`Removed ${removeTarget.fullName}`);
      setRemoveTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Remove failed";
      setRemoveError(message);
      toast.error(message);
    } finally {
      setRemoving(false);
      setSavingId(null);
    }
  }

  async function handleAction(row: TeamRow, action: string) {
    if (!action) return;
    if (action === "deactivate") {
      await updateUser(row.id, { isActive: false });
      return;
    }
    if (action === "reactivate") {
      await updateUser(row.id, { isActive: true });
      return;
    }
    if (action === "remove") {
      setRemoveError("");
      setRemoveTarget(row);
    }
  }

  const columns: Column<TeamRow>[] = [
    {
      key: "fullName",
      header: "Name",
      render: (_value, row) => (
        <span>{formatNameWithCredentials(row.fullName, row.credentials)}</span>
      ),
    },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (value, row) =>
        isManager ? (
          <SelectField
            value={String(value)}
            onChange={(e) => updateUser(row.id, { role: e.target.value })}
            disabled={savingId === row.id || row.id === currentUser?.id}
          >
            {USER_ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectField>
        ) : (
          <span className="inline-flex min-h-[42px] min-w-[140px] items-center rounded-lg border border-transparent py-2.5 pl-3 pr-10 text-sm text-ink">
            {roleLabel(String(value) as UserRole)}
          </span>
        ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (value) => (
        <StatusPill
          variant={value !== false ? "completed" : "pending"}
          label={value !== false ? "Active" : "Inactive"}
        />
      ),
    },
    ...(isManager
      ? [
          {
            key: "id",
            header: "Actions",
            render: (_value: unknown, row: TeamRow) => {
              const isSelf = row.id === currentUser?.id;
              return (
                <SelectField
                  aria-label={`Actions for ${row.fullName}`}
                  value=""
                  disabled={savingId === row.id || isSelf}
                  onChange={(e) => {
                    const action = e.target.value;
                    e.target.value = "";
                    void handleAction(row, action);
                  }}
                >
                  <option value="" disabled>
                    {isSelf ? "—" : "Actions"}
                  </option>
                  {row.isActive === false ? (
                    <option value="reactivate">Reactivate</option>
                  ) : (
                    <option value="deactivate">Deactivate</option>
                  )}
                  <option value="remove">Remove</option>
                </SelectField>
              );
            },
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
          <form className="grid gap-4 md:grid-cols-2" onSubmit={submitInvite}>
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
            <TextField
              label="Credentials (optional)"
              value={invite.credentials}
              onChange={(e) => setInvite({ ...invite, credentials: e.target.value })}
              placeholder="e.g. MRICS, BSc"
            />
            <div className="md:col-span-2">
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

      <ConfirmModal
        isOpen={removeTarget != null}
        title={`Remove ${removeTarget?.fullName ?? "team member"}?`}
        description="This permanently removes them from the CRM team. If they have linked records, deactivate them instead."
        confirmLabel="Remove member"
        cancelLabel="Cancel"
        loading={removing}
        danger
        error={removeError || undefined}
        onCancel={() => {
          if (!removing) {
            setRemoveTarget(null);
            setRemoveError("");
          }
        }}
        onConfirm={() => void confirmRemoveUser()}
      />
    </CrmPageContent>
  );
}
