"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/crm/lib/api";
import type { MessageTemplate } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import TemplateEditorPanel from "@/crm/components/TemplateEditorPanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import ChannelPill from "@/crm/components/ui/ChannelPill";
import StatusPill from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";
import ConfirmModal from "@/crm/components/ui/ConfirmModal";

type EditorMode = "create" | "edit" | null;

function TemplateRow({
  template,
  selected,
  editorMode,
  onSelect,
  onDelete,
}: {
  template: MessageTemplate;
  selected: MessageTemplate | null;
  editorMode: EditorMode;
  onSelect: (template: MessageTemplate) => void;
  onDelete: (template: MessageTemplate) => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 transition ${
        selected?.id === template.id && editorMode === "edit"
          ? "border-(--color-primary) bg-(--color-nc-10)"
          : "border-(--color-tc-20) bg-white hover:bg-(--color-nc-20)"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(template)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-(--color-tc-40)">{template.name}</span>
          <ChannelPill channel={template.channel} />
          {!template.isActive && <StatusPill variant="failed" label="Inactive" />}
        </div>
        <p className="mt-1 text-xs text-(--color-tc-30)">Trigger: {template.trigger}</p>
      </button>
      <button
        type="button"
        title="Delete template"
        aria-label={`Delete ${template.name}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-red-200 text-red-600 transition hover:border-red-400 hover:bg-red-50 hover:text-red-700"
        onClick={() => onDelete(template)}
      >
        <Trash2 className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

export default function TemplatesList() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selected, setSelected] = useState<MessageTemplate | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<MessageTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    api.listTemplates().then((r) => {
      setTemplates(r.items);
      setLoading(false);
    });
  }, []);

  function startCreate() {
    setSelected(null);
    setEditorMode("create");
  }

  function selectTemplate(template: MessageTemplate) {
    setSelected(template);
    setEditorMode("edit");
  }

  function closeEditor() {
    setEditorMode(null);
  }

  function handleSaved(template: MessageTemplate) {
    setTemplates((list) => {
      const exists = list.some((item) => item.id === template.id);
      const next = exists
        ? list.map((item) => (item.id === template.id ? template : item))
        : [...list, template];
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
    setSelected(template);
    setEditorMode("edit");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError("");
    setDeleting(true);
    try {
      await api.deleteTemplate(deleteTarget.id);
      setTemplates((list) => list.filter((item) => item.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) {
        setSelected(null);
        setEditorMode(null);
      }
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete template");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <CrmPageContent>
        <LoadingSpinner />
      </CrmPageContent>
    );
  }

  return (
    <CrmPageContent>
      <CrmPageHeader
        title="Message templates"
        subtitle="Create and edit email, SMS, and WhatsApp templates with merge fields."
        actions={
          <PrimaryButton type="button" onClick={startCreate} className="w-auto gap-2">
            <Plus className="size-4" aria-hidden />
            New template
          </PrimaryButton>
        }
      />

      <div className="space-y-2">
        {templates.length === 0 ? (
          <p className="rounded-xl border border-dashed border-(--color-tc-20) px-4 py-8 text-center text-sm text-(--color-tc-30)">
            No templates yet. Click New template to create your first one.
          </p>
        ) : (
          templates.map((t) => (
            <TemplateRow
              key={t.id}
              template={t}
              selected={selected}
              editorMode={editorMode}
              onSelect={selectTemplate}
              onDelete={(target) => {
                setDeleteError("");
                setDeleteTarget(target);
              }}
            />
          ))
        )}
      </div>

      {editorMode && (
        <TemplateEditorPanel
          isOpen={Boolean(editorMode)}
          mode={editorMode}
          template={editorMode === "edit" ? selected : null}
          onClose={closeEditor}
          onSaved={handleSaved}
        />
      )}

      <ConfirmModal
        isOpen={deleteTarget != null}
        title={`Delete ${deleteTarget?.name ?? "template"}?`}
        description="This permanently removes the template. Templates that have been used in sent messages cannot be deleted."
        confirmLabel="Delete template"
        loading={deleting}
        danger
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        error={deleteError || undefined}
        onConfirm={handleDelete}
      />
    </CrmPageContent>
  );
}
