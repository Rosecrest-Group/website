"use client";

import { useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";

export function useDataDumpStatus() {
  const [status, setStatus] = useState<{
    configured: boolean;
    tokenConfigured: boolean;
    locationConfigured: boolean;
    requiredScopes?: Array<{ scope: string; usedFor: string; endpoints: readonly string[] }>;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getDataDumpStatus()
      .then((s) => {
        if (!cancelled) setStatus(s);
      })
      .catch(() => {
        if (!cancelled) {
          setStatus({ configured: false, tokenConfigured: false, locationConfigured: false });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}

export function DataDumpStatusBanner() {
  const status = useDataDumpStatus();
  const configured = status?.configured ?? false;

  if (configured || status === null) return null;

  return (
    <CurvedContainer>
      <p className="p-6 text-sm text-(--color-tc-30)">
        Set <code className="font-mono text-xs">SALES_IGNITER_DUMP</code> and{" "}
        <code className="font-mono text-xs">SALES_IGNITER_LOCATION_ID</code> on the API server, then
        restart the API.
      </p>
    </CurvedContainer>
  );
}

export function scopeHint(error: string | null) {
  if (!error?.toLowerCase().includes("scope")) return null;
  return (
    <p className="mt-2 text-xs text-amber-900">
      Add the missing scope to your GoHighLevel Private Integration, then regenerate the token and
      update <code className="font-mono">SALES_IGNITER_DUMP</code>. See{" "}
      <a
        href="https://marketplace.gohighlevel.com/docs/Authorization/Scopes/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        HighLevel API scopes
      </a>
      .
    </p>
  );
}

export function contactDisplayName(
  contact: { name?: string; firstName?: string; lastName?: string; fullName?: string; contactName?: string }
) {
  if (contact.name?.trim()) return contact.name.trim();
  if (contact.fullName?.trim()) return contact.fullName.trim();
  if (contact.contactName?.trim()) return contact.contactName.trim();
  const full = [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim();
  return full || "—";
}

export function formatMessageType(message: { messageType?: string; type?: string | number }): string {
  const raw = String(message.messageType ?? message.type ?? "");
  return raw.replace(/^TYPE_/, "") || "Message";
}

export function DetailField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-(--color-tc-30)">{label}</dt>
      <dd className="mt-0.5 text-sm text-(--color-tc-40)">{value}</dd>
    </div>
  );
}

export function useDataDumpConfigured() {
  const status = useDataDumpStatus();
  return status?.configured ?? false;
}
