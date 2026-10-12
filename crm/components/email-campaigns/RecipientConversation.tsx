"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft, Maximize2 } from "lucide-react";
import { api } from "@/crm/lib/api";
import { CRM_BASE_PATH } from "@/crm/lib/constants";
import { useCrmTopBar } from "@/crm/lib/crmTopBarContext";
import { filterLeadThreadActivities } from "@/crm/lib/threadActivities";
import type { Activity, Message } from "@/crm/types";
import type { CampaignRecipientDetail } from "@/crm/types/campaigns";
import { toast } from "sonner";
import ActivityFeed from "@/crm/components/ActivityFeed";
import CreateTaskModal from "@/crm/components/CreateTaskModal";
import LeadInternalNotesPanel from "@/crm/components/LeadInternalNotesPanel";
import LeadTags from "@/crm/components/LeadTags";
import SurveyTypeSelect from "@/crm/components/SurveyTypeSelect";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import CopyValue from "@/crm/components/ui/CopyValue";
import ConfirmModal from "@/crm/components/ui/ConfirmModal";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import PhoneButton from "@/crm/components/PhoneButton";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextField from "@/crm/components/ui/TextField";
import CrmModal from "@/crm/components/ui/CrmModal";
import SlidingPaneTabs, { SlidingPane, THREAD_PANES, THREAD_PANE_LABEL, type ThreadPane } from "@/crm/components/ui/SlidingPaneTabs";
import LeadMessageThread from "@/crm/components/LeadMessageThread";

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function RecipientBreadcrumb({ campaignId, campaignName, name }: { campaignId: string; campaignName: string; name?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
      <Link
        href={`${CRM_BASE_PATH}/email-campaigns/${campaignId}`}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-(--color-tc-30) transition-colors hover:bg-(--color-nc-10) hover:text-(--color-tc-40)"
      >
        <ArrowLeft className="size-3.5" />
        Campaign
      </Link>
      <ChevronRight className="size-3.5 shrink-0 text-(--color-tc-20)" aria-hidden />
      <span className="shrink-0 text-(--color-tc-30)">{campaignName}</span>
      {name ? (
        <>
          <ChevronRight className="size-3.5 shrink-0 text-(--color-tc-20)" aria-hidden />
          <span className="truncate font-medium text-(--color-tc-40)">{name}</span>
        </>
      ) : null}
    </nav>
  );
}

function OutcomeFields({
  amount,
  surveyLevel,
  disabled,
  needsAddress,
  propertyAddress,
  propertyPostcode,
  amountLabel = "Quote (£)",
  onAmount,
  onSurvey,
  onAddress,
  onPostcode,
}: {
  amount: string;
  surveyLevel: string;
  disabled: boolean;
  needsAddress: boolean;
  propertyAddress: string;
  propertyPostcode: string;
  amountLabel?: string;
  onAmount: (value: string) => void;
  onSurvey: (slug: string) => void;
  onAddress: (value: string) => void;
  onPostcode: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <SurveyTypeSelect
        value={surveyLevel}
        disabled={disabled}
        variant="new-lead"
        allowCreate
        allowManage={false}
        onChange={onSurvey}
      />
      <TextField
        label={amountLabel}
        type="text"
        inputMode="decimal"
        value={amount}
        disabled={disabled}
        autoFocus
        placeholder="0.00"
        onChange={(e) => onAmount(e.target.value.replace(/[^0-9.]/g, ""))}
      />
      {needsAddress ? (
        <>
          <TextField
            label="Property address"
            value={propertyAddress}
            disabled={disabled}
            onChange={(e) => onAddress(e.target.value)}
          />
          <TextField
            label="Postcode"
            value={propertyPostcode}
            disabled={disabled}
            onChange={(e) => onPostcode(e.target.value)}
          />
        </>
      ) : null}
    </div>
  );
}

