"use client";

import { useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import type { ProspectingAdminConfig } from "@/crm/types/prospecting";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import StatusPill from "@/crm/components/ui/StatusPill";

export default function ProspectingAdminPage() {
  const [config, setConfig] = useState<ProspectingAdminConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setConfig(await api.getProspectingAdmin());
  }

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load administration");
    });
  }, []);

  async function toggleSource(id: string, enabled: boolean) {
    await api.patchProspectingSource(id, enabled);
    await load();
  }

  async function toggleService(id: string, active: boolean) {
    await api.patchProspectingService(id, active);
    await load();
  }

  async function toggleCoverage(id: string, active: boolean) {
    await api.patchProspectingCoverage(id, active);
    await load();
  }

  async function download(type: "accounts" | "opportunities" | "evidence" | "frameworks" | "contacts") {
    const data = await api.exportProspecting(type);
    const blob = new Blob([JSON.stringify(data.rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prospecting-${type}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!config && !error) return <LoadingSpinner />;

  return (
    <CrmPageContent>
      <CrmPageHeader title="Administration" subtitle="Services, coverage, sources, buyer roles and export." />
      {error ? <p className="text-sm text-ink-muted">{error}</p> : null}
      {config ? (
        <div className="space-y-6">
          <CrmPanel title="Sources">
            <ul className="space-y-2 text-sm text-ink">
              {config.sources.map((source) => (
                <li key={source.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {source.name}{" "}
                    <StatusPill variant={source.enabled ? "completed" : "paused"} label={source.enabled ? "On" : "Off"} />
                  </span>
                  <SecondaryButton size="small" onClick={() => void toggleSource(source.id, !source.enabled)}>
                    {source.enabled ? "Disable" : "Enable"}
                  </SecondaryButton>
                </li>
              ))}
            </ul>
          </CrmPanel>
          <CrmPanel title="Services">
            <ul className="space-y-2 text-sm text-ink">
              {config.services.map((service) => (
                <li key={service.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {service.name} · {service.family}
                  </span>
                  <SecondaryButton size="small" onClick={() => void toggleService(service.id, !service.active)}>
                    {service.active ? "Deactivate" : "Activate"}
                  </SecondaryButton>
                </li>
              ))}
            </ul>
          </CrmPanel>
          <CrmPanel title="Coverage">
            <ul className="space-y-2 text-sm text-ink">
              {config.coverage.map((area) => (
                <li key={area.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {area.name} · {area.kind}
                  </span>
                  <SecondaryButton size="small" onClick={() => void toggleCoverage(area.id, !area.active)}>
                    {area.active ? "Deactivate" : "Activate"}
                  </SecondaryButton>
                </li>
              ))}
            </ul>
          </CrmPanel>
          <CrmPanel title="Buyer roles">
            <ul className="space-y-2 text-sm text-ink">
              {config.buyerRoles.map((role) => (
                <li key={role.key}>
                  <span className="font-medium">{role.label}</span>
                  <span className="text-ink-muted"> — {role.titles.join(", ")}</span>
                </li>
              ))}
            </ul>
          </CrmPanel>
          <CrmPanel title="Export">
            <div className="flex flex-wrap gap-2">
              {(["accounts", "opportunities", "evidence", "frameworks", "contacts"] as const).map((type) => (
                <SecondaryButton key={type} size="small" onClick={() => void download(type)}>
                  {type}
                </SecondaryButton>
              ))}
            </div>
          </CrmPanel>
        </div>
      ) : null}
    </CrmPageContent>
  );
}
