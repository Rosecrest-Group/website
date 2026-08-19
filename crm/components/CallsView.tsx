"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Search,
  Voicemail,
} from "lucide-react";
import { toast } from "sonner";
import LeadDetailPanel from "@/crm/components/LeadDetailPanel";
import CallDialer from "@/crm/components/CallDialer";
import PhoneButton from "@/crm/components/PhoneButton";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import StatusPill from "@/crm/components/ui/StatusPill";
import { CRM_BASE_PATH } from "@/crm/lib/constants";
import { api } from "@/crm/lib/api";
import {
  callDisplayName,
  callStatusLabel,
  callStatusTone,
  formatCallDuration,
} from "@/crm/lib/callDisplay";
import { formatChatDateSeparator, formatInboxListTime, initialsFromName } from "@/crm/lib/formatChatTime";
import { usePhone } from "@/crm/lib/phoneContext";
import { useInfiniteScroll } from "@/crm/lib/useInfiniteScroll";
import type { DialpadCall } from "@/crm/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 40;
const SEARCH_DEBOUNCE_MS = 200;
const REFRESH_MS = 20_000;

type CallTab = "all" | "missed" | "inbound" | "outbound";

const TABS: { id: CallTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "missed", label: "Missed" },
  { id: "inbound", label: "Inbound" },
  { id: "outbound", label: "Outbound" },
];

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

function CallIcon({
  call,
  className,
}: {
  call: Pick<DialpadCall, "status" | "direction">;
  className?: string;
}) {
  if (call.status === "missed" && call.direction === "inbound") {
    return <PhoneMissed className={className} strokeWidth={1.75} />;
  }
  if (call.status === "voicemail") return <Voicemail className={className} strokeWidth={1.75} />;
  if (call.direction === "outbound") return <PhoneOutgoing className={className} strokeWidth={1.75} />;
  return <PhoneIncoming className={className} strokeWidth={1.75} />;
}

function statusPill(call: DialpadCall) {
  if (call.status === "live") return { variant: "in-review" as const, label: "Live" };
  if (call.status === "missed") {
    return {
      variant: "failed" as const,
      label: call.direction === "outbound" ? "No answer" : "Missed",
    };
  }
  if (call.status === "voicemail") return { variant: "awaiting" as const, label: "Voicemail" };
  return { variant: "completed" as const, label: "Answered" };
}

function groupCalls(calls: DialpadCall[]) {
  const groups: { label: string; calls: DialpadCall[] }[] = [];
  for (const call of calls) {
    const label = formatChatDateSeparator(call.createdAt);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.calls.push(call);
    else groups.push({ label, calls: [call] });
  }
  return groups;
}

function callMatchesQuery(call: DialpadCall, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const digits = q.replace(/\D/g, "");
  const fields = [
    call.customerName,
    call.contactNumber,
    call.from,
    call.to,
    call.customerPhone,
    call.propertyPostcode,
    call.author?.fullName,
    call.description,
  ];
  if (fields.some((value) => value?.toLowerCase().includes(q))) return true;
  if (digits.length >= 4) {
    const haystack = [call.contactNumber, call.from, call.to, call.customerPhone]
      .map((value) => value?.replace(/\D/g, "") ?? "")
      .join(" ");
    if (haystack.includes(digits)) return true;
  }
  return false;
}