function toMessages(detail: CampaignRecipientDetail): Message[] {
  return detail.messages.map((message) => ({
    id: message.id,
    channel: "EMAIL",
    direction: message.direction,
    body: message.body,
    subject: message.subject,
    status: message.status,
    createdAt: message.createdAt,
    sentAt: message.sentAt,
    toAddress: message.direction === "OUTBOUND" ? detail.email : undefined,
    fromAddress: message.direction === "INBOUND" ? detail.email : undefined,
  }));
}

function toCallActivities(detail: CampaignRecipientDetail): Activity[] {
  return detail.calls.map((call) => ({
    id: call.id,
    type: "call.completed",
    description: `Call · ${call.status}`,
    createdAt: call.createdAt,
    metadata: {
      durationSeconds: call.durationSeconds,
      outcome: call.status,
      toNumber: call.toNumber,
    },
  }));
}

function personActivities(detail: CampaignRecipientDetail): Activity[] {
  const recorded = detail.activities ?? [];
  const callEvents = recorded.filter((activity) => activity.type.includes("call"));
  const logs = toCallActivities(detail).filter((call) => {
    const at = new Date(call.createdAt).getTime();
    return !callEvents.some((event) => Math.abs(new Date(event.createdAt).getTime() - at) < 2 * 60 * 1000);
  });
  return [...recorded, ...logs];
}

