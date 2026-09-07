"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/crm/lib/api";
import type { SurveyType } from "@/crm/types";
import SelectField from "@/crm/components/ui/SelectField";
import TextField from "@/crm/components/ui/TextField";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import CrmModal from "@/crm/components/ui/CrmModal";

const NEW_LEAD_BUILTINS = new Set(["LEVEL_1", "LEVEL_2", "LEVEL_3"]);
const ADD_VALUE = "__add_survey_type__";

const BUILTIN_SEED: SurveyType[] = [
  { id: "stype_level_1", slug: "LEVEL_1", label: "Level 1", isBuiltIn: true, archivedAt: null, createdAt: "", updatedAt: "" },
  { id: "stype_level_2", slug: "LEVEL_2", label: "Level 2", isBuiltIn: true, archivedAt: null, createdAt: "", updatedAt: "" },
  { id: "stype_level_3", slug: "LEVEL_3", label: "Level 3", isBuiltIn: true, archivedAt: null, createdAt: "", updatedAt: "" },
  { id: "stype_cpr_35", slug: "CPR_35", label: "CPR-35", isBuiltIn: true, archivedAt: null, createdAt: "", updatedAt: "" },
];

export interface SurveyTypeSelectProps {
  label?: string;
  name?: string;
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
  /** New lead: Level 1–3 + custom. Convert: every active catalog type. */
  variant?: "new-lead" | "all-active";
  allowCreate?: boolean;
  allowManage?: boolean;
  onCatalogChange?: (types: SurveyType[]) => void;
}

function sortForNewLead(types: SurveyType[]): SurveyType[] {
  const order = ["LEVEL_1", "LEVEL_2", "LEVEL_3"];
  return [...types].sort((a, b) => {
    const ai = order.indexOf(a.slug);
    const bi = order.indexOf(b.slug);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return a.label.localeCompare(b.label);
  });
}

