"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Copy, Pencil, Send, Trash2 } from "lucide-react";
import { api } from "@/crm/lib/api";
import { CRM_BASE_PATH, DASHBOARD_PERIODS } from "@/crm/lib/constants";
import type { DashboardPeriod } from "@/crm/types";
import type { CampaignIndexTab, CampaignListRow, CampaignStatus } from "@/crm/types/campaigns";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextField from "@/crm/components/ui/TextField";
import SelectField from "@/crm/components/ui/SelectField";
import CrmModal from "@/crm/components/ui/CrmModal";
import Table, { type Column } from "@/crm/components/ui/Table";
import StatusPill from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import ActionDropdown from "@/crm/components/ui/ActionDropdown";
import StatsCard from "@/crm/components/admin/StatsCard";
import FilterDropdown from "@/crm/components/ui/FilterDropdown";
const PAGE_SIZE = 20;

const STATUS_LABEL: Record<CampaignStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  SENDING: "Sending",
  SENT: "Sent",
};

function statusVariant(status: CampaignStatus) {
  if (status === "SENT") return "completed" as const;
  if (status === "SENDING") return "in-review" as const;
  if (status === "SCHEDULED") return "pending" as const;
  return "new" as const;
}

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CampaignIndex() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CampaignListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CampaignListRow | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | CampaignIndexTab>("");
  const [period, setPeriod] = useState<DashboardPeriod>("30d");
  const [sort, setSort] = useState("updatedAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [metrics, setMetrics] = useState<{ sent: number; delivered: number; openRate: number; clickRate: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .listCampaigns(page, { search: query, sort, direction, status: status || undefined, period })
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load campaigns");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey, query, sort, direction, status, period]);

  useEffect(() => {
    let cancelled = false;
    api
      .campaignMetrics(period)
      .then((row) => {
        if (!cancelled) setMetrics(row);
      })
      .catch(() => {
        if (!cancelled) setMetrics(null);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey, period]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setQuery(search.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const router = useRouter();

  function openCampaign(id: string) {
    router.push(`${CRM_BASE_PATH}/email-campaigns/${id}`);
  }

  async function onRowAction(row: CampaignListRow, actionId: string) {
    if (busyId) return;
    setError("");
    setNotice("");
    if (actionId === "open") {
      openCampaign(row.id);
      return;
    }
    if (actionId === "delete") {
      setPendingDelete(row);
      return;
    }
    if (actionId === "send" && !window.confirm(`Send "${row.name}" to its saved list now?`)) return;
    if (actionId === "cancel" && !window.confirm("Cancel this schedule and return the campaign to drafts?")) return;

    setBusyId(row.id);
    try {
      if (actionId === "confirm-delete") {
        await api.deleteCampaign(row.id);
        setPendingDelete(null);
        setNotice("Draft deleted.");
        setReloadKey((key) => key + 1);
      } else if (actionId === "duplicate") {
        const copy = await api.duplicateCampaign(row.id);
        openCampaign(copy.id);
      } else if (actionId === "cancel") {
        await api.cancelCampaign(row.id);
        setNotice("Schedule cancelled. The campaign is a draft again.");
        setPage(1);
        setReloadKey((key) => key + 1);
      } else if (actionId === "send") {
        await api.sendCampaign(row.id);
        setNotice("Campaign sent.");
        setPage(1);
        setReloadKey((key) => key + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this campaign");
    } finally {
      setBusyId(null);
    }
  }

  function openCreate() {
    setError("");
    setCampaignName("");
    setNameOpen(true);
  }

  async function createCampaign() {
    const trimmed = campaignName.trim();
    if (!trimmed) {
      setError("Enter a campaign name");
      return;
    }
    setError("");
    setCreating(true);
    try {
      const row = await api.createCampaign(trimmed);
      setNameOpen(false);
      openCampaign(row.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the campaign");
    } finally {
      setCreating(false);
    }
  }

  function toggleSort(key: string) {
    setPage(1);
    if (sort === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSort(key);
    setDirection(key === "name" ? "asc" : "desc");
  }

  function sortProps(key: string) {
    return {
      onSort: () => toggleSort(key),
      sortDirection: sort === key ? direction : null,
    };
  }

  function countCell(value: unknown) {
    return <span className="text-sm text-ink-muted tabular-nums">{value == null ? "—" : String(value)}</span>;
  }

  const tight = "whitespace-nowrap !px-2 sm:!px-3";

  const columns: Column<CampaignListRow & Record<string, unknown>>[] = [
    {
      key: "name",
      header: "Name",
      ...sortProps("name"),
      render: (value) => <span className="text-sm font-medium text-ink">{String(value)}</span>,
    },
    {
      key: "status",
      header: "Status",
      className: tight,
      headerClassName: tight,
      render: (value) => {
        const status = value as CampaignStatus;
        return <StatusPill variant={statusVariant(status)} label={STATUS_LABEL[status]} />;
      },
    },
    {
      key: "sentCount",
      header: "Sent",
      className: tight,
      headerClassName: tight,
      ...sortProps("sent"),
      render: (value) => countCell(value),
    },
    {
      key: "deliveredCount",
      header: "Delivered",
      className: tight,
      headerClassName: tight,
      render: (value) => countCell(value),
    },
    {
      key: "openedCount",
      header: "Opened",
      className: tight,
      headerClassName: tight,
      ...sortProps("opened"),
      render: (value) => countCell(value),
    },
    {
      key: "clickedCount",
      header: "Clicked",
      className: tight,
      headerClassName: tight,
      ...sortProps("clicked"),
      render: (value) => countCell(value),
    },
    {
      key: "bouncedCount",
      header: "Bounced",
      className: tight,
      headerClassName: tight,
      render: (value) => countCell(value),
    },
    {
      key: "unsubscribedCount",
      header: "Unsubscribed",
      className: tight,
      headerClassName: tight,
      render: (value) => countCell(value),
    },
    {
      key: "updatedAt",
      header: "Updated",
      className: "whitespace-nowrap !px-2 sm:!px-3",
      headerClassName: "whitespace-nowrap !px-2 sm:!px-3",
      ...sortProps("updatedAt"),
      render: (value) => (
        <span className="text-sm text-ink-muted tabular-nums">{formatWhen(value as string)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (_value, row) => {
        const actions = [
          { id: "open", label: "Open", icon: <Pencil className="size-4" /> },
          ...(row.status === "DRAFT"
            ? [{ id: "send", label: "Send", icon: <Send className="size-4" /> }]
            : []),
          ...(row.status === "SCHEDULED"
            ? [{ id: "cancel", label: "Cancel schedule", icon: <Ban className="size-4" /> }]
            : []),
          { id: "duplicate", label: "Duplicate", icon: <Copy className="size-4" /> },
          ...(row.status === "DRAFT"
            ? [{ id: "delete", label: "Delete", icon: <Trash2 className="size-4" />, variant: "danger" as const }]
            : []),
        ];
        return (
          <ActionDropdown
            actions={actions}
            ariaLabel={`Actions for ${row.name}`}
            onActionClick={(actionId) => onRowAction(row, actionId)}
          />
        );
      },
    },
  ];

  const periodShort = DASHBOARD_PERIODS.find((item) => item.value === period)?.short ?? "30d";
  const emptyMessage = period === "all_time" ? "No campaigns yet" : "No campaigns in this period";

  return (
    <CrmPageContent className="space-y-4 py-3 sm:py-4 lg:py-4">
      <CrmPageHeader
        compact
        title="Email campaigns"
        subtitle={`${total} ${total === 1 ? "campaign" : "campaigns"}`}
        actions={
          <>
            <FilterDropdown
              aria-label="Period"
              value={period}
              options={DASHBOARD_PERIODS.map((item) => ({ value: item.value, label: item.label }))}
              onChange={(next) => {
                setPage(1);
                setPeriod(next);
              }}
            />
            <PrimaryButton type="button" className="h-10" onClick={openCreate} disabled={creating}>
              Create email
            </PrimaryButton>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title={`Sent · ${periodShort}`} value={metrics ? metrics.sent : "—"} iconTint="primary" />
        <StatsCard title={`Delivered · ${periodShort}`} value={metrics ? metrics.delivered : "—"} iconTint="info" />
        <StatsCard title={`Open rate · ${periodShort}`} value={metrics ? `${Math.round(metrics.openRate * 100)}%` : "—"} iconTint="success" />
        <StatsCard title={`Click rate · ${periodShort}`} value={metrics ? `${Math.round(metrics.clickRate * 100)}%` : "—"} iconTint="warning" />
      </div>

      {error && !nameOpen && !pendingDelete ? <p className="text-sm text-orange-700">{error}</p> : null}
      {notice ? <p className="text-sm text-ink">{notice}</p> : null}

      <CrmModal
        isOpen={nameOpen}
        title="New email campaign"
        onClose={() => {
          if (!creating) setNameOpen(false);
        }}
        closeDisabled={creating}
        size="sm"
        footer={
          <>
            <SecondaryButton type="button" className="w-auto" disabled={creating} onClick={() => setNameOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" form="new-campaign-name" className="w-auto px-6" disabled={creating}>
              {creating ? "Creating…" : "Create"}
            </PrimaryButton>
          </>
        }
      >
        <form
          id="new-campaign-name"
          onSubmit={(event) => {
            event.preventDefault();
            void createCampaign();
          }}
        >
          <TextField
            label="Campaign name"
            value={campaignName}
            autoFocus
            disabled={creating}
            maxLength={120}
            onChange={(event) => {
              setError("");
              setCampaignName(event.target.value);
            }}
          />
          {error ? <p className="mt-3 text-sm text-orange-700">{error}</p> : null}
        </form>
      </CrmModal>

      <CrmModal
        isOpen={pendingDelete != null}
        title="Delete campaign"
        onClose={() => {
          if (!busyId) setPendingDelete(null);
        }}
        closeDisabled={busyId != null}
        size="sm"
        footer={
          <>
            <SecondaryButton
              type="button"
              className="w-auto"
              disabled={busyId != null}
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              className="w-auto px-6"
              disabled={busyId != null || pendingDelete == null}
              onClick={() => {
                if (!pendingDelete) return;
                void onRowAction(pendingDelete, "confirm-delete");
              }}
            >
              {busyId ? "Deleting…" : "Delete"}
            </PrimaryButton>
          </>
        }
      >
        <p className="text-sm text-ink">
          Delete &ldquo;{pendingDelete?.name}&rdquo;? This draft will be removed.
        </p>
        {error ? <p className="mt-3 text-sm text-orange-700">{error}</p> : null}
      </CrmModal>

      {loading && items.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <Table
          title="Campaigns"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search campaigns"
          toolbarExtra={
            <SelectField
              variant="filter"
              aria-label="Filter by status"
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value as "" | CampaignIndexTab);
              }}
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
            </SelectField>
          }
          columns={columns}
          data={items as (CampaignListRow & Record<string, unknown>)[]}
          getRowKey={(row) => row.id}
          onRowClick={(row) => openCampaign(row.id)}
          rowClassName={(row) => (busyId === row.id ? "opacity-60" : "")}
          emptyMessage={emptyMessage}
          totalCount={total}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={loading}
        />
      )}
    </CrmPageContent>
  );
}
