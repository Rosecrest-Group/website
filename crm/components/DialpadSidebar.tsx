"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import { api } from "@/crm/lib/api";
import { attachDialpadMessageListener } from "@/crm/lib/dialpadCti";
import { usePhone } from "@/crm/lib/phoneContext";
import { cn } from "@/lib/utils";

export default function DialpadSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const isWorkflowBuilder = /^\/crm\/workflows\/[^/]+/.test(pathname);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const linkedDialpadUserId = useRef<string | null>(null);
  const {
    dialpadEnabled,
    dialpadIframeUrl,
    dialpadSidebarOpen,
    setDialpadSidebarOpen,
    registerDialpadIframe,
  } = usePhone();

  useEffect(() => {
    registerDialpadIframe(iframeRef);
  }, [registerDialpadIframe]);

  useEffect(() => {
    if (isWorkflowBuilder && dialpadSidebarOpen) {
      setDialpadSidebarOpen(false);
    }
  }, [isWorkflowBuilder, dialpadSidebarOpen, setDialpadSidebarOpen]);

  useEffect(() => {
    if (!dialpadEnabled) return;

    return attachDialpadMessageListener({
      onAuthenticated: async (payload) => {
        if (!payload.user_authenticated || payload.user_id == null) return;
        const dialpadUserId = String(payload.user_id);
        if (linkedDialpadUserId.current === dialpadUserId) return;
        try {
          await api.linkDialpadUser(dialpadUserId);
          linkedDialpadUserId.current = dialpadUserId;
        } catch {
          // User may already be linked — non-fatal
        }
      },
      onCallRinging: async (payload) => {
        if (payload.state !== "on") return;

        const callerNumber =
          payload.external_number ?? payload.contact?.phone ?? payload.internal_number;
        if (!callerNumber) return;

        if (!isWorkflowBuilder) setDialpadSidebarOpen(true);

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
  }, [dialpadEnabled, isWorkflowBuilder, router, setDialpadSidebarOpen]);

  if (!dialpadEnabled || !dialpadIframeUrl) return null;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-30 flex w-[min(100vw,22rem)] flex-col border-l border-(--color-line) bg-(--color-surface) shadow-[var(--shadow-elevated)] transition-transform duration-200",
        !isWorkflowBuilder && dialpadSidebarOpen
          ? "translate-x-0"
          : "pointer-events-none translate-x-full"
      )}
      aria-hidden={isWorkflowBuilder || !dialpadSidebarOpen}
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
  );
}
