"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, UserPlus, Users } from "lucide-react";
import { api } from "@/crm/lib/api";
import { CRM_BASE_PATH } from "@/crm/lib/constants";
import type { Customer, Job, Lead } from "@/crm/types";
import { cn } from "@/lib/utils";

type SearchResultType = "lead" | "job" | "customer";

interface SearchResult {
  type: SearchResultType;
  id: string;
  label: string;
  sublabel?: string;
  href: string;
}

const TYPE_ICONS = {
  lead: UserPlus,
  job: FileText,
  customer: Users,
} as const;

const TYPE_LABELS = {
  lead: "Leads",
  job: "Jobs",
  customer: "Customers",
} as const;

function formatLeadLabel(lead: Lead) {
  const name =
    lead.customerName ??
    (lead.customer ? `${lead.customer.firstName} ${lead.customer.lastName}` : "Lead");
  return name;
}

function formatLeadSublabel(lead: Lead) {
  return [lead.propertyPostcode, lead.propertyAddress].filter(Boolean).join(" · ") || undefined;
}

function formatJobSublabel(job: Job) {
  const parts = [job.propertyPostcode, job.propertyAddress].filter(Boolean);
  if (job.customer) {
    parts.unshift(`${job.customer.firstName} ${job.customer.lastName}`);
  }
  return parts.join(" · ") || undefined;
}

function filterJobs(jobs: Job[], q: string) {
  const lower = q.toLowerCase();
  return jobs.filter((job) => {
    const customerName = job.customer
      ? `${job.customer.firstName} ${job.customer.lastName}`.toLowerCase()
      : "";
    return (
      job.jobNumber?.toLowerCase().includes(lower) ||
      job.propertyPostcode?.toLowerCase().includes(lower) ||
      job.propertyAddress?.toLowerCase().includes(lower) ||
      job.stage?.toLowerCase().includes(lower) ||
      customerName.includes(lower) ||
      job.customer?.email?.toLowerCase().includes(lower)
    );
  });
}

function buildResults(leads: Lead[], jobs: Job[], customers: Customer[], query: string): SearchResult[] {
  const filteredJobs = filterJobs(jobs, query);

  const leadResults: SearchResult[] = leads.map((lead) => ({
    type: "lead",
    id: lead.id,
    label: formatLeadLabel(lead),
    sublabel: formatLeadSublabel(lead),
    href: `${CRM_BASE_PATH}/leads/${lead.id}`,
  }));

  const jobResults: SearchResult[] = filteredJobs.map((job) => ({
    type: "job",
    id: job.id,
    label: job.jobNumber || "Job",
    sublabel: formatJobSublabel(job),
    href: `${CRM_BASE_PATH}/jobs/${job.id}`,
  }));

  const customerResults: SearchResult[] = customers.map((customer) => ({
    type: "customer",
    id: customer.id,
    label: `${customer.firstName} ${customer.lastName}`,
    sublabel: customer.email || customer.phone || undefined,
    href: `${CRM_BASE_PATH}/customers/${customer.id}`,
  }));

  return [...leadResults, ...jobResults, ...customerResults];
}

export default function CrmGlobalSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const trimmed = query.trim();
  const showDropdown = open && trimmed.length > 0;

  const runSearch = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const params = { search, limit: "5" };
      const [leadsRes, customersRes, jobsRes] = await Promise.all([
        api.listLeads(params),
        api.listCustomers(params),
        api.listJobs(params),
      ]);
      setResults(buildResults(leadsRes.items, jobsRes.items, customersRes.items, search));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      void runSearch(trimmed);
    }, 300);
    return () => clearTimeout(timer);
  }, [trimmed, runSearch]);

  useEffect(() => {
    setHighlight(0);
  }, [results.length, trimmed]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function navigate(result: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) {
      if (e.key === "ArrowDown" && trimmed) {
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const result = results[highlight];
      if (result) navigate(result);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const grouped = {
    lead: results.filter((r) => r.type === "lead"),
    job: results.filter((r) => r.type === "job"),
    customer: results.filter((r) => r.type === "customer"),
  };

  let flatIndex = 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onInputKeyDown}
        placeholder="Search leads, jobs, customers..."
        aria-label="Search leads, jobs, and customers"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        role="combobox"
        className="w-full rounded-lg border border-line bg-sidebar py-2 pr-9 pl-9 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand-light focus:bg-surface focus:ring-2 focus:ring-brand-muted sm:pr-10"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-line bg-surface px-1.5 py-0.5 text-[11px] font-medium text-ink-subtle sm:inline">
        /
      </kbd>

      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_8px_32px_rgb(63_63_80/0.12)]"
          role="listbox"
        >
          {loading && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-muted">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-muted">No results for &ldquo;{trimmed}&rdquo;</p>
          ) : (
            <div className="max-h-80 overflow-y-auto py-1">
              {(["lead", "job", "customer"] as SearchResultType[]).map((type) => {
                const items = grouped[type];
                if (items.length === 0) return null;
                const Icon = TYPE_ICONS[type];

                return (
                  <div key={type}>
                    <p className="px-3 py-1.5 text-xs font-medium text-ink-subtle">
                      {TYPE_LABELS[type]}
                    </p>
                    {items.map((result) => {
                      const index = flatIndex;
                      flatIndex += 1;
                      const isHighlighted = index === highlight;

                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          type="button"
                          role="option"
                          aria-selected={isHighlighted}
                          className={cn(
                            "flex w-full items-start gap-3 px-3 py-2 text-left transition-colors",
                            isHighlighted ? "bg-sidebar" : "hover:bg-sidebar"
                          )}
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseEnter={() => setHighlight(index)}
                          onClick={() => navigate(result)}
                        >
                          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
                            <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-ink">
                              {result.label}
                            </span>
                            {result.sublabel ? (
                              <span className="block truncate text-xs text-ink-subtle">
                                {result.sublabel}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
