"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/crm/lib/api";
import type { Job } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import StatusPill from "@/crm/components/ui/StatusPill";

export default function TradeSchedule() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    api.getTradeSchedule().then((r) => setJobs(r.items)).catch(console.error);
  }, []);

  const byCrew = useMemo(() => {
    const map = new Map<string, Job[]>();
    for (const j of jobs) {
      const key = j.assignedTo?.fullName ?? "Unassigned";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(j);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [jobs]);

  return (
    <CrmPageContent>
      <CrmPageHeader title="Schedule" subtitle="Trade work calendar — crew view, next 30 days" />

      {byCrew.length === 0 ? (
        <CrmPanel>
          <p className="text-sm text-(--color-tc-30)">No trade jobs scheduled</p>
        </CrmPanel>
      ) : (
        byCrew.map(([crew, crewJobs]) => (
          <CrmPanel key={crew} title={`${crew} · ${crewJobs.length} job(s)`}>
            <div className="space-y-3">
              {crewJobs.map((j) => (
                <div
                  key={j.id}
                  className="flex flex-col gap-2 rounded-xl bg-(--color-nc-10) p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link
                      href={`/crm/jobs/${j.id}`}
                      className="font-medium text-(--color-primary) hover:underline"
                    >
                      {j.jobNumber}
                    </Link>
                    <p className="text-(--color-tc-30)">
                      {j.propertyAddress}, {j.propertyPostcode}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill variant="in-review" label={j.stage.replace(/_/g, " ")} />
                    <span className="text-xs text-(--color-tc-30)">
                      {j.workStartDate ? new Date(j.workStartDate).toLocaleDateString() : "TBC"}
                      {j.workEndDate ? ` → ${new Date(j.workEndDate).toLocaleDateString()}` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CrmPanel>
        ))
      )}
    </CrmPageContent>
  );
}
