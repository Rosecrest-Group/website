"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/crm/lib/api";
import type { MessageTemplate } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import TemplateEditorPanel from "@/crm/components/TemplateEditorPanel";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import ChannelPill from "@/crm/components/ui/ChannelPill";
import StatusPill from "@/crm/components/ui/StatusPill";
import LoadingSpinner from "@/crm/components/ui/LoadingSpinner";

type EditorMode = "create" | "edit" | null;

export default function TemplatesList() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selected, setSelected] = useState<MessageTemplate | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [loading, setLoading] = useState(true);

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
            <button
              key={t.id}
              type="button"
              onClick={() => selectTemplate(t)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                selected?.id === t.id && editorMode === "edit"
                  ? "border-(--color-primary) bg-(--color-nc-10)"
                  : "border-(--color-tc-20) bg-white hover:bg-(--color-nc-20)"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-(--color-tc-40)">{t.name}</span>
                <ChannelPill channel={t.channel} />
                {!t.isActive && <StatusPill variant="failed" label="Inactive" />}
              </div>
              <p className="mt-1 text-xs text-(--color-tc-30)">Trigger: {t.trigger}</p>
            </button>
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
    </CrmPageContent>
  );
}