export default function SurveyTypeSelect({
  label = "Survey level",
  name = "surveyLevel",
  value,
  onChange,
  disabled = false,
  variant = "new-lead",
  allowCreate = variant === "new-lead",
  allowManage = variant === "new-lead",
  onCatalogChange,
}: SurveyTypeSelectProps) {
  const [types, setTypes] = useState<SurveyType[]>(BUILTIN_SEED);
  const [loadError, setLoadError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [manageError, setManageError] = useState("");
  const [renameDrafts, setRenameDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await api.listSurveyTypes({ includeArchived: true });
    setTypes(result.items);
    onCatalogChange?.(result.items);
    return result.items;
  }, [onCatalogChange]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
        if (!cancelled) setLoadError("");
      } catch {
        if (!cancelled) setLoadError("Could not load survey types");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const pickerTypes = useMemo(() => {
    const active = types.filter((t) => !t.archivedAt);
    if (variant === "new-lead") {
      return sortForNewLead(
        active.filter((t) => !t.isBuiltIn || NEW_LEAD_BUILTINS.has(t.slug))
      );
    }
    return active;
  }, [types, variant]);

  const selected = types.find((t) => t.slug === value);
  const options =
    pickerTypes.some((t) => t.slug === value) || !selected
      ? pickerTypes
      : [...pickerTypes, selected];

  const customTypes = useMemo(
    () => types.filter((t) => !t.isBuiltIn).sort((a, b) => a.label.localeCompare(b.label)),
    [types]
  );

  async function handleSelect(next: string) {
    if (next === ADD_VALUE) {
      setNewLabel("");
      setAddError("");
      setAddOpen(true);
      return;
    }
    onChange(next);
  }

  async function saveNewType() {
    setAddError("");
    setAdding(true);
    try {
      const created = await api.createSurveyType({ label: newLabel });
      await refresh();
      onChange(created.slug);
      setAddOpen(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Could not add survey type");
    } finally {
      setAdding(false);
    }
  }

  async function saveRename(type: SurveyType) {
    const label = (renameDrafts[type.id] ?? type.label).trim();
    if (!label || label === type.label) return;
    setManageError("");
    setBusyId(type.id);
    try {
      await api.updateSurveyType(type.id, { label });
      await refresh();
    } catch (err) {
      setManageError(err instanceof Error ? err.message : "Could not rename");
    } finally {
      setBusyId(null);
    }
  }

  async function setArchived(type: SurveyType, archived: boolean) {
    setManageError("");
    setBusyId(type.id);
    try {
      await api.updateSurveyType(type.id, { archived });
      const items = await refresh();
      if (archived && value === type.slug) {
        const next = items.find((t) => !t.archivedAt && t.slug === "LEVEL_2") ?? items.find((t) => !t.archivedAt);
        if (next) onChange(next.slug);
      }
    } catch (err) {
      setManageError(err instanceof Error ? err.message : "Could not update survey type");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-1.5">
      <SelectField
        label={label}
        name={name}
        value={value}
        disabled={disabled}
        onChange={(e) => void handleSelect(e.target.value)}
      >
        {options.map((type) => (
          <option key={type.id} value={type.slug}>
            {type.label}
          </option>
        ))}
        {allowCreate && <option value={ADD_VALUE}>Add new type…</option>}
      </SelectField>
      {allowManage && (
        <button
          type="button"
          className="text-xs font-medium text-brand hover:underline"
          onClick={() => {
            setManageError("");
            setRenameDrafts({});
            setManageOpen(true);
          }}
        >
          Manage types
        </button>
      )}
      {loadError && <p className="text-xs text-red-600">{loadError}</p>}

      <CrmModal
        isOpen={addOpen}
        title="Add survey type"
        description="This type is saved for this lead and will appear when you add the next one."
        onClose={() => !adding && setAddOpen(false)}
        closeDisabled={adding}
        size="sm"
        footer={
          <>
            <SecondaryButton type="button" disabled={adding} onClick={() => setAddOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="button" disabled={adding} onClick={() => void saveNewType()}>
              {adding ? "Saving…" : "Add type"}
            </PrimaryButton>
          </>
        }
      >
        <TextField
          label="Name"
          value={newLabel}
          autoFocus
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void saveNewType();
            }
          }}
        />
        {addError && <p className="mt-2 text-sm text-red-600">{addError}</p>}
      </CrmModal>

      <CrmModal
        isOpen={manageOpen}
        title="Manage survey types"
        description="Built-in Level 1–3 and CPR-35 cannot be changed. Archive hides a type from new leads."
        onClose={() => !busyId && setManageOpen(false)}
        closeDisabled={Boolean(busyId)}
        size="md"
        footer={
          <SecondaryButton type="button" disabled={Boolean(busyId)} onClick={() => setManageOpen(false)}>
            Done
          </SecondaryButton>
        }
      >
        {customTypes.length === 0 ? (
          <p className="text-sm text-ink-muted">No custom types yet. Add one from the survey dropdown.</p>
        ) : (
          <ul className="space-y-3">
            {customTypes.map((type) => {
              const archived = Boolean(type.archivedAt);
              return (
                <li key={type.id} className="flex flex-col gap-2 rounded-xl border border-line p-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <TextField
                      label={archived ? `${type.label} (archived)` : "Name"}
                      value={renameDrafts[type.id] ?? type.label}
                      disabled={Boolean(busyId) || archived}
                      onChange={(e) =>
                        setRenameDrafts((prev) => ({ ...prev, [type.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void saveRename(type);
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!archived && (
                      <SecondaryButton
                        type="button"
                        disabled={busyId === type.id}
                        onClick={() => void saveRename(type)}
                      >
                        Rename
                      </SecondaryButton>
                    )}
                    <SecondaryButton
                      type="button"
                      disabled={Boolean(busyId)}
                      onClick={() => void setArchived(type, !archived)}
                    >
                      {archived ? "Restore" : "Archive"}
                    </SecondaryButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {manageError && <p className="mt-3 text-sm text-red-600">{manageError}</p>}
      </CrmModal>
    </div>
  );
}
