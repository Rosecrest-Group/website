"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { toast } from "sonner";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import { api } from "@/crm/lib/api";
import { attachDialpadMessageListener } from "@/crm/lib/dialpadCti";
import { usePhone } from "@/crm/lib/phoneContext";
import { cn } from "@/lib/utils";

export default function DialpadSidebar() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const {
    dialpadEnabled,
    dialpadIframeUrl,
    dialpadSidebarOpen,
    setDialpadSidebarOpen,
    registerDialpadIframe,
    refreshPhoneSettings,
  } = usePhone();

  useEffect(() => {
    registerDialpadIframe(iframeRef);
  }, [registerDialpadIframe]);

  useEffect(() => {
    if (!dialpadEnabled) return;

    return attachDialpadMessageListener({
      onAuthenticated: async (payload) => {
        if (payload.user_authenticated && payload.user_id != null) {
          try {
            await api.linkDialpadUser(String(payload.user_id));
            await refreshPhoneSettings();
          } catch {
            // User may already be linked — non-fatal
          }
        }
      },
      onCallRinging: async (payload) => {
        if (payload.state !== "on") return;

        const callerNumber =
          payload.external_number ?? payload.contact?.phone ?? payload.internal_number;
        if (!callerNumber) return;

        setDialpadSidebarOpen(true);

        try {
          const { customers } = await api.lookupCustomerByPhone(callerNumber);
          if (customers.length === 1) {
            const customer = customers[0];
            const leadId = customer.leads?.[0]?.id;
            const name = `${customer.firstName} ${customer.lastName}`.trim();
            if (leadId) {
              toast.info(`Incoming call from ${name}`, {
                action: {
                  label: "Open lead",
                  onClick: () => router.push(`/crm/leads/${leadId}`),
                },
              });
              router.push(`/crm/leads/${leadId}`);
              return;
            }
          }

          toast.info(`Incoming call from ${callerNumber}`, {
            description:
              customers.length > 1
                ? "Multiple contacts match this number"
                : "Caller not in CRM",
          });
        } catch {
          toast.info(`Incoming call from ${callerNumber}`);
        }
      },
    });
  }, [dialpadEnabled, refreshPhoneSettings, router, setDialpadSidebarOpen]);

  if (!dialpadEnabled || !dialpadIframeUrl) return null;

  return (
    <>
      {!dialpadSidebarOpen && (
        <button
          type="button"
          onClick={() => setDialpadSidebarOpen(true)}
          className="fixed bottom-6 right-4 z-40 flex size-10 items-center justify-center rounded-full bg-(--color-brand) text-white shadow-[var(--shadow-elevated)] transition-colors hover:bg-(--color-brand-deep) md:right-6"
          title="Open Dialpad"
          aria-label="Open Dialpad softphone"
        >
          <Phone className="size-5" />
        </button>
      )}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-30 flex w-[min(100vw,22rem)] flex-col border-l border-(--color-line) bg-(--color-surface) shadow-[var(--shadow-elevated)] transition-transform duration-200 md:static md:z-auto md:shrink-0 md:shadow-none",
          dialpadSidebarOpen ? "translate-x-0" : "translate-x-full md:hidden"
        )}
        aria-label="Dialpad softphone"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-(--color-tc-20) px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-(--color-tc-40)">Dialpad</p>
            <p className="truncate text-xs text-(--color-tc-30)">Calls &amp; voicemail in CRM</p>
          </div>
          <SecondaryButton
            type="button"
            size="small"
            className="shrink-0 gap-1 px-2"
            onClick={() => setDialpadSidebarOpen(false)}
            title="Minimize Dialpad"
          >
            <ChevronRight className="size-4 md:hidden" />
            <ChevronLeft className="hidden size-4 md:inline" />
            <span className="hidden md:inline">Hide</span>
          </SecondaryButton>
        </div>

        <iframe
          ref={iframeRef}
          src={dialpadIframeUrl}
          title="Dialpad"
          allow="microphone; speaker-selection; autoplay; camera; display-capture; hid"
          sandbox="allow-popups allow-scripts allow-same-origin allow-forms"
          className="min-h-0 flex-1 w-full border-0"
        />
      </aside>
    </>
  );
}
