"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/crm/lib/api";
import { CRM_BASE_PATH } from "@/crm/lib/constants";
import type {
  CampaignRecipientCounts,
  CampaignRecipientEvent,
  CampaignRecipientRow,
} from "@/crm/types/campaigns";
import Table, { type Column } from "@/crm/components/ui/Table";
import StatusPill from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

const PAGE_SIZE = 50;

const EVENTS: { id: CampaignRecipientEvent; label: string }[] = [
  { id: "all", label: "All" },
  { id: "queued", label: "Queued" },
  { id: "sent", label: "Sent" },
  { id: "delivered", label: "Delivered" },
  { id: "opened", label: "Opened" },
  { id: "clicked", label: "Clicked" },
  { id: "replied", label: "Replied" },
  { id: "bounced", label: "Bounced" },
  { id: "unsubscribed", label: "Unsubscribed" },
  { id: "not_sent", label: "Not sent" },
];

function pillVariant(key: string) {
  if (key === "bounced" || key === "failed") return "failed" as const;
  if (key === "queued" || key === "skipped") return "pending" as const;
  if (key === "unsubscribed") return "paused" as const;
  if (key === "delivered" || key === "replied" || key === "clicked" || key === "opened") return "completed" as const;
  if (key === "sent") return "in-review" as const;
  return "new" as const;
}

function eventCount(event: CampaignRecipientEvent, audienceCount: number, counts: CampaignRecipientCounts) {
  if (event === "all") return audienceCount;
  return counts[event];
}

export default function CampaignRecipients({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<CampaignRecipientEvent>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<CampaignRecipientRow[]>([]);
  const [audienceCount, setAudienceCount] = useState(0);
  const [counts, setCounts] = useState<CampaignRecipientCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .listCampaignRecipients(campaignId, { event: "all" })
      .then((result) => {
        if (cancelled) return;
        setRows(result.items);
        setAudienceCount(result.audienceCount);
        setCounts(result.counts);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load recipients");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (event !== "all" && !row.events.includes(event)) return false;
      if (!needle) return true;
      return row.name.toLowerCase().includes(needle) || row.email.toLowerCase().includes(needle);
    });
  }, [rows, event, search]);

  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openRecipient(row: CampaignRecipientRow) {
    if (row.leadId) {
      router.push(`${CRM_BASE_PATH}/leads/${row.leadId}?fromCampaign=${campaignId}`);
      return;
    }
    router.push(`${CRM_BASE_PATH}/email-campaigns/recipients/${row.id}`);
  }

  const columns: Column<CampaignRecipientRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (_value, row) => <span className="font-medium text-ink">{row.name}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (_value, row) => <span className="text-ink-muted">{row.email || "—"}</span>,
    },
    {
      key: "lists",
      header: "Lists",
      render: (_value, row) => (
        <span className="text-ink">{row.lists.length > 0 ? row.lists.join(", ") : "—"}</span>
      ),
    },
    {
      key: "statusLabel",
      header: "Status",
      render: (_value, row) => (
        <span className="inline-flex flex-col items-start gap-1">
          <StatusPill variant={pillVariant(row.statusKey)} label={row.statusLabel} />
          {row.failureReason ? <span className="text-xs text-ink-muted">{row.failureReason}</span> : null}
        </span>
      ),
    },
  ];

  const emptyMessage = search.trim()
    ? "No one matches that search."
    : audienceCount === 0
      ? "No recipients yet."
      : "No one in this group.";

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="rounded-xl border border-line bg-surface p-2" role="tablist" aria-label="Recipient events">
        {EVENTS.map((item) => {
          const selected = event === item.id;
          const count = counts ? eventCount(item.id, audienceCount, counts) : null;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                if (item.id === event) return;
                setEvent(item.id);
                setPage(1);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm motion-reduce:transition-none transition-[color,border-color] duration-200 ease-out ${
                selected ? "border-brand bg-brand-muted text-brand" : "border-transparent text-ink hover:border-line"
              }`}
            >
              <span>{item.label}</span>
              <span className={selected ? "text-brand" : "text-ink-muted"}>{count ?? "—"}</span>
            </button>
          );
        })}
      </div>

      <div className="min-w-0">
        {error ? <p className="mb-3 text-sm text-orange-700">{error}</p> : null}
        {loading && items.length === 0 && !error ? (
          <div className="rounded-xl border border-line bg-surface py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <Table
            columns={columns}
            data={items}
            getRowKey={(row) => row.id}
            onRowClick={openRecipient}
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search name or email"
            emptyMessage={emptyMessage}
            totalCount={filtered.length}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
