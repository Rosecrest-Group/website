"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy, X } from "lucide-react";
import type { LeadDetail as LeadDetailType } from "@/crm/types";
import {
  BEDROOM_BAND_LABELS,
  INTAKE_DOCUMENT_TYPE_LABELS,
  LEAD_SOURCES,
  LEAD_STAGE_LABELS,
  SURVEY_LEVEL_LABELS,
  formatPropertyValueLabel,
  intakeMessageLabel,
} from "@/crm/lib/constants";
import { cn } from "@/lib/utils";
import PhoneButton from "@/crm/components/PhoneButton";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import StatusPill, { leadStageToPillVariant } from "@/crm/components/ui/StatusPill";
import LeadTags from "@/crm/components/LeadTags";
import LeadWorkflowASend from "@/crm/components/LeadWorkflowASend";

function formatRelative(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function isLeadPaid(lead: LeadDetailType): boolean {
  return lead.job?.paymentStatus === "PAID" || Boolean(lead.paid);
}

function nextWorkflowStepText(lead: LeadDetailType): string {
  if (lead.cadenceStopped || lead.stage === "LOST" || lead.stage === "CONVERTED") {
    return "No further messages scheduled";
  }
  if (lead.nextWorkflowStep?.label) return lead.nextWorkflowStep.label;
  const currentCadenceStep = lead.journey?.find((s) => s.status === "current");
  if (currentCadenceStep?.name) return currentCadenceStep.name;
  if (lead.cadenceRun?.nextRunAt) return "Scheduled follow-up";
  return "No active workflow";
}

function formatSchedule(iso: string): string {
  const d = new Date(iso);
  const diff = d.getTime() - Date.now();
  const hours = Math.round(Math.abs(diff) / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  const rel =
    diff >= 0
      ? days >= 1
        ? `in ${days}d ${remHours}h`
        : hours >= 1
          ? `in ${hours}h`
          : "soon"
      : days >= 1
        ? `${days}d overdue`
        : "due now";
  return `${rel} · ${d.toLocaleString()}`;
}

function CopyValue({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className="mt-0.5 inline-flex min-w-0 items-center gap-1.5">
      <span className={className} title={value}>
        {value}
      </span>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md p-1 text-ink-muted hover:bg-sidebar hover:text-ink"
        aria-label={`Copy ${value}`}
        title="Copy"
      >
        {copied ? <Check className="size-3.5 text-brand" /> : <Copy className="size-3.5" />}
      </button>
    </span>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-xs text-ink-muted">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-ink">{children}</div>
    </div>
  );
}

export default function EmbeddedLeadProfile({
  lead,
  onLeadChange,
  onClose,
  onSent,
  onCreateTask,
  onStopAutomation,
  stoppingAutomation,
  canStopAutomation,
  canMarkLost,
  canMarkWon,
  canMoveToPaid,
  markingWon,
  movingToPaid,
  onOpenMarkWon,
  onOpenMoveToPaid,
  onOpenMarkLost,
  onOpenDelete,
  nextStep,
  nextRun,
  canTriggerNextStep,
  advancingWorkflow,
  onAdvanceWorkflow,
}: {
  lead: LeadDetailType;
  onLeadChange: (lead: LeadDetailType) => void;
  onClose?: () => void;
  onSent: () => void;
  onCreateTask: () => void;
  onStopAutomation: () => void;
  stoppingAutomation: boolean;
  canStopAutomation: boolean;
  canMarkLost: boolean;
  canMarkWon: boolean;
  canMoveToPaid: boolean;
  markingWon: boolean;
  movingToPaid: boolean;
  onOpenMarkWon: () => void;
  onOpenMoveToPaid: () => void;
  onOpenMarkLost: () => void;
  onOpenDelete: () => void;
  nextStep: LeadDetailType["nextWorkflowStep"];
  nextRun: string | null | undefined;
  canTriggerNextStep: boolean;
  advancingWorkflow: boolean;
  onAdvanceWorkflow: () => void;
}) {
  const customer = lead.customer;
  const initials = customer
    ? `${customer.firstName[0]}${customer.lastName[0]}`
    : "??";
  const name = customer ? `${customer.firstName} ${customer.lastName}` : "Lead";
  const sourceLabel =
    LEAD_SOURCES.find((item) => item.value === lead.source)?.label ?? lead.source;

  const stats = [
    {
      label: "Survey",
      value: lead.surveyLevel
        ? SURVEY_LEVEL_LABELS[lead.surveyLevel] ?? lead.surveyLevel
        : "—",
      sub: lead.quotedAmount ? `£${lead.quotedAmount}` : "",
    },
    {
      label: "Payment",
      value: isLeadPaid(lead) ? "Paid" : lead.stage === "CONVERTED" ? "Won" : "Unpaid",
      sub: "",
      warn: !isLeadPaid(lead),
    },
    {
      label: "Owner",
      value: lead.assignedTo?.fullName ?? "Unassigned",
      sub: "",
    },
    {
      label: "Stage",
      value: LEAD_STAGE_LABELS[lead.stage] ?? lead.stage,
      sub: "",
    },
  ];

  return (
    <div className="space-y-5">
      <CurvedContainer className="px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-light/35 bg-brand-muted text-sm font-semibold text-brand">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-medium tracking-tight text-ink">{name}</h1>
                <StatusPill
                  variant={leadStageToPillVariant(lead.stage)}
                  label={LEAD_STAGE_LABELS[lead.stage] ?? lead.stage}
                />
              </div>
              <p className="mt-0.5 truncate text-sm text-ink-muted">
                {lead.propertyAddress}, {lead.propertyPostcode}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs font-medium text-brand">{lead.source}</span>
            {customer?.phone ? (
              <PhoneButton
                number={customer.phone}
                className="shrink-0"
                context={{ leadId: lead.id, customerName: name }}
              />
            ) : null}
            {onClose ? (
              <button
                type="button"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-subtle transition-colors hover:bg-sidebar hover:text-ink"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            ) : null}
          </div>
        </div>
      </CurvedContainer>

      <div className="grid grid-cols-2 items-start gap-5">
        <div className="min-w-0 space-y-5">
          <CurvedContainer className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
              Contact & property
            </p>
            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
              {customer?.email ? (
                <Field label="Email">
                  <CopyValue
                    value={customer.email}
                    className="text-sm font-medium break-all text-ink"
                  />
                </Field>
              ) : null}
              {customer?.phone ? (
                <Field label="Phone">
                  <CopyValue
                    value={customer.phone}
                    className="text-sm font-medium text-ink"
                  />
                </Field>
              ) : (
                <Field label="Phone">—</Field>
              )}
              <Field label="Bedrooms">
                {lead.bedroomBand
                  ? BEDROOM_BAND_LABELS[lead.bedroomBand] ?? lead.bedroomBand
                  : "—"}
              </Field>
              <Field label="Property value">
                {formatPropertyValueLabel(lead)}
              </Field>
              <Field label="Property" className="col-span-2">
                <span className="break-words">
                  {lead.propertyAddress}, {lead.propertyPostcode}
                </span>
              </Field>
              {lead.intakeMessage || (lead.intakeDocuments?.length ?? 0) > 0 ? (
                <Field
                  label={intakeMessageLabel(lead.source)}
                  className="col-span-2"
                >
                  {lead.intakeMessage ? (
                    <span className="whitespace-pre-wrap">{lead.intakeMessage}</span>
                  ) : null}
                  {(lead.intakeDocuments?.length ?? 0) > 0 ? (
                    <ul className={lead.intakeMessage ? "mt-2 space-y-1" : "space-y-1"}>
                      {lead.intakeDocuments!.map((doc) => (
                        <li key={doc.id}>
                          <a
                            href={doc.storageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-brand hover:underline"
                          >
                            {INTAKE_DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}: {doc.filename}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </Field>
              ) : null}
            </div>
            {canMarkWon || canMoveToPaid ? (
              <div className="mt-4 space-y-2 border-t border-line pt-4">
                {canMarkWon ? (
                  <SecondaryButton
                    type="button"
                    className="h-auto! w-full px-4! py-1.5!"
                    disabled={markingWon || movingToPaid}
                    onClick={onOpenMarkWon}
                  >
                    {markingWon ? "Saving…" : "Mark as won"}
                  </SecondaryButton>
                ) : null}
                {canMoveToPaid ? (
                  <PrimaryButton
                    type="button"
                    className="h-auto! w-full px-4! py-1.5!"
                    disabled={movingToPaid || markingWon}
                    onClick={onOpenMoveToPaid}
                  >
                    {movingToPaid ? "Moving…" : "Move to paid"}
                  </PrimaryButton>
                ) : null}
              </div>
            ) : null}
          </CurvedContainer>

          <LeadTags
            leadId={lead.id}
            tags={lead.tags ?? []}
            onChange={(tags) => onLeadChange({ ...lead, tags })}
          />

          {(lead.signals?.length ?? 0) > 0 ? (
            <CrmPanel title="Conversation signals">
              <ul className="space-y-3">
                {lead.signals!.slice(0, 5).map((signal) => (
                  <li key={signal.id} className="text-sm">
                    <p className="font-medium text-ink">
                      {signal.nextAction || signal.intent || "Signal"}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {[
                        signal.objection,
                        signal.competitorMentioned ? "Competitor mentioned" : null,
                        signal.exchangeDate
                          ? `Exchange ${new Date(signal.exchangeDate).toLocaleDateString("en-GB")}`
                          : null,
                        signal.explicitStop ? "Asked not to be contacted" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || signal.sourceKind.toLowerCase()}
                    </p>
                  </li>
                ))}
              </ul>
            </CrmPanel>
          ) : null}

          <CrmPanel title="Lead origin">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-ink-muted">Source</span>
                <span className="text-right font-medium text-ink">{sourceLabel}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-ink-muted">Source ref</span>
                <span className="text-right font-medium text-ink">{lead.sourceRef ?? "—"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-ink-muted">Received</span>
                <span className="text-right font-medium text-ink">
                  {formatRelative(lead.createdAt)}
                </span>
              </div>
            </div>
          </CrmPanel>
        </div>

        <div className="min-w-0 space-y-5">
          <CrmPanel title="Next workflow step">
            <p className="font-medium text-ink">{nextWorkflowStepText(lead)}</p>
            {nextStep?.detail ? (
              <p className="mt-1 text-sm text-ink">{nextStep.detail}</p>
            ) : null}
            {nextStep?.recipient ? (
              <p className="mt-1 text-xs text-ink-muted">To {nextStep.recipient}</p>
            ) : null}
            {nextRun ? (
              <p className="mt-2 text-xs text-ink-muted">Next: {formatSchedule(nextRun)}</p>
            ) : null}
            {nextStep?.workflowName ? (
              <p className="mt-1 text-xs text-ink-muted">{nextStep.workflowName}</p>
            ) : null}
            {canTriggerNextStep ? (
              <SecondaryButton
                type="button"
                size="small"
                className="mt-3 w-full"
                disabled={advancingWorkflow}
                onClick={onAdvanceWorkflow}
              >
                Trigger next step
              </SecondaryButton>
            ) : null}
          </CrmPanel>

          <LeadWorkflowASend
            leadId={lead.id}
            quotedAmount={lead.quotedAmount}
            customerEmail={customer?.email}
            customerPhone={customer?.phone}
            onSent={onSent}
          />

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
            {stats.map((cell) => (
              <div key={cell.label} className="bg-surface px-4 py-3">
                <p className="text-xs text-ink-muted">{cell.label}</p>
                <p
                  className={cn(
                    "mt-1 font-semibold text-ink",
                    cell.warn && "text-amber-700"
                  )}
                >
                  {cell.value}
                </p>
                {cell.sub ? <p className="mt-0.5 text-xs text-ink-muted">{cell.sub}</p> : null}
              </div>
            ))}
          </div>

          <CurvedContainer className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
              Actions
            </p>
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <SecondaryButton
                  type="button"
                  size="small"
                  className="w-full"
                  onClick={onCreateTask}
                >
                  New task
                </SecondaryButton>
                {canStopAutomation ? (
                  <SecondaryButton
                    type="button"
                    size="small"
                    className="w-full"
                    onClick={onStopAutomation}
                    disabled={stoppingAutomation}
                  >
                    {stoppingAutomation ? "Stopping…" : "Stop automation"}
                  </SecondaryButton>
                ) : null}
                {canMarkLost ? (
                  <SecondaryButton
                    type="button"
                    size="small"
                    className="w-full"
                    onClick={onOpenMarkLost}
                  >
                    Mark as lost
                  </SecondaryButton>
                ) : null}
                {lead.stage !== "CONVERTED" ? (
                  <SecondaryButton
                    type="button"
                    size="small"
                    className="w-full border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                    onClick={onOpenDelete}
                  >
                    Delete lead
                  </SecondaryButton>
                ) : null}
              </div>
            </div>
          </CurvedContainer>
        </div>
      </div>
    </div>
  );
}
