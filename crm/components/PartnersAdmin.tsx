"use client";

import { useEffect, useState } from "react";
import { api } from "@/crm/lib/api";
import { toast } from "sonner";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CrmPanel from "@/crm/components/ui/CrmPanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import StatusPill from "@/crm/components/ui/StatusPill";
import TextField from "@/crm/components/ui/TextField";
import Table, { type Column } from "@/crm/components/ui/Table";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import type { ApiUser } from "@/crm/types";
import Link from "next/link";

type Partner = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  description: string | null;
  contactEmail: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  leadCount: number;
};

type NewPartnerResult = {
  id: string;
  name: string;
  slug: string;
  apiKey: string;
  isActive: boolean;
  description: string | null;
  contactEmail: string | null;
  createdAt: string;
};

export default function PartnersAdmin() {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const isAdmin = currentUser ? ["SUPER_ADMIN", "ADMIN"].includes(currentUser.role) : false;

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerDescription, setNewPartnerDescription] = useState("");
  const [newPartnerEmail, setNewPartnerEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [newPartnerResult, setNewPartnerResult] = useState<NewPartnerResult | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<(Partner & { apiKey?: string }) | null>(null);
  const [viewingApiKey, setViewingApiKey] = useState(false);

  function loadPartners() {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .listPartners()
      .then((r) => setPartners(r.items))
      .catch(() => toast.error("Failed to load partners"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    api.getMe().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    loadPartners();
  }, [isAdmin]);

  async function createPartner() {
    if (!newPartnerName.trim()) {
      toast.error("Partner name is required");
      return;
    }
    setCreating(true);
    try {
      const result = await api.createPartner({
        name: newPartnerName.trim(),
        description: newPartnerDescription.trim() || undefined,
        contactEmail: newPartnerEmail.trim() || undefined,
      });
      setNewPartnerResult(result);
      loadPartners();
      setNewPartnerName("");
      setNewPartnerDescription("");
      setNewPartnerEmail("");
      setShowCreateForm(false);
      toast.success("Partner created successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create partner");
    } finally {
      setCreating(false);
    }
  }

  async function togglePartnerActive(partner: Partner) {
    try {
      await api.updatePartner(partner.id, { isActive: !partner.isActive });
      loadPartners();
      toast.success(`Partner ${partner.isActive ? "disabled" : "enabled"}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update partner");
    }
  }

  async function viewApiKey(partner: Partner) {
    try {
      const full = await api.getPartner(partner.id);
      setSelectedPartner(full);
      setViewingApiKey(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load API key");
    }
  }

  async function regenerateKey(partnerId: string) {
    if (!confirm("Are you sure? The old API key will stop working immediately.")) return;
    try {
      const result = await api.regeneratePartnerKey(partnerId);
      setSelectedPartner((p) => (p ? { ...p, apiKey: result.apiKey } : null));
      toast.success("API key regenerated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to regenerate key");
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }

  const partnerColumns: Column<Partner & Record<string, unknown>>[] = [
    {
      key: "name",
      header: "Partner",
      render: (_, row) => (
        <div>
          <p className="font-medium text-(--color-tc-40)">{row.name}</p>
          <p className="text-xs text-(--color-tc-30)">TP-{row.slug}</p>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (value) => (
        <StatusPill variant={value ? "completed" : "failed"} label={value ? "Active" : "Disabled"} />
      ),
    },
    {
      key: "leadCount",
      header: "Leads",
      render: (value) => <span className="text-sm text-(--color-tc-30)">{value as number}</span>,
    },
    {
      key: "lastUsedAt",
      header: "Last Used",
      render: (value) => (
        <span className="text-xs text-(--color-tc-30)">
          {value ? new Date(value as string).toLocaleDateString() : "Never"}
        </span>
      ),
    },
    {
      key: "id",
      header: "",
      render: (_, row) => (
        <div className="flex gap-2">
          <SecondaryButton type="button" size="small" className="w-auto" onClick={() => viewApiKey(row)}>
            View Key
          </SecondaryButton>
          <SecondaryButton
            type="button"
            size="small"
            className="w-auto"
            onClick={() => togglePartnerActive(row)}
          >
            {row.isActive ? "Disable" : "Enable"}
          </SecondaryButton>
        </div>
      ),
    },
  ];

  if (!isAdmin && !loading && currentUser) {
    return (
      <CrmPageContent>
        <CrmPageHeader title="API Partners" subtitle="Admin access required" />
        <CrmPanel>
          <p className="text-sm text-(--color-tc-30)">You need Admin or Super Admin access to manage API partners.</p>
        </CrmPanel>
      </CrmPageContent>
    );
  }

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="API Partners"
        subtitle="Create keys for third-party lead senders"
        actions={
          <>
            <Link
              href="/crm/documentation"
              target="_blank"
              className="inline-flex h-10 items-center justify-center rounded-[12px] border border-(--color-nc-40) bg-white px-4 text-sm font-bold text-(--color-primary) hover:bg-slate-50"
            >
              View public docs
            </Link>
            {isAdmin ? (
              <PrimaryButton type="button" className="w-auto px-6" onClick={() => setShowCreateForm(true)}>
                Add Partner
              </PrimaryButton>
            ) : null}
          </>
        }
      />

      <CrmPanel title="Registered partners">
        {loading ? (
          <LoadingSpinner />
        ) : partners.length === 0 ? (
          <p className="text-sm text-(--color-tc-30)">No partners registered yet.</p>
        ) : (
          <Table
            columns={partnerColumns}
            data={partners as (Partner & Record<string, unknown>)[]}
            getRowKey={(r) => r.id}
          />
        )}
      </CrmPanel>

      {showCreateForm && (
        <CrmPanel title="Add new partner">
          <div className="space-y-4">
            <TextField
              label="Partner name"
              placeholder="e.g. Acme Leads Ltd"
              value={newPartnerName}
              onChange={(e) => setNewPartnerName(e.target.value)}
            />
            <TextField
              label="Description (optional)"
              placeholder="Brief description of the partner"
              value={newPartnerDescription}
              onChange={(e) => setNewPartnerDescription(e.target.value)}
            />
            <TextField
              label="Contact email (optional)"
              type="email"
              placeholder="contact@partner.com"
              value={newPartnerEmail}
              onChange={(e) => setNewPartnerEmail(e.target.value)}
            />
            <div className="flex gap-3">
              <PrimaryButton type="button" className="w-auto px-6" onClick={createPartner} disabled={creating}>
                {creating ? "Creating..." : "Create partner"}
              </PrimaryButton>
              <SecondaryButton
                type="button"
                size="small"
                className="w-auto"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </SecondaryButton>
            </div>
          </div>
        </CrmPanel>
      )}

      {newPartnerResult && (
        <CrmPanel title="New partner created">
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="mb-2 font-semibold text-green-800">Partner created successfully</p>
              <p className="text-sm text-green-700">Save this API key now — share it with the partner.</p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-(--color-tc-40)">Slug</p>
              <p className="font-mono text-(--color-tc-30)">TP-{newPartnerResult.slug}</p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-(--color-tc-40)">API key</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded-lg bg-(--color-nc-10) p-3 text-sm text-(--color-tc-40)">
                  {newPartnerResult.apiKey}
                </code>
                <SecondaryButton
                  type="button"
                  size="small"
                  className="w-auto"
                  onClick={() => copyToClipboard(newPartnerResult.apiKey, "API key")}
                >
                  Copy
                </SecondaryButton>
              </div>
            </div>
            <SecondaryButton
              type="button"
              size="small"
              className="w-auto"
              onClick={() => setNewPartnerResult(null)}
            >
              Close
            </SecondaryButton>
          </div>
        </CrmPanel>
      )}

      {viewingApiKey && selectedPartner && (
        <CrmPanel title={`API key — ${selectedPartner.name}`}>
          <div className="space-y-4">
            {selectedPartner.apiKey && (
              <div>
                <p className="mb-1 text-sm font-medium text-(--color-tc-40)">API key</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all rounded-lg bg-(--color-nc-10) p-3 text-sm text-(--color-tc-40)">
                    {selectedPartner.apiKey}
                  </code>
                  <SecondaryButton
                    type="button"
                    size="small"
                    className="w-auto"
                    onClick={() => copyToClipboard(selectedPartner.apiKey!, "API key")}
                  >
                    Copy
                  </SecondaryButton>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              {currentUser?.role === "SUPER_ADMIN" && (
                <SecondaryButton
                  type="button"
                  size="small"
                  className="w-auto"
                  onClick={() => regenerateKey(selectedPartner.id)}
                >
                  Regenerate key
                </SecondaryButton>
              )}
              <SecondaryButton
                type="button"
                size="small"
                className="w-auto"
                onClick={() => {
                  setViewingApiKey(false);
                  setSelectedPartner(null);
                }}
              >
                Close
              </SecondaryButton>
            </div>
          </div>
        </CrmPanel>
      )}
    </CrmPageContent>
  );
}