export default function CallsView() {
  const searchParams = useSearchParams();
  const deepLinkCallId = searchParams.get("callId");
  const { dialpadEnabled, dialpadConfigured, setDialpadSidebarOpen, placeCall } = usePhone();
  const [calls, setCalls] = useState<DialpadCall[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [tab, setTab] = useState<CallTab>("all");
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [leadPanel, setLeadPanel] = useState<{ leadId: string; title: string } | null>(null);
  const [showDialer, setShowDialer] = useState(true);
  const [dialNumber, setDialNumber] = useState("");
  const [dialing, setDialing] = useState(false);
  const dialNumberRef = useRef("");
  dialNumberRef.current = dialNumber;
  const pageRef = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const searchAbortRef = useRef<AbortController | null>(null);
  const handledDeepLinkRef = useRef<string | null>(null);

  const listParams = useMemo(() => {
    const params: Parameters<typeof api.listDialpadCalls>[0] = {
      query: activeQuery || undefined,
    };
    if (tab === "inbound" || tab === "outbound") params.direction = tab;
    else if (tab !== "all") params.status = tab;
    return params;
  }, [activeQuery, tab]);

  const loadCalls = useCallback(
    async (opts: { append: boolean }) => {
      if (!opts.append) {
        searchAbortRef.current?.abort();
        searchAbortRef.current = new AbortController();
      }
      const signal = opts.append ? undefined : searchAbortRef.current?.signal;
      const page = opts.append ? pageRef.current + 1 : 1;
      const result = await api.listDialpadCalls(
        { ...listParams, page, limit: PAGE_SIZE },
        signal ? { signal } : undefined
      );
      pageRef.current = page;
      setHasMore(Boolean(result.hasMore));
      setCalls((prev) => {
        if (!opts.append) return result.items;
        const seen = new Set(prev.map((call) => call.id));
        return [...prev, ...result.items.filter((call) => !seen.has(call.id))];
      });
      return result.items;
    },
    [listParams]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMobileShowDetail(false);
    void loadCalls({ append: false })
      .then((items) => {
        if (cancelled) return;
        setSelectedId((current) => {
          if (current && items.some((call) => call.id === current)) return current;
          return null;
        });
      })
      .catch((err) => {
        if (cancelled || isAbortError(err)) return;
        setCalls([]);
        setHasMore(false);
        setTotal(0);
        toast.error(err instanceof Error ? err.message : "Failed to load calls");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      searchAbortRef.current?.abort();
    };
  }, [loadCalls]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setActiveQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    void loadCalls({ append: true })
      .catch(() => {
        // keep current list
      })
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, [hasMore, loadCalls, loading]);

  useInfiniteScroll({
    rootRef: listRef,
    sentinelRef,
    enabled: hasMore && !loading,
    onLoadMore: loadMore,
  });

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      if (loadingMoreRef.current) return;
      void api
        .listDialpadCalls({ ...listParams, page: 1, limit: PAGE_SIZE })
        .then((result) => {
          setHasMore(Boolean(result.hasMore) || pageRef.current > 1);
          setCalls((prev) => {
            const refreshedIds = new Set(result.items.map((call) => call.id));
            return [...result.items, ...prev.filter((call) => !refreshedIds.has(call.id))];
          });
        })
        .catch(() => {
          // keep current list
        });
    };
    const timer = window.setInterval(tick, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [listParams]);

  const typedQuery = searchQuery.trim();
  const searchPending = typedQuery !== activeQuery;
  const displayedCalls = useMemo(() => {
    if (typedQuery && searchPending) return calls.filter((call) => callMatchesQuery(call, typedQuery));
    return calls;
  }, [calls, searchPending, typedQuery]);

  const selected = showDialer
    ? null
    : displayedCalls.find((call) => call.id === selectedId) ?? null;

  useEffect(() => {
    if (!deepLinkCallId || handledDeepLinkRef.current === deepLinkCallId) return;
    const match = calls.find((call) => call.id === deepLinkCallId);
    if (match) {
      handledDeepLinkRef.current = deepLinkCallId;
      setShowDialer(false);
      setSelectedId(match.id);
      setMobileShowDetail(true);
    }
  }, [calls, deepLinkCallId]);

  const groups = useMemo(() => groupCalls(displayedCalls), [displayedCalls]);
  const showListLoading = displayedCalls.length === 0 && (loading || searchPending);

  function openCall(call: DialpadCall) {
    setShowDialer(false);
    setSelectedId(call.id);
    setMobileShowDetail(true);
  }

  function openDialer() {
    setShowDialer(true);
    setSelectedId(null);
    setMobileShowDetail(true);
  }

  const handlePlaceCall = useCallback(
    async (number: string, call?: DialpadCall) => {
      if (!dialpadEnabled) {
        toast.error(
          dialpadConfigured
            ? "Dialpad calling is not enabled for your account — ask an admin"
            : "Dialpad is not configured"
        );
        return;
      }
      setDialing(true);
      setDialpadSidebarOpen(true);
      try {
        await placeCall(number, {
          leadId: call?.leadId ?? undefined,
          customerName: call?.customerName ?? undefined,
        });
        toast.success("Connecting call in Dialpad…");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to place call");
      } finally {
        setDialing(false);
      }
    },
    [dialpadConfigured, dialpadEnabled, placeCall, setDialpadSidebarOpen]
  );

  useEffect(() => {
    function typingInField(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      if (target.isContentEditable) return true;
      const tag = target.tagName;
      if (tag === "TEXTAREA" || tag === "SELECT") return true;
      if (tag !== "INPUT") return false;
      const type = (target as HTMLInputElement).type.toLowerCase();
      return (
        type !== "button" &&
        type !== "submit" &&
        type !== "checkbox" &&
        type !== "radio" &&
        type !== "file"
      );
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (typingInField(event.target)) return;

      if (/^[0-9+*#]$/.test(event.key)) {
        event.preventDefault();
        setShowDialer(true);
        setSelectedId(null);
        setMobileShowDetail(true);
        setDialNumber((prev) => `${prev}${event.key}`);
        return;
      }

      if (event.key === "Backspace") {
        if (!dialNumberRef.current) return;
        event.preventDefault();
        setShowDialer(true);
        setSelectedId(null);
        setMobileShowDetail(true);
        setDialNumber((prev) => prev.slice(0, -1));
        return;
      }

      if (event.key === "Enter") {
        const number = dialNumberRef.current.trim();
        if (!number) return;
        event.preventDefault();
        setShowDialer(true);
        setSelectedId(null);
        setMobileShowDetail(true);
        void handlePlaceCall(number);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlePlaceCall]);

  const emptyMessage = showListLoading
    ? null
    : displayedCalls.length === 0 && typedQuery
      ? "No calls match your search."
      : displayedCalls.length === 0
        ? "No Dialpad calls logged yet."
        : null;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas">
        <div className="flex shrink-0 border-b border-line bg-surface">
          <div className="w-88 max-w-full shrink-0 px-4 py-4 max-md:w-full">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-base font-medium text-ink">Calls</h1>
              <PrimaryButton
                type="button"
                className="w-auto gap-1.5 md:hidden"
                onClick={openDialer}
                title={dialpadEnabled ? "Place a new call" : "Open the dialer"}
              >
                <Phone className="size-3.5" strokeWidth={1.75} />
                New call
              </PrimaryButton>
            </div>
            <div className="relative mt-3">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, number, postcode…"
                aria-busy={searchPending || loading}
                className="h-9 w-full min-w-0 rounded-lg border border-line bg-sidebar py-2 pr-3 pl-9 text-sm text-ink outline-none placeholder:text-ink-subtle focus:border-brand-light focus:bg-surface focus:ring-2 focus:ring-brand-muted"
              />
            </div>
          </div>
          <div className="hidden flex-1 items-center justify-end px-6 md:flex">
            <PrimaryButton
              type="button"
              className="w-auto gap-1.5"
              onClick={openDialer}
              title={dialpadEnabled ? "Place a new call" : "Open the dialer"}
            >
              <Phone className="size-3.5" strokeWidth={1.75} />
              New call
            </PrimaryButton>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div
            ref={listRef}
            className={cn(
              "flex min-h-0 w-88 max-w-full shrink-0 flex-col border-r border-line bg-surface max-md:w-full",
              mobileShowDetail && "max-md:hidden"
            )}
          >
            <div className="shrink-0 space-y-3 border-b border-line p-4">
              <div className="flex gap-1 overflow-x-auto pb-0.5">
                {TABS.map((item) => {
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                        active
                          ? "bg-white text-ink shadow-[0_0_0_1px_var(--color-line)]"
                          : "text-ink-muted hover:bg-black/4 hover:text-ink"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {showListLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : null}
              {emptyMessage ? (
                <div className="px-4 py-10 text-center">
                  <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-brand-muted text-brand">
                    <Phone className="size-4" strokeWidth={1.75} />
                  </span>
                  <p className="text-sm text-ink-muted">{emptyMessage}</p>
                </div>
              ) : null}
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="sticky top-0 z-10 bg-sidebar/90 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint backdrop-blur-sm">
                    {group.label}
                  </p>
                  {group.calls.map((call) => (
                    <CallRow
                      key={call.id}
                      call={call}
                      selected={selected?.id === call.id}
                      onOpen={() => openCall(call)}
                    />
                  ))}
                </div>
              ))}
              {hasMore ? <div ref={sentinelRef} className="h-8" aria-hidden /> : null}
              {loadingMore ? (
                <div className="flex h-12 items-center justify-center">
                  <LoadingSpinner className="py-0" />
                </div>
              ) : null}
            </div>
          </div>

          <div
            className={cn(
              "min-h-0 min-w-0 flex-1 flex-col bg-canvas",
              mobileShowDetail ? "flex" : "max-md:hidden md:flex"
            )}
          >
            {selected ? (
              <CallDetail
                call={selected}
                onBack={() => {
                  setMobileShowDetail(false);
                  setShowDialer(true);
                }}
                onOpenLead={() => {
                  if (!selected.leadId) return;
                  setLeadPanel({
                    leadId: selected.leadId,
                    title: callDisplayName(selected),
                  });
                }}
                onCallback={() => {
                  const number = selected.contactNumber ?? selected.customerPhone;
                  if (!number) {
                    toast.error("No number on this call");
                    return;
                  }
                  void handlePlaceCall(number, selected);
                }}
                callbackDisabled={!dialpadEnabled || dialing}
              />
            ) : showListLoading ? (
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col bg-surface">
                <div className="shrink-0 border-b border-line px-4 py-3 md:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileShowDetail(false)}
                    className="text-sm font-medium text-brand"
                  >
                    ← Back
                  </button>
                </div>
                <CallDialer
                  value={dialNumber}
                  onChange={setDialNumber}
                  onCall={(number) => void handlePlaceCall(number)}
                  calling={dialing}
                  disabled={!dialpadEnabled}
                  disabledReason={
                    dialpadConfigured
                      ? "Dialpad calling is not enabled for your account — ask an admin"
                      : "Dialpad is not configured"
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <LeadDetailPanel
        leadId={leadPanel?.leadId ?? null}
        isOpen={Boolean(leadPanel)}
        onClose={() => setLeadPanel(null)}
        title={leadPanel?.title}
      />
    </>
  );
}

function CallRow({
  call,
  selected,
  onOpen,
}: {
  call: DialpadCall;
  selected: boolean;
  onOpen: () => void;
}) {
  const tone = callStatusTone(call.status, call.direction);
  const name = callDisplayName(call);
  const duration =
    call.durationSeconds != null && call.status !== "live"
      ? formatCallDuration(call.durationSeconds)
      : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors",
        selected ? "bg-brand-muted/70" : "hover:bg-sidebar"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
          tone.tile,
          tone.icon,
          call.status === "live" && "animate-pulse"
        )}
      >
        <CallIcon call={call} className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-medium text-ink">{name}</span>
          <span className="shrink-0 text-[10px] text-ink-subtle">
            {formatInboxListTime(call.createdAt)}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
          <span className="truncate">{callStatusLabel(call)}</span>
          {duration ? <span className="shrink-0 tabular-nums">{duration}</span> : null}
        </span>
        {call.contactNumber && call.customerName ? (
          <span className="mt-0.5 block truncate text-[11px] tabular-nums text-ink-subtle">
            {call.contactNumber}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function CallDetail({
  call,
  onBack,
  onOpenLead,
  onCallback,
  callbackDisabled,
}: {
  call: DialpadCall;
  onBack: () => void;
  onOpenLead: () => void;
  onCallback: () => void;
  callbackDisabled: boolean;
}) {
  const tone = callStatusTone(call.status, call.direction);
  const name = callDisplayName(call);
  const pill = statusPill(call);
  const duration =
    call.durationSeconds != null ? formatCallDuration(call.durationSeconds) : null;
  const transcript = call.transcript ?? call.recapSummary;
  const transcriptLabel = call.transcript ? "Call transcript" : "Call recap";
  const number = call.contactNumber ?? call.customerPhone;
  const initials = initialsFromName(name);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-line bg-surface px-4 py-4 sm:px-6">
        <div className="mb-3 md:hidden">
          <button type="button" onClick={onBack} className="text-sm font-medium text-brand">
            ← Back
          </button>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-medium",
                tone.tile,
                tone.icon
              )}
            >
              {call.customerName ? initials : <CallIcon call={call} className="size-5" />}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-medium text-ink">{name}</h2>
                <StatusPill variant={pill.variant} label={pill.label} />
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {callStatusLabel(call)}
                {duration ? ` · ${duration}` : ""}
                {call.propertyPostcode ? ` · ${call.propertyPostcode}` : ""}
              </p>
              {number ? (
                <p className="mt-0.5 text-sm tabular-nums text-ink">{number}</p>
              ) : null}
              {call.author?.fullName ? (
                <p className="mt-0.5 text-xs text-ink-subtle">Agent · {call.author.fullName}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {number ? (
              <PhoneButton
                number={number}
                variant="primary"
                context={{
                  leadId: call.leadId ?? undefined,
                  customerName: call.customerName ?? undefined,
                }}
              />
            ) : (
              <PrimaryButton type="button" className="w-auto" disabled={callbackDisabled} onClick={onCallback}>
                Call back
              </PrimaryButton>
            )}
            {call.leadId ? (
              <>
                <SecondaryButton type="button" size="small" className="w-auto" onClick={onOpenLead}>
                  View lead
                </SecondaryButton>
                <Link
                  href={`${CRM_BASE_PATH}/inbox?leadId=${call.leadId}`}
                  className="flex h-auto items-center justify-center rounded-lg border border-line bg-sidebar px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-line"
                >
                  Open thread
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {call.recordingUrl ? (
            <section className="rounded-xl border border-line bg-surface p-5">
              <h3 className="text-base font-medium text-ink">Recording</h3>
              <audio controls preload="none" className="mt-3 w-full">
                <source src={call.recordingUrl} />
              </audio>
              <a
                href={call.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-medium text-brand hover:underline"
              >
                Open recording
              </a>
            </section>
          ) : null}

          {transcript ? (
            <section className="rounded-xl border border-line bg-surface p-5">
              <h3 className="text-base font-medium text-ink">{transcriptLabel}</h3>
              <p className="mt-3 max-h-80 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {transcript}
              </p>
            </section>
          ) : null}

          <section className="rounded-xl border border-line bg-surface p-5">
            <h3 className="text-base font-medium text-ink">Call details</h3>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <DetailItem label="Direction" value={call.direction === "inbound" ? "Inbound" : "Outbound"} />
              <DetailItem label="When" value={formatInboxListTime(call.createdAt)} />
              <DetailItem label="From" value={call.from ?? "—"} />
              <DetailItem label="To" value={call.to ?? "—"} />
              <DetailItem label="Duration" value={duration ?? "—"} />
              <DetailItem label="Outcome" value={call.outcome ?? pill.label} />
            </dl>
            {call.description ? (
              <p className="mt-3 text-sm text-ink-muted">{call.description}</p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="mt-0.5 tabular-nums text-ink">{value}</dd>
    </div>
  );
}
