"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/crm/lib/api";
import type { ApiUser, AuditLogEntry, UserRole } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import CrmModal from "@/crm/components/ui/CrmModal";
import SelectField from "@/crm/components/ui/SelectField";
import Table, { type Column } from "@/crm/components/ui/Table";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

const PAGE_SIZE = 25;

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All actions" },
  { value: "ARCHIVE_USER", label: "Team member removed" },
  { value: "INVITE", label: "Team member invited" },
  { value: "UPDATE", label: "Updated" },
  { value: "DELETE", label: "Deleted" },
];

type AuditRow = AuditLogEntry & Record<string, unknown>;

function canViewAuditLog(role: UserRole) {
  return role === "SUPER_ADMIN";
}

function actionLabel(action: string) {
  return ACTION_OPTIONS.find((opt) => opt.value === action)?.label ?? action.replace(/_/g, " ");
}

function formatWhen(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Plain-English one-liner so the table is readable without opening the raw payload. */
function summarize(entry: AuditLogEntry): string {
  const changes = entry.changes as Record<string, unknown> | null | undefined;

  if (entry.action === "ARCHIVE_USER" && changes) {
    const removed = changes.removedUser as { fullName?: string; email?: string } | undefined;
    const unassigned = changes.unassigned as Record<string, number> | undefined;
    const who = removed?.fullName ?? removed?.email ?? "Team member";
    if (!unassigned) return `${who} removed from the team`;
    return `${who} (${removed?.email ?? "no email"}) removed — ${unassigned.leads} leads and ${unassigned.jobs} jobs unassigned, ${unassigned.openTasks} open tasks reassigned`;
  }

  if (!changes) return `${entry.entityType} ${entry.entityId}`;

  const keys = Object.keys(changes);
  if (keys.length === 0) return `${entry.entityType} ${entry.entityId}`;
  return `${entry.entityType} — ${keys.join(", ")}`;
}

export default function AuditLogAdmin() {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const me = currentUser ?? (await api.getMe());
      if (!currentUser) setCurrentUser(me);

      if (!canViewAuditLog(me.role)) {
        setRows([]);
        setError("You need Super Admin access to view the audit log.");
        return;
      }

      const r = await api.listAuditLogs({
        page,
        limit: PAGE_SIZE,
        ...(action ? { action } : {}),
      });
      setRows(r.items as AuditRow[]);
      setTotal(r.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load audit log";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [action, currentUser, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: Column<AuditRow>[] = [
    {
      key: "createdAt",
      header: "When",
      render: (value) => <span className="whitespace-nowrap">{formatWhen(String(value))}</span>,
    },
    {
      key: "actor",
      header: "Performed by",
      render: (_value, row) => <span>{row.actor?.fullName ?? "System"}</span>,
    },
    {
      key: "action",
      header: "Action",
      render: (value) => <span>{actionLabel(String(value))}</span>,
    },
    {
      key: "changes",
      header: "Details",
      render: (_value, row) => (
        <span className="text-ink-muted">{summarize(row)}</span>
      ),
    },
  ];

  if (loading && rows.length === 0) {
    return (
      <CrmPageContent>
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  if (error && rows.length === 0) {
    return (
      <CrmPageContent>
        <CrmPageHeader title="Audit log" subtitle="Every mutating action recorded by the CRM." />
        <CrmPanel title="Access restricted">
          <p className="text-sm text-ink-muted">{error}</p>
        </CrmPanel>
      </CrmPageContent>
    );
  }

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Audit log"
        subtitle="Who changed what, and when. Removals keep a snapshot of the member and the work that was handed back."
      />

      <Table
        title="Recent activity"
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        emptyMessage="No audit entries yet"
        totalCount={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        loading={loading}
        onRowClick={(row) => setSelected(row)}
        toolbarExtra={
          <SelectField
            variant="filter"
            aria-label="Filter by action"
            value={action}
            onChange={(e) => {
              setPage(1);
              setAction(e.target.value);
            }}
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectField>
        }
      />

      <CrmModal
        isOpen={selected != null}
        title={selected ? actionLabel(selected.action) : "Audit entry"}
        description={
          selected
            ? `${selected.entityType} · ${formatWhen(selected.createdAt)}${selected.ipAddress ? ` · ${selected.ipAddress}` : ""}`
            : undefined
        }
        size="lg"
        onClose={() => setSelected(null)}
      >
        <pre className="overflow-x-auto rounded-xl border border-line bg-sidebar p-4 text-xs text-ink">
          {JSON.stringify(selected?.changes ?? {}, null, 2)}
        </pre>
      </CrmModal>
    </CrmPageContent>
  );
}