export default function RecipientConversation({ recipientId }: { recipientId: string }) {
  const router = useRouter();
  const { setLeft: setTopBar } = useCrmTopBar();
  const [detail, setDetail] = useState<CampaignRecipientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messagesMaximized, setMessagesMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<ThreadPane>("messages");
  const [notesMounted, setNotesMounted] = useState(false);
  const [activityMounted, setActivityMounted] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [noteTargetMessage, setNoteTargetMessage] = useState<Message | null>(null);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; fullName: string }>>([]);
  const [markWonOpen, setMarkWonOpen] = useState(false);
  const [movePaidOpen, setMovePaidOpen] = useState(false);
  const [markingWon, setMarkingWon] = useState(false);
  const [movingToPaid, setMovingToPaid] = useState(false);
  const [wonAmount, setWonAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [wonSurvey, setWonSurvey] = useState("LEVEL_2");
  const [paidSurvey, setPaidSurvey] = useState("LEVEL_2");
  const [wonError, setWonError] = useState<string | null>(null);
  const [paidError, setPaidError] = useState<string | null>(null);
  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyPostcode, setPropertyPostcode] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .getCampaignRecipient(recipientId)
      .then((row) => {
        if (cancelled) return;
        if (row.leadId) {
          router.replace(`${CRM_BASE_PATH}/leads/${row.leadId}?fromCampaign=${row.campaignId}`);
          return;
        }
        setDetail(row);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not open this person");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [recipientId, router]);

  useEffect(() => {
    if (!detail) return;
    setTopBar(
      <RecipientBreadcrumb campaignId={detail.campaignId} campaignName={detail.campaignName} name={detail.name} />,
    );
    return () => setTopBar(null);
  }, [detail, setTopBar]);

  const messages = useMemo(() => (detail ? toMessages(detail) : []), [detail]);
  const activities = useMemo(() => (detail ? personActivities(detail) : []), [detail]);
  const threadActivities = useMemo(() => filterLeadThreadActivities(activities), [activities]);

  useEffect(() => {
    api
      .getMentionSuggestions()
      .then((res) => setTeamMembers(res.users.map((user) => ({ id: user.id, fullName: user.fullName }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!detail) return;
    const timer = window.setInterval(() => {
      void api.getCampaignRecipient(recipientId).then(setDetail).catch(() => {});
    }, 8000);
    return () => window.clearInterval(timer);
  }, [detail?.id, recipientId]);

  async function reload() {
    const row = await api.getCampaignRecipient(recipientId);
    setDetail(row);
  }

  function outcomePayload(amount: string, surveyLevel: string) {
    const value = Number(amount);
    const needsAddress = !detail?.address || !detail.postcode;
    return {
      amount: value,
      surveyLevel,
      ...(needsAddress
        ? { propertyAddress: propertyAddress.trim(), propertyPostcode: propertyPostcode.trim() }
        : {}),
    };
  }

  function validateOutcome(amount: string, surveyLevel: string) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return "Enter a valid amount greater than 0.";
    if (!surveyLevel) return "Select a survey type.";
    if ((!detail?.address || !detail.postcode) && (!propertyAddress.trim() || !propertyPostcode.trim())) {
      return "Add the property address and postcode.";
    }
    return null;
  }

  async function markWon() {
    if (markingWon || !detail) return;
    const problem = validateOutcome(wonAmount, wonSurvey);
    if (problem) {
      setWonError(problem);
      return;
    }
    setMarkingWon(true);
    setWonError(null);
    try {
      const result = await api.markCampaignRecipientWon(detail.id, outcomePayload(wonAmount, wonSurvey));
      setMarkWonOpen(false);
      router.push(`${CRM_BASE_PATH}/leads/${result.leadId}?fromCampaign=${detail.campaignId}`);
    } catch (err: unknown) {
      setWonError(err instanceof Error ? err.message : "Failed to mark as won");
    } finally {
      setMarkingWon(false);
    }
  }

  async function moveToPaid() {
    if (movingToPaid || !detail) return;
    const problem = validateOutcome(paidAmount, paidSurvey);
    if (problem) {
      setPaidError(problem);
      return;
    }
    setMovingToPaid(true);
    setPaidError(null);
    try {
      const result = await api.moveCampaignRecipientToPaid(detail.id, outcomePayload(paidAmount, paidSurvey));
      setMovePaidOpen(false);
      toast.success("Moved to paid");
      router.push(`${CRM_BASE_PATH}/jobs/${result.jobId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to move to paid";
      setPaidError(message);
      toast.error(message);
    } finally {
      setMovingToPaid(false);
    }
  }

  if (loading) {
    return (
      <CrmPageContent className="!pt-3 sm:!pt-4 lg:!pt-4">
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  if (error || !detail) {
    return (
      <CrmPageContent className="!pt-3 sm:!pt-4 lg:!pt-4">
        <p className="text-sm text-orange-700">{error || "Recipient not found"}</p>
        <SecondaryButton type="button" className="mt-4 w-auto" onClick={() => router.push(`${CRM_BASE_PATH}/email-campaigns`)}>
          Back to campaigns
        </SecondaryButton>
      </CrmPageContent>
    );
  }

  const thread = (className: string) => (
    <LeadMessageThread
      leadId={detail.id}
      hostedThread
      customerName={detail.name}
      customerPhone={detail.phone}
      emailContacts={{
        customerEmail: detail.email,
        customerName: detail.name,
      }}
      messages={messages}
      threadActivities={threadActivities}
      framed={false}
      className={className}
      isActive={activeTab === "messages"}
      onAddNote={(message) => {
        setNoteTargetMessage(message);
        setMessagesMaximized(false);
        setNotesMounted(true);
        setActiveTab("internal");
      }}
      onHostedSend={async (input) => {
        if (input.channel === "EMAIL") {
          await api.sendCampaignRecipientFollowUp(detail.id, {
            subject: input.subject?.trim() || "Follow-up",
            body: input.body ?? "",
            htmlBody: input.htmlBody,
            mediaUrls: input.mediaUrls,
            replyToMessageId: input.replyToMessageId,
          });
        } else {
          await api.sendMessage({
            channel: input.channel,
            toAddress: detail.phone || undefined,
            body: input.body,
            mediaUrls: input.mediaUrls,
          });
        }
        await reload();
      }}
    />
  );

  return (
    <CrmPageContent className="!pt-3 sm:!pt-4 lg:!pt-4">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-6">
          <CurvedContainer className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-light/35 bg-brand-muted text-sm font-semibold text-brand">
                  {initials(detail.name)}
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Contact</p>
                  <h1 className="mt-1 text-lg font-medium tracking-tight break-words text-ink">{detail.name}</h1>
                </div>
              </div>
              {detail.phone ? (
                <PhoneButton
                  number={detail.phone}
                  className="shrink-0"
                  context={{ customerName: detail.name }}
                />
              ) : null}
            </div>

            <div className="mt-2 flex items-center justify-between gap-3 pl-[3.375rem]">
              <p className="font-mono text-xs break-all text-ink-subtle">{detail.id}</p>
              <p className="text-xs font-medium text-brand">{detail.campaignName}</p>
            </div>

            <div className="mt-4 grid gap-x-6 gap-y-3 border-t border-line pt-4 sm:grid-cols-2">
              <div className="min-w-0 sm:col-span-2">
                <p className="text-xs text-ink-muted">Email</p>
                <CopyValue value={detail.email} className="text-sm font-medium break-all text-ink" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-ink-muted">Phone</p>
                <CopyValue value={detail.phone ?? ""} className="text-sm font-medium text-ink" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-ink-muted">Lists</p>
                <p className="mt-0.5 text-sm font-medium text-ink">
                  {detail.lists.length > 0 ? detail.lists.join(", ") : "—"}
                </p>
              </div>
            </div>

            {detail.customerId ? (
              <div className="mt-4 space-y-2 border-t border-line pt-4">
                <SecondaryButton
                  type="button"
                  className="!h-auto w-full !px-4 !py-1.5"
                  disabled={markingWon || movingToPaid}
                  onClick={() => {
                    setWonError(null);
                    setWonAmount("");
                    setWonSurvey("LEVEL_2");
                    setPropertyAddress(detail.address ?? "");
                    setPropertyPostcode(detail.postcode ?? "");
                    setMarkWonOpen(true);
                  }}
                >
                  {markingWon ? "Saving…" : "Mark as won"}
                </SecondaryButton>
                <PrimaryButton
                  type="button"
                  className="!h-auto w-full !px-4 !py-1.5"
                  disabled={movingToPaid || markingWon}
                  onClick={() => {
                    setPaidError(null);
                    setPaidAmount("");
                    setPaidSurvey("LEVEL_2");
                    setPropertyAddress(detail.address ?? "");
                    setPropertyPostcode(detail.postcode ?? "");
                    setMovePaidOpen(true);
                  }}
                >
                  {movingToPaid ? "Moving…" : "Move to paid"}
                </PrimaryButton>
              </div>
            ) : null}
          </CurvedContainer>

          {detail.customerId ? (
            <LeadTags
              customerId={detail.customerId}
              tags={detail.tags ?? []}
              onChange={(tags) => setDetail((prev) => (prev ? { ...prev, tags } : prev))}
            />
          ) : null}
        </div>

        <div className="flex min-h-0 min-w-0 flex-col lg:sticky lg:top-3 lg:h-[calc(100dvh-5.5rem)] lg:self-start">
          <CurvedContainer
            className="flex min-h-[min(32rem,calc(100dvh-8rem))] min-w-0 flex-1 flex-col overflow-hidden lg:h-full lg:min-h-0"
            showBorderAndShadow
          >
            <div className="flex shrink-0 items-center border-b border-line px-4 py-2">
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <SlidingPaneTabs
                    id={`recipient-${detail.id}`}
                    panes={THREAD_PANES}
                    labels={THREAD_PANE_LABEL}
                    value={activeTab}
                    onChange={(pane) => {
                      if (pane === "internal") setNotesMounted(true);
                      if (pane === "activity") setActivityMounted(true);
                      setActiveTab(pane);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setCreateTaskOpen(true)}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand-muted"
                  >
                    New task
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("messages");
                    setMessagesMaximized(true);
                  }}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-sidebar hover:text-ink"
                  title="Maximize messages"
                  aria-label="Maximize messages"
                >
                  <Maximize2 className="size-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <SlidingPane panes={THREAD_PANES} pane="messages" active={activeTab}>
                {thread("h-full min-h-0 max-h-none flex-1")}
              </SlidingPane>
              {notesMounted ? (
                <SlidingPane panes={THREAD_PANES} pane="internal" active={activeTab} slideInOnMount>
                  {detail.customerId ? (
                    <LeadInternalNotesPanel
                      leadId={`customer:${detail.customerId}`}
                      customerId={detail.customerId}
                      referencedMessage={noteTargetMessage}
                      onClearReferencedMessage={() => setNoteTargetMessage(null)}
                      isActive={activeTab === "internal"}
                      framed={false}
                      className="h-full min-h-0 flex-1"
                    />
                  ) : (
                    <p className="p-4 text-sm text-ink-muted">This contact has no record to attach notes to.</p>
                  )}
                </SlidingPane>
              ) : null}
              {activityMounted ? (
                <SlidingPane panes={THREAD_PANES} pane="activity" active={activeTab} slideInOnMount>
                  <ActivityFeed
                    activities={activities}
                    messages={messages}
                    leadName={detail.name}
                    framed={false}
                    className="h-full min-h-0 flex-1"
                  />
                </SlidingPane>
              ) : null}
            </div>
          </CurvedContainer>
        </div>
      </div>

      <CrmModal
        isOpen={messagesMaximized}
        title={`Messages · ${detail.name}`}
        onClose={() => setMessagesMaximized(false)}
        size="xl"
        fitScreen
        bodyClassName="p-0"
      >
        {thread("h-full min-h-0 max-h-none flex-1")}
      </CrmModal>
      <CreateTaskModal
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        teamMembers={teamMembers}
      />
      <ConfirmModal
        isOpen={markWonOpen}
        title="Mark as won?"
        description={`Confirm the quote for ${detail.name}.`}
        confirmLabel="Mark as won"
        loading={markingWon}
        error={wonError ?? undefined}
        onConfirm={() => void markWon()}
        onCancel={() => {
          if (markingWon) return;
          setMarkWonOpen(false);
          setWonError(null);
        }}
      >
        <p className="mb-4 text-sm text-ink-muted">
          This records the quote as revenue and stops nurture. No email or SMS is sent, and no job is created.
        </p>
        <OutcomeFields
          amount={wonAmount}
          surveyLevel={wonSurvey}
          disabled={markingWon}
          needsAddress={!detail.address || !detail.postcode}
          propertyAddress={propertyAddress}
          propertyPostcode={propertyPostcode}
          onAmount={(next) => {
            setWonAmount(next);
            if (wonError) setWonError(null);
          }}
          onSurvey={(next) => {
            setWonSurvey(next);
            if (wonError) setWonError(null);
          }}
          onAddress={setPropertyAddress}
          onPostcode={setPropertyPostcode}
        />
      </ConfirmModal>
      <ConfirmModal
        isOpen={movePaidOpen}
        title="Move to paid?"
        description={`Record a bank transfer for ${detail.name}.`}
        confirmLabel="Move to paid"
        loading={movingToPaid}
        error={paidError ?? undefined}
        onConfirm={() => void moveToPaid()}
        onCancel={() => {
          if (movingToPaid) return;
          setMovePaidOpen(false);
          setPaidError(null);
        }}
      >
        <p className="mb-4 text-sm text-ink-muted">This creates the job as paid and stops nurture.</p>
        <OutcomeFields
          amount={paidAmount}
          surveyLevel={paidSurvey}
          disabled={movingToPaid}
          amountLabel="Amount (£)"
          needsAddress={!detail.address || !detail.postcode}
          propertyAddress={propertyAddress}
          propertyPostcode={propertyPostcode}
          onAmount={(next) => {
            setPaidAmount(next);
            if (paidError) setPaidError(null);
          }}
          onSurvey={(next) => {
            setPaidSurvey(next);
            if (paidError) setPaidError(null);
          }}
          onAddress={setPropertyAddress}
          onPostcode={setPropertyPostcode}
        />
      </ConfirmModal>
    </CrmPageContent>
  );
}
