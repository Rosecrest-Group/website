"use client";

import { useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import type { AdminUserSummary, TeamConnectNumber, WebhookEventSummary } from "@/crm/types";
import { toast } from "sonner";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import StatusPill from "@/crm/components/ui/StatusPill";
import SelectField from "@/crm/components/ui/SelectField";
import Table, { type Column } from "@/crm/components/ui/Table";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

const PROVIDERS = [
  "PINLOCAL",
  "COMPARE_MY_MOVE",
  "REALLYMOVING",
  "GET_A_SURVEYOR",
  "WEBSITE",
  "WEBSITE_CONTACT_FORM",
  "PARTY_WALL_TOOL",
  "STRIPE",
  "DIALPAD",
];

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return <StatusPill variant={ok ? "completed" : "in-review"} label={label} />;
}

export default function IntegrationsAdmin() {
  const [events, setEvents] = useState<WebhookEventSummary[]>([]);
  const [provider, setProvider] = useState("");
  const [selected, setSelected] = useState<WebhookEventSummary | null>(null);
  const [replayResult, setReplayResult] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [teamConnectEnabled, setTeamConnectEnabled] = useState(false);
  const [teamConnectNumbers, setTeamConnectNumbers] = useState<TeamConnectNumber[]>([]);
  const [teamConnectLoading, setTeamConnectLoading] = useState(true);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [dialpadStatus, setDialpadStatus] = useState<Awaited<
    ReturnType<typeof api.getDialpadIntegrationStatus>
  > | null>(null);
  const [dialpadLoading, setDialpadLoading] = useState(true);
  const [savingDialpadUserId, setSavingDialpadUserId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    const params: Record<string, string> = {};
    if (provider) params.provider = provider;
    api
      .listWebhookEvents(params)
      .then((r) => setEvents(r.items))
      .finally(() => setLoading(false));
  }

  function loadDialpad() {
    setDialpadLoading(true);
    Promise.all([api.getDialpadIntegrationStatus(), api.listAdminUsers()])
      .then(([status, userList]) => {
        setDialpadStatus(status);
        setUsers(userList.items);
      })
      .catch(() => toast.error("Failed to load Dialpad settings"))
      .finally(() => setDialpadLoading(false));
  }

  function loadTeamConnect() {
    setTeamConnectLoading(true);
    setUsersLoading(true);
    Promise.all([api.listTeamConnectNumbers(), api.listAdminUsers()])
      .then(([tc, userList]) => {
        setTeamConnectEnabled(tc.enabled);
        setTeamConnectNumbers(tc.numbers);
        setUsers(userList.items);
      })
      .catch(() => toast.error("Failed to load Team Connect settings"))
      .finally(() => {
        setTeamConnectLoading(false);
        setUsersLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, [provider]);

  useEffect(() => {
    loadTeamConnect();
    loadDialpad();
  }, []);

  async function toggleUserDialpad(user: AdminUserSummary) {
    setSavingDialpadUserId(user.id);
    try {
      await api.updateUserPhone(user.id, { phoneEnabled: !user.phoneEnabled });
      loadDialpad();
      toast.success(user.phoneEnabled ? "Dialpad disabled for user" : "Dialpad enabled for user");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update user");
    } finally {
      setSavingDialpadUserId(null);
    }
  }

  async function saveDialpadUserId(user: AdminUserSummary, dialpadUserId: string) {
    setSavingDialpadUserId(user.id);
    try {
      await api.updateUserPhone(user.id, {
        dialpadUserId: dialpadUserId.trim() || null,
      });
      loadDialpad();
      toast.success("Dialpad user ID saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save Dialpad user ID");
    } finally {
      setSavingDialpadUserId(null);
    }
  }

  async function replay(id: string, mode: "dry-run" | "safe" | "full") {
    const r = await api.replayWebhookEvent(id, mode);
    setReplayResult(JSON.stringify(r, null, 2));
    load();
  }

  const usersWithAgentPhone = users.filter((u) => u.phone?.trim()).length;

  const legacyUserColumns: Column<AdminUserSummary & Record<string, unknown>>[] = [
    {
      key: "fullName",
      header: "User",
      render: (_, row) => (
        <div>
          <p className="font-medium text-(--color-tc-40)">{row.fullName}</p>
          <p className="text-xs text-(--color-tc-30)">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (value) => <span className="text-xs text-(--color-tc-30)">{value as string}</span>,
    },
    {
      key: "phone",
      header: "Agent phone",
      render: (value) =>
        value ? (
          <span className="font-mono text-xs text-(--color-tc-40)">{value as string}</span>
        ) : (
          <span className="text-xs text-(--color-tc-30)">Not set</span>
        ),
    },
  ];

  const dialpadUserColumns: Column<AdminUserSummary & Record<string, unknown>>[] = [
    {
      key: "fullName",
      header: "User",
      render: (_, row) => (
        <div>
          <p className="font-medium text-(--color-tc-40)">{row.fullName}</p>
          <p className="text-xs text-(--color-tc-30)">{row.email}</p>
        </div>
      ),
    },
    {
      key: "phoneEnabled",
      header: "CRM calling",
      render: (value, row) => (
        <SecondaryButton
          type="button"
          size="small"
          className="w-auto"
          disabled={savingDialpadUserId === row.id}
          onClick={() => toggleUserDialpad(row as AdminUserSummary)}
        >
          {value ? "Enabled" : "Disabled"}
        </SecondaryButton>
      ),
    },
    {
      key: "dialpadUserId",
      header: "Dialpad user ID",
      render: (value, row) => (
        <input
          key={`${row.id}-${value as string | null}`}
          defaultValue={(value as string | null) ?? ""}
          placeholder="Auto-linked on login"
          className="w-full min-w-[8rem] rounded-lg border border-(--color-tc-20) px-2 py-1 font-mono text-xs"
          onBlur={(e) => {
            const next = e.target.value.trim();
            const current = ((value as string | null) ?? "").trim();
            if (next !== current) saveDialpadUserId(row as AdminUserSummary, next);
          }}
        />
      ),
    },
  ];

  const numberColumns: Column<TeamConnectNumber & Record<string, unknown>>[] = [
    {
      key: "label",
      header: "Label",
      render: (value) => <span className="text-sm text-(--color-tc-40)">{value as string}</span>,
    },
    {
      key: "voiceNumber",
      header: "Voice",
      render: (value) => <span className="font-mono text-xs">{value as string}</span>,
    },
    {
      key: "smsNumber",
      header: "SMS",
      render: (value) => (
        <span className="font-mono text-xs">{(value as string | null) ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => <StatusPill variant="completed" label={value as string} />,
    },
  ];

  const eventColumns: Column<WebhookEventSummary & Record<string, unknown>>[] = [
    {
      key: "provider",
      header: "Provider",
      render: (value) => <span className="font-mono text-xs">{value as string}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <StatusPill variant="in-review" label={value as string} />
          {row.ageWarning && <span className="text-xs text-amber-700">72h+</span>}
        </div>
      ),
    },
    {
      key: "receivedAt",
      header: "Received",
      render: (value) => (
        <span className="text-xs text-(--color-tc-30)">
          {new Date(value as string).toLocaleString()}
        </span>
      ),
    },
    {
      key: "id",
      header: "",
      render: (_, row) => (
        <SecondaryButton type="button" size="small" className="w-auto" onClick={() => setSelected(row)}>
          View
        </SecondaryButton>
      ),
    },
  ];

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Integrations"
        subtitle="Dialpad calling, Team Connect SMS, webhooks, and replay (admin)"
        actions={
          <>
            <SecondaryButton
              type="button"
              size="small"
              className="w-auto"
              onClick={() =>
                api.runWebhookArchive().then((r) => setReplayResult(`Archived ${r.archived} events`))
              }
            >
              Run archive job
            </SecondaryButton>
            <SecondaryButton
              type="button"
              size="small"
              className="w-auto"
              onClick={() =>
                api.getWebhookValidationSummary(7).then((r) =>
                  setReplayResult(
                    r.items.length
                      ? `Rejected (7d): ${r.items.map((i) => `${i.provider}=${i.count}`).join(", ")}`
                      : "No rejected webhooks in last 7 days"
                  )
                )
              }
            >
              Validation summary
            </SecondaryButton>
          </>
        }
      />

      <CrmPanel title="Dialpad (in-CRM calling)">
        <div className="space-y-4">
          {dialpadLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  ok={Boolean(dialpadStatus?.clientIdConfigured)}
                  label="Client ID configured"
                />
                <StatusBadge
                  ok={Boolean(dialpadStatus?.webhookSecretConfigured)}
                  label="Webhook secret configured"
                />
                <StatusPill
                  variant="pending"
                  label={`${dialpadStatus?.phoneEnabledUserCount ?? 0} users with calling enabled`}
                />
              </div>

              <div className="rounded-lg bg-(--color-nc-10) p-3 text-sm text-(--color-tc-30)">
                <p className="font-medium text-(--color-tc-40)">How calling works</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed">
                  <li>
                    Set <code className="rounded bg-white px-1">DIALPAD_CLIENT_ID</code> and{" "}
                    <code className="rounded bg-white px-1">DIALPAD_WEBHOOK_SECRET</code> in API env.
                  </li>
                  <li>
                    Configure Dialpad webhook to{" "}
                    <code className="rounded bg-white px-1 break-all">
                      {dialpadStatus?.voiceWebhookUrl ?? "/api/v1/intake/voice/DIALPAD"}
                    </code>
                  </li>
                  <li>Enable calling per user below — they sign in once in the Dialpad sidebar.</li>
                  <li>
                    Click Call on any lead — audio and controls stay in the CRM via the embedded
                    softphone. Opening a lead thread pulls finished Dialpad calls, transcripts,
                    and recaps by phone (set <code className="rounded bg-white px-1">DIALPAD_API_KEY</code>
                    ). Hangup webhooks still fill duration when they arrive.
                  </li>
                </ol>
              </div>

              {usersLoading ? (
                <LoadingSpinner />
              ) : (
                <Table
                  columns={dialpadUserColumns}
                  data={users as (AdminUserSummary & Record<string, unknown>)[]}
                  getRowKey={(r) => r.id}
                />
              )}
            </>
          )}
        </div>
      </CrmPanel>

      <CrmPanel title="Team Connect (SMS)">
        <div className="space-y-4">
          {teamConnectLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <StatusBadge ok={teamConnectEnabled} label="API key configured" />
                <StatusPill
                  variant="pending"
                  label={`${teamConnectNumbers.length} business number${teamConnectNumbers.length === 1 ? "" : "s"}`}
                />
                <StatusPill
                  variant={usersWithAgentPhone === users.length ? "completed" : "in-review"}
                  label={`${usersWithAgentPhone}/${users.length} users with agent phone`}
                />
              </div>

              <div className="rounded-lg bg-(--color-nc-10) p-3 text-sm text-(--color-tc-30)">
                <p className="font-medium text-(--color-tc-40)">SMS via Team Connect</p>
                <p className="mt-2 text-xs leading-relaxed">
                  Outbound SMS and inbound sync use Team Connect business numbers. Voice calls use
                  Dialpad above.
                </p>
              </div>

              {teamConnectNumbers.length > 0 ? (
                <Table
                  columns={numberColumns}
                  data={teamConnectNumbers as (TeamConnectNumber & Record<string, unknown>)[]}
                  getRowKey={(r) => r.phoneDocId}
                />
              ) : (
                <p className="text-sm text-(--color-tc-30)">No Team Connect numbers on this account.</p>
              )}

              <div className="border-t border-(--color-tc-20) pt-4">
                <p className="mb-1 text-sm font-medium text-(--color-tc-40)">Agent phones</p>
                <p className="mb-3 text-xs text-(--color-tc-30)">
                  Users set their own agent phone in Settings → Profile.
                </p>
                {usersLoading ? (
                  <LoadingSpinner />
                ) : (
                  <Table
                    columns={legacyUserColumns}
                    data={users as (AdminUserSummary & Record<string, unknown>)[]}
                    getRowKey={(r) => r.id}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </CrmPanel>

      <CrmPanel title="Inbound webhooks">
        <div className="mb-4 flex justify-end">
          <SelectField
            className="h-10 min-w-[180px]"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="">All providers</option>
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </SelectField>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : events.length === 0 ? (
          <p className="text-sm text-(--color-tc-30)">No webhook events</p>
        ) : (
          <Table
            columns={eventColumns}
            data={events as (WebhookEventSummary & Record<string, unknown>)[]}
            getRowKey={(r) => r.id}
            rowClassName={(row) => (row.ageWarning ? "bg-amber-50" : "")}
          />
        )}
      </CrmPanel>

      {selected && (
        <CrmPanel title={`Event ${selected.externalId}`}>
          <div className="space-y-3">
            {selected.error && <p className="text-sm text-red-600">{selected.error}</p>}
            <div className="flex flex-wrap gap-2">
              <SecondaryButton
                type="button"
                size="small"
                className="w-auto"
                onClick={() => replay(selected.id, "dry-run")}
              >
                Dry-run replay
              </SecondaryButton>
              <SecondaryButton
                type="button"
                size="small"
                className="w-auto"
                onClick={() => replay(selected.id, "safe")}
              >
                Safe replay
              </SecondaryButton>
              <PrimaryButton
                type="button"
                className="w-auto px-6"
                onClick={() => replay(selected.id, "full")}
              >
                Full replay
              </PrimaryButton>
            </div>
            {replayResult && (
              <pre className="max-h-64 overflow-auto rounded-lg bg-(--color-nc-10) p-3 text-xs text-(--color-tc-30)">
                {replayResult}
              </pre>
            )}
          </div>
        </CrmPanel>
      )}

      <CrmPanel title="Registered lead sources">
        <p className="text-sm text-(--color-tc-30)">
          PINLOCAL, Compare My Move, ReallyMoving, Get a Surveyor, Website, Website contact form, Party Wall Tool, Direct
        </p>
        <p className="mt-2 text-xs text-(--color-tc-30)">POST /api/v1/intake/leads/:source</p>
      </CrmPanel>
    </CrmPageContent>
  );
}
