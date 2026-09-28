"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/crm/lib/api";
import type { ContactListAddResult, ContactListRow } from "@/crm/types/prospecting";
import CrmModal from "@/crm/components/ui/CrmModal";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import SelectField from "@/crm/components/ui/SelectField";
import TextField from "@/crm/components/ui/TextField";
import { cn } from "@/lib/utils";

const NEW_LIST = "";
const FOLD_EASE = "duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

let listsCache: ContactListRow[] | null = null;

function rememberLists(rows: ContactListRow[]) {
  listsCache = rows;
  return rows;
}

function upsertCachedList(list: ContactListRow) {
  const current = listsCache ?? [];
  return rememberLists([list, ...current.filter((row) => row.id !== list.id)]);
}

function fetchLists() {
  return api.listContactLists({ limit: 100 }).then((listed) => rememberLists(listed.items));
}

export default function AddToListModal({
  open,
  onClose,
  opportunityIds,
  customerIds,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  opportunityIds?: string[];
  customerIds?: string[];
  onAdded: (result: { list: ContactListRow; added: number; skipped: number; alreadyMembers: number }) => void;
}) {
  const [lists, setLists] = useState<ContactListRow[]>(() => listsCache ?? []);
  const [listsLoading, setListsLoading] = useState(!listsCache);
  const [listId, setListId] = useState(NEW_LIST);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (listsCache) {
      setLists(listsCache);
      setListsLoading(false);
    } else {
      setListsLoading(true);
    }
    void fetchLists()
      .then((rows) => {
        if (!cancelled) setLists(rows);
      })
      .catch(() => {
        if (!cancelled && !listsCache) setLists([]);
      })
      .finally(() => {
        if (!cancelled) setListsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setListId(NEW_LIST);
    setName("");
    setError(null);
    setLoading(false);
    if (listsCache) setLists(listsCache);
    void fetchLists()
      .then(setLists)
      .catch(() => undefined);
  }, [open]);

  const creating = listId === NEW_LIST;
  const canSubmit = creating ? name.trim().length > 0 : Boolean(listId);

  async function submit() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      if (opportunityIds?.length) {
        const result = await api.addContactListMemberships({
          listId: creating ? undefined : listId,
          name: creating ? name.trim() : undefined,
          opportunityIds,
        });
        upsertCachedList(result.list);
        onAdded(result);
        return;
      }
      const ids = customerIds ?? [];
      let target: ContactListRow;
      if (creating) {
        try {
          target = await api.createContactList(name.trim());
        } catch (err) {
          if (err instanceof Error && /already exists/i.test(err.message)) {
            const listed = await api.listContactLists({ search: name.trim(), limit: 100 });
            const match = listed.items.find((row) => row.name.toLowerCase() === name.trim().toLowerCase());
            if (!match) throw err;
            target = match;
          } else {
            throw err;
          }
        }
      } else {
        const existing = lists.find((row) => row.id === listId);
        if (!existing) throw new Error("Choose a list");
        target = existing;
      }
      const added = await api.addContactListMembers(target.id, ids);
      const list = { ...target, memberCount: target.memberCount + added.added };
      upsertCachedList(list);
      onAdded({
        list,
        added: added.added,
        skipped: added.missing,
        alreadyMembers: added.alreadyMembers,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to list");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CrmModal
      isOpen={open}
      title="Add to list"
      description="Save the firm as a company, with its people underneath, then attach it to this list."
      onClose={loading ? () => undefined : onClose}
      closeDisabled={loading}
      footer={
        <>
          <SecondaryButton type="button" className="w-auto" disabled={loading} onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" className="w-auto min-w-32" disabled={!canSubmit || loading} onClick={() => void submit()}>
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {loading ? "Adding…" : "Add to list"}
          </PrimaryButton>
        </>
      }
    >
      <div>
        <SelectField
          label="List"
          value={listId}
          disabled={loading || (listsLoading && lists.length === 0)}
          onChange={(event) => setListId(event.target.value)}
        >
          {listsLoading && lists.length === 0 ? (
            <option value={NEW_LIST}>Loading lists…</option>
          ) : (
            <>
              <option value={NEW_LIST}>New list</option>
              {lists.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name} ({row.memberCount})
                </option>
              ))}
            </>
          )}
        </SelectField>
        <div
          className={cn("grid", FOLD_EASE, "transition-[grid-template-rows]", creating ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={cn(
                "pt-4",
                FOLD_EASE,
                "transition-[opacity,transform]",
                creating ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
              )}
            >
              <TextField
                label="List name"
                value={name}
                disabled={loading || !creating}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Croydon solicitors"
              />
            </div>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-orange-700">{error}</p> : null}
      </div>
    </CrmModal>
  );
}

export function membershipToast(result: ContactListAddResult): string {
  const parts = [`${result.added} compan${result.added === 1 ? "y" : "ies"} added to ${result.list.name}`];
  if (result.alreadyMembers) parts.push(`${result.alreadyMembers} already on the list`);
  if (result.skipped) parts.push(`${result.skipped} skipped — no email or phone`);
  return parts.join(". ");
}
