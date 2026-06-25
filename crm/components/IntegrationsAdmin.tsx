"use client";

import { useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import type { AdminUserSummary, DialpadIntegrationStatus, WebhookEventSummary } from "@/crm/types";
import { toast } from "sonner";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import StatusPill from "@/crm/components/ui/StatusPill";
import TextField from "@/crm/components/ui/TextField";
import SelectField from "@/crm/components/ui/SelectField";
import Table, { type Column } from "@/crm/components/ui/Table";
import Toggle from "@/crm/components/ui/Toggle";
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

type UserEdit = { phoneEnabled: boolean; dialpadUserId: string };

export default function IntegrationsAdmin() {
  const [events, setEvents] = useState<WebhookEventSummary[]>([]);
  const [provider, setProvider] = useState("");
  const [selected, setSelected] = useState<WebhookEventSummary | null>(null);
  const [replayResult, setReplayResult] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dialpadStatus, setDialpadStatus] = useState<DialpadIntegrationStatus | null>(null);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userEdits, setUserEdits] = useState<Record<string, UserEdit>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

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
    setUsersLoading(true);
    Promise.all([api.getDialpadIntegrationStatus(), api.listAdminUsers()])
      .then(([status, userList]) => {
        setDialpadStatus(status);
        setUsers(userList.items);
        setUserEdits(
          Object.fromEntries(
            userList.items.map((u) => [
              u.id,
              { phoneEnabled: u.phoneEnabled, dialpadUserId: u.dialpadUserId ?? "" },
            ])
          )
        );
      })
      .catch(() => toast.error("Failed to load Dialpad settings"))
      .finally(() => setUsersLoading(false));
  }

  useEffect(() => {
    load();
  }, [provider]);

  useEffect(() => {
    loadDialpad();
  }, []);

  async function replay(id: string, mode: "dry-run" | "safe" | "full") {
    const r = await api.replayWebhookEvent(id, mode);
    setReplayResult(JSON.stringify(r, null, 2));
    load();
  }

  function copyWebhookUrl() {
    if (!dialpadStatus) return;
    navigator.clipboard.writeText(dialpadStatus.voiceWebhookUrl);
    toast.success("Webhook URL copied");
  }

  async function saveUserPhone(user: AdminUserSummary) {
    const edit = userEdits[user.id];
    if (!edit) return;
    setSavingUserId(user.id);
    try {
      const updated = await api.updateUserPhone(user.id, {
        phoneEnabled: edit.phoneEnabled,
        dialpadUserId: edit.dialpadUserId.trim() || null,
      });
      setUsers((list) => list.map((row) => (row.id === updated.id ? updated : row)));
      setUserEdits((prev) => ({
        ...prev,
        [updated.id]: {
          phoneEnabled: updated.phoneEnabled,
          dialpadUserId: updated.dialpadUserId ?? "",
        },
      }));
      toast.success(`Updated phone settings for ${updated.fullName}`);
      loadDialpad();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingUserId(null);
    }
  }

  function isUserDirty(user: AdminUserSummary) {
    const edit = userEdits[user.id];
    if (!edit) return false;
    return (
      edit.phoneEnabled !== user.phoneEnabled ||
      (edit.dialpadUserId.trim() || null) !== (user.dialpadUserId ?? null)
    );
  }

  const frontendClientId = Boolean(process.env.NEXT_PUBLIC_DIALPAD_CLIENT_ID);

  const userColumns: Column<AdminUserSummary & Record<string, unknown>>[] = [
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
      key: "phoneEnabled",
      header: "Phone",
      render: (_, row) => {
        const edit = userEdits[row.id];
        return (
          <label className="flex items-center gap-2 text-sm text-(--color-tc-40)">
            <Toggle
              aria-label={`Phone enabled for ${row.fullName}`}
              checked={edit?.phoneEnabled ?? row.phoneEnabled}
              onCheckedChange={(checked) =>
                setUserEdits((prev) => ({
                  ...prev,
                  [row.id]: {
                    ...prev[row.id],
                    phoneEnabled: checked,
                    dialpadUserId: prev[row.id]?.dialpadUserId ?? row.dialpadUserId ?? "",
                  },
                }))
              }
            />
            Phone enabled
          </label>
        );
      },
    },
    {
      key: "dialpadUserId",
      header: "Dialpad user ID",
      render: (_, row) => (
        <TextField
          className="h-10 font-mono text-xs"
          placeholder="Dialpad user ID"
          value={userEdits[row.id]?.dialpadUserId ?? ""}
          onChange={(e) =>
            setUserEdits((prev) => ({
              ...prev,
              [row.id]: {
                phoneEnabled: prev[row.id]?.phoneEnabled ?? row.phoneEnabled,
                dialpadUserId: e.target.value,
              },
            }))
          }
        />
      ),
    },
    {
      key: "id",
      header: "",
      render: (_, row) => (
        <SecondaryButton
          type="button"
          size="small"
          className="w-auto"
          disabled={!isUserDirty(row) || savingUserId === row.id}
          onClick={() => saveUserPhone(row)}
        >
          {savingUserId === row.id ? "Saving…" : "Save"}
        </SecondaryButton>
      ),
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
        subtitle="Dialpad setup, webhooks, and replay (admin)"
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

      <CrmPanel title="Dialpad (phone)">
        <div className="space-y-4">
          {dialpadStatus ? (
            <>
              <div className="flex flex-wrap gap-2">
                <StatusBadge ok={dialpadStatus.clientIdConfigured} label="API client ID (server)" />
                <StatusBadge ok={frontendClientId} label="Client ID (frontend)" />
                <StatusBadge ok={dialpadStatus.webhookSecretConfigured} label="Webhook secret" />
                <StatusPill
                  variant="pending"
                  label={`${dialpadStatus.phoneEnabledUserCount} users with phone enabled`}
                />
              </div>

              <div className="rounded-lg bg-(--color-nc-10) p-3 text-sm text-(--color-tc-30)">
                <p className="font-medium text-(--color-tc-40)">Setup steps</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed">
                  <li>Request CTI integration access from Dialpad support (Pro Flex plan or higher).</li>
                  <li>
                    Set <code className="rounded bg-white px-1">DIALPAD_CLIENT_ID</code> in API env and{" "}
                    <code className="rounded bg-white px-1">NEXT_PUBLIC_DIALPAD_CLIENT_ID</code> in frontend
                    env.
                  </li>
                  <li>
                    Set <code className="rounded bg-white px-1">DIALPAD_WEBHOOK_SECRET</code> and register
                    the voice webhook URL below in Dialpad.
                  </li>
                  <li>Enable phone for each user below — they sign in once in the Phone sidebar in the CRM.</li>
                </ol>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <code className="rounded-lg bg-(--color-nc-10) px-3 py-2 text-xs text-(--color-tc-30)">
                  {dialpadStatus.voiceWebhookUrl}
                </code>
                <SecondaryButton type="button" size="small" className="w-auto" onClick={copyWebhookUrl}>
                  Copy webhook URL
                </SecondaryButton>
              </div>
              <p className="text-xs text-(--color-tc-30)">CTI iframe URL: {dialpadStatus.ctiUrl}</p>
            </>
          ) : (
            <p className="text-sm text-(--color-tc-30)">Loading Dialpad status…</p>
          )}

          <div className="border-t border-(--color-tc-20) pt-4">
            <p className="mb-3 text-sm font-medium text-(--color-tc-40)">User phone access</p>
            {usersLoading ? (
              <LoadingSpinner />
            ) : (
              <Table
                columns={userColumns}
                data={users as (AdminUserSummary & Record<string, unknown>)[]}
                getRowKey={(r) => r.id}
              />
            )}
          </div>
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
        <p className="mt-2 text-xs text-(--color-tc-30)">
          POST /api/v1/intake/leads/:source · Voice: POST /api/v1/intake/voice/DIALPAD
        </p>
      </CrmPanel>
    </CrmPageContent>
  );
}
