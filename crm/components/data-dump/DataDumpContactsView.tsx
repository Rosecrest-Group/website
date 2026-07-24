"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "@/crm/lib/api";
import {
  contactDisplayName,
  DataDumpStatusBanner,
  DetailField,
  scopeHint,
  useDataDumpConfigured,
} from "@/crm/components/data-dump/shared";
import { DumpNoteCard } from "@/crm/components/data-dump/DumpCards";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import SearchInput from "@/crm/components/admin/SearchInput";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import CrmSlidePanel from "@/crm/components/ui/CrmSlidePanel";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import Pagination from "@/crm/components/ui/Pagination";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import Table, { type Column } from "@/crm/components/ui/Table";
import type {
  DumpContactSyncStatus,
  SalesIgniterContact,
  SalesIgniterContactSummary,
  SalesIgniterNote,
} from "@/crm/types";

const PAGE_SIZE = 50;

type ContactRow = SalesIgniterContactSummary & Record<string, unknown>;

function formatSyncTime(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-GB");
}

function matchesSearch(contact: SalesIgniterContactSummary, query: string): boolean {
  const haystack = [
    contactDisplayName(contact),
    contact.email,
    contact.phone,
    contact.companyName,
    contact.source,
    contact.type,
    ...(contact.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

const CONTACT_COLUMNS: Column<ContactRow>[] = [
  {
    key: "name",
    header: "Name",
    render: (_, row) => (
      <span className="font-medium text-(--color-primary)">{contactDisplayName(row)}</span>
    ),
  },
  { key: "email", header: "Email", render: (v) => (v ? String(v) : "—") },
  { key: "phone", header: "Phone", render: (v) => (v ? String(v) : "—") },
  { key: "source", header: "Source", render: (v) => (v ? String(v) : "—") },
  {
    key: "dateAdded",
    header: "Added",
    width: "160px",
    render: (v) => (v ? new Date(String(v)).toLocaleDateString("en-GB") : "—"),
  },
  {
    key: "tags",
    header: "Tags",
    render: (v) => {
      const tags = Array.isArray(v) ? v : [];
      return tags.length > 0 ? (
        <span className="line-clamp-1 text-xs text-(--color-tc-30)">{tags.join(", ")}</span>
      ) : (
        "—"
      );
    },
  },
];

export default function DataDumpContactsView() {
  const configured = useDataDumpConfigured();
  const autoSyncStarted = useRef(false);

  const [allContacts, setAllContacts] = useState<SalesIgniterContactSummary[]>([]);
  const [syncStatus, setSyncStatus] = useState<DumpContactSyncStatus | null>(null);
  const [syncProgress, setSyncProgress] = useState<{ checked: number; total: number } | null>(null);

  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [page, setPage] = useState(1);

  const [listLoading, setListLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<SalesIgniterContact | null>(null);
  const [notes, setNotes] = useState<SalesIgniterNote[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);

  const loadLocalContacts = useCallback(async () => {
    const localResult = await api.listDumpContacts();
    setAllContacts(localResult.contacts);
    setSyncStatus(localResult.sync);
  }, []);

  const runSync = useCallback(
    async (options?: { reloadOnly?: boolean }) => {
      if (!configured) return;

      setSyncError(null);

      if (!options?.reloadOnly) {
        setSyncLoading(true);
        setSyncProgress(null);

        try {
          let pageNum = 1;
          let isFirstChunk = true;
          let totalChecked = 0;
          let remoteTotal = 0;

          while (true) {
            const chunk = await api.syncDumpContacts({
              page: pageNum,
              reset: isFirstChunk,
            });

            isFirstChunk = false;
            totalChecked += chunk.checked;
            remoteTotal = chunk.remoteTotal;
            setSyncProgress({ checked: totalChecked, total: remoteTotal });

            if (chunk.done) break;
            pageNum += 1;
          }
        } catch (e) {
          setSyncError(e instanceof Error ? e.message : "Failed to sync contacts");
          throw e;
        } finally {
          setSyncLoading(false);
          setSyncProgress(null);
        }
      }

      await loadLocalContacts();
    },
    [configured, loadLocalContacts]
  );

  const initializePage = useCallback(async () => {
    if (!configured) return;

    setListLoading(true);
    setListError(null);

    try {
      await loadLocalContacts();
    } catch (e) {
      setAllContacts([]);
      setSyncStatus(null);
      setListError(e instanceof Error ? e.message : "Failed to load contacts");
    } finally {
      setListLoading(false);
    }

    void runSync().catch(() => {
      // syncError is set inside runSync
    });
  }, [configured, loadLocalContacts, runSync]);

  useEffect(() => {
    if (!configured) {
      setListLoading(false);
      return;
    }

    if (autoSyncStarted.current) return;
    autoSyncStarted.current = true;
    void initializePage();
  }, [configured, initializePage]);

  const filteredContacts = useMemo(() => {
    const query = activeQuery.trim().toLowerCase();
    if (!query) return allContacts;
    return allContacts.filter((contact) => matchesSearch(contact, query));
  }, [allContacts, activeQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / PAGE_SIZE));

  const pageContacts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredContacts.slice(start, start + PAGE_SIZE);
  }, [filteredContacts, page]);

  useEffect(() => {
    setPage(1);
  }, [activeQuery]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleSearch = useCallback((value: string) => {
    setActiveQuery(value.trim());
  }, []);

  const handleManualSync = useCallback(async () => {
    try {
      await runSync();
    } catch {
      // syncError is set inside runSync
    }
  }, [runSync]);

  const openContact = useCallback(async (summary: SalesIgniterContactSummary) => {
    setSelectedId(summary.id);
    setSelectedContact(summary);
    setNotes([]);
    setContactError(null);
    setNotesError(null);
    setDetailLoading(true);

    const [contactSettled, notesSettled] = await Promise.allSettled([
      api.getSalesIgniterContact(summary.id),
      api.getSalesIgniterContactNotes(summary.id),
    ]);

    if (contactSettled.status === "fulfilled") {
      setSelectedContact(contactSettled.value.contact);
    } else {
      const err = contactSettled.reason;
      setContactError(err instanceof Error ? err.message : "Failed to load full contact details");
    }

    if (notesSettled.status === "fulfilled") {
      setNotes(notesSettled.value.notes);
    } else {
      const err = notesSettled.reason;
      setNotesError(err instanceof Error ? err.message : "Failed to load notes");
    }

    setDetailLoading(false);
  }, []);

  const closePanel = () => {
    setSelectedId(null);
    setSelectedContact(null);
    setNotes([]);
    setContactError(null);
    setNotesError(null);
  };

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Contacts"
        subtitle="Browse and search legacy Sales Igniter contacts for migration review."
      />

      <DataDumpStatusBanner />

      {configured ? (
        <CurvedContainer>
          <div className="flex flex-wrap items-center justify-between gap-4 p-6">
            <SearchInput
              className="max-w-md flex-1"
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={setSearch}
              onSearch={handleSearch}
              debounceMs={400}
            />
            <div className="flex flex-wrap items-center gap-3">
              {syncStatus ? (
                <p className="text-xs text-(--color-tc-30)">
                  {syncStatus.dbTotal.toLocaleString()} in DB · Last sync{" "}
                  {formatSyncTime(syncStatus.lastSyncedAt)}
                </p>
              ) : null}
              <PrimaryButton
                type="button"
                onClick={() => void handleManualSync()}
                disabled={syncLoading || listLoading}
                className="inline-flex items-center gap-2"
              >
                <RefreshCw className={`size-4 ${syncLoading ? "animate-spin" : ""}`} aria-hidden />
                {syncLoading ? "Syncing…" : "Sync now"}
              </PrimaryButton>
            </div>
          </div>
          {syncProgress ? (
            <p className="border-t border-(--color-tc-20) px-6 py-3 text-sm text-(--color-tc-30)">
              Syncing… {syncProgress.checked.toLocaleString()} of{" "}
              {syncProgress.total.toLocaleString()} checked
            </p>
          ) : null}
          {syncError ? (
            <p className="border-t border-red-200 bg-red-50 px-6 py-3 text-sm text-red-800">
              {syncError}
            </p>
          ) : null}
        </CurvedContainer>
      ) : null}

      {listError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {listError}
        </p>
      ) : null}

      {configured ? (
        <>
          <p className="text-sm text-(--color-tc-30)">
            {filteredContacts.length.toLocaleString()} contact
            {filteredContacts.length === 1 ? "" : "s"}
            {activeQuery ? ` matching “${activeQuery}”` : ""}
            {filteredContacts.length !== allContacts.length
              ? ` (${allContacts.length.toLocaleString()} total in DB)`
              : ""}
          </p>

          {listLoading ? (
            <LoadingSpinner />
          ) : pageContacts.length === 0 ? (
            <CurvedContainer>
              <p className="p-6 text-center text-sm text-(--color-tc-30)">No contacts found.</p>
            </CurvedContainer>
          ) : (
            <>
              <Table
                columns={CONTACT_COLUMNS}
                data={pageContacts as ContactRow[]}
                getRowKey={(row) => row.id}
                onRowClick={(row) => void openContact(row)}
                rowClassName={() => "cursor-pointer hover:bg-slate-50"}
                compact
              />
              {totalPages > 1 ? (
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              ) : null}
            </>
          )}
        </>
      ) : null}

      <CrmSlidePanel
        isOpen={selectedId != null}
        onClose={closePanel}
        title={selectedContact ? contactDisplayName(selectedContact) : "Contact"}
        description={selectedId ?? undefined}
        widthClassName="max-w-2xl"
      >
        {detailLoading ? (
          <LoadingSpinner />
        ) : selectedContact ? (
          <div className="space-y-6">
            {contactError ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {contactError}
                {scopeHint(contactError)}
              </div>
            ) : null}

            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Email" value={selectedContact.email} />
              <DetailField label="Phone" value={selectedContact.phone} />
              <DetailField label="Company" value={selectedContact.companyName} />
              <DetailField label="Source" value={selectedContact.source} />
              <DetailField label="Type" value={selectedContact.type} />
              <DetailField
                label="Address"
                value={
                  [selectedContact.address1, selectedContact.city, selectedContact.postalCode]
                    .filter(Boolean)
                    .join(", ") || undefined
                }
              />
              <DetailField
                label="Added"
                value={
                  selectedContact.dateAdded
                    ? new Date(selectedContact.dateAdded).toLocaleString("en-GB")
                    : undefined
                }
              />
              <DetailField
                label="Last activity"
                value={
                  selectedContact.lastActivity
                    ? new Date(selectedContact.lastActivity).toLocaleString("en-GB")
                    : undefined
                }
              />
              {selectedContact.tags && selectedContact.tags.length > 0 ? (
                <div className="sm:col-span-2">
                  <DetailField label="Tags" value={selectedContact.tags.join(", ")} />
                </div>
              ) : null}
            </dl>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-(--color-tc-40)">
                Notes ({notes.length})
              </h3>
              {notesError ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {notesError}
                  {scopeHint(notesError)}
                </div>
              ) : notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <DumpNoteCard key={note.id} note={note} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-(--color-tc-30)">No notes for this contact.</p>
              )}
            </div>
          </div>
        ) : null}
      </CrmSlidePanel>
    </CrmPageContent>
  );
}
