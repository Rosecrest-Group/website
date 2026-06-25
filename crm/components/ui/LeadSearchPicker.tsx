"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/crm/lib/api";
import type { Lead } from "@/crm/types";
import { cn } from "@/lib/utils";

export interface LeadSearchPickerProps {
  label?: string;
  value: string | null;
  displayLabel?: string | null;
  onChange: (leadId: string | null, label: string | null) => void;
  placeholder?: string;
  placement?: "up" | "down";
  disabled?: boolean;
}

function formatLeadLabel(lead: Lead) {
  const name =
    lead.customerName ??
    (lead.customer ? `${lead.customer.firstName} ${lead.customer.lastName}` : "Lead");
  const parts = [name];
  if (lead.propertyPostcode) parts.push(lead.propertyPostcode);
  if (lead.propertyAddress) parts.push(lead.propertyAddress);
  return parts.join(" · ");
}

export default function LeadSearchPicker({
  label = "Link to lead",
  value,
  displayLabel,
  onChange,
  placeholder = "Search by name, email, or address…",
  placement = "up",
  disabled = false,
}: LeadSearchPickerProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [active, setActive] = useState(false);

  const selectedLabel = displayLabel ?? null;
  const showSelected = Boolean(value && selectedLabel && !active);

  const loadResults = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "10" };
      if (search.trim()) params.search = search.trim();
      const res = await api.listLeads(params);
      setResults(res.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      void loadResults(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [open, query, loadResults]);

  useEffect(() => {
    setHighlight(0);
  }, [results.length, query]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActive(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function selectLead(lead: Lead) {
    onChange(lead.id, formatLeadLabel(lead));
    setQuery("");
    setOpen(false);
    setActive(false);
  }

  function clearSelection() {
    onChange(null, null);
    setQuery("");
    setOpen(false);
    setActive(false);
    inputRef.current?.focus();
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const lead = results[highlight];
      if (lead) selectLead(lead);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(false);
      setQuery("");
    }
  }

  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-(--color-tc-40)">
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        {showSelected ? (
          <div className="flex h-12 items-center gap-2 rounded-xl border border-(--color-tc-20) bg-white px-4">
            <span className="min-w-0 flex-1 truncate text-sm text-(--color-tc-40)">{selectedLabel}</span>
            {!disabled && (
              <button
                type="button"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-(--color-tc-30) transition hover:bg-(--color-nc-10) hover:text-(--color-tc-40)"
                onClick={clearSelection}
                aria-label="Remove linked lead"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={query}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            className="h-12 w-full rounded-xl border border-(--color-tc-20) bg-white px-4 text-sm text-(--color-tc-40) outline-none placeholder:text-(--color-tc-30) focus:ring-2 focus:ring-(--color-primary)/20 disabled:opacity-50"
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(true);
            }}
            onFocus={() => {
              setOpen(true);
              setActive(true);
            }}
            onKeyDown={onInputKeyDown}
          />
        )}

        {open && active && (results.length > 0 || loading) && (
          <ul
            id={listboxId}
            role="listbox"
            className={cn(
              "absolute z-10 max-h-48 w-full overflow-auto rounded-xl border border-(--color-tc-20) bg-white py-1 shadow-lg",
              placement === "up" ? "bottom-full mb-2" : "top-full mt-2"
            )}
          >
            {loading && results.length === 0 ? (
              <li className="px-4 py-2.5 text-sm text-(--color-tc-30)">Searching…</li>
            ) : results.length === 0 ? (
              <li className="px-4 py-2.5 text-sm text-(--color-tc-30)">No leads found</li>
            ) : (
              results.map((lead, i) => (
                <li key={lead.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === highlight}
                    className={cn(
                      "flex w-full flex-col gap-0.5 px-4 py-2.5 text-left hover:bg-(--color-nc-10)",
                      i === highlight && "bg-(--color-nc-10)"
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectLead(lead)}
                  >
                    <span className="text-sm font-medium text-(--color-tc-40)">
                      {lead.customerName ??
                        (lead.customer
                          ? `${lead.customer.firstName} ${lead.customer.lastName}`
                          : "Lead")}
                    </span>
                    <span className="truncate text-xs text-(--color-tc-30)">
                      {[lead.propertyPostcode, lead.propertyAddress].filter(Boolean).join(" · ") ||
                        "No address"}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
