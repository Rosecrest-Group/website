import { toast } from "sonner";

const DIALPAD_ORIGIN = "https://dialpad.com";

export type DialContext = { leadId?: string; jobId?: string; customerName?: string };

export type IncomingCallPayload = {
  fromNumber: string;
  callId?: string;
};

let iframeReady = false;

export function isDialpadReady() {
  return iframeReady;
}
export function initDialpadListener(handlers?: {
  onReady?: () => void;
  onIncomingCall?: (call: IncomingCallPayload) => void;
}) {
  if (typeof window === "undefined") return () => {};
  const handler = (event: MessageEvent) => {
    if (!event.origin.includes("dialpad.com")) return;
    const type = event.data?.type as string | undefined;
    if (type === "dialpad.cti.ready") {
      iframeReady = true;
      handlers?.onReady?.();
    }
    if (type === "dialpad.incoming_call" || type === "incomingCall") {
      const fromNumber =
        event.data?.fromNumber ?? event.data?.from ?? event.data?.caller?.number;
      if (fromNumber) {
        handlers?.onIncomingCall?.({
          fromNumber: String(fromNumber),
          callId: event.data?.callId ?? event.data?.id,
        });
      }
    }
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}

export function dialNumber(number: string, ctx?: DialContext, options?: { phoneEnabled?: boolean }) {
  const cleaned = number.replace(/\s/g, "");
  if (typeof window === "undefined") return;

  if (options?.phoneEnabled === false) {
    toast.error("Dialpad not configured for your account — ask an admin");
    return;
  }

  const iframe = document.getElementById("dialpad-cti-iframe") as HTMLIFrameElement | null;
  if (iframe?.contentWindow && iframeReady) {
    iframe.contentWindow.postMessage(
      { type: "dialpad.dial", number: cleaned, metadata: ctx ?? {} },
      DIALPAD_ORIGIN
    );
    return;
  }

  toast.warning("Dialpad in-browser unavailable — opening desktop app");
  window.open(`dialpad://${cleaned}`, "_blank");
}
export function getDialpadCtiUrl(clientId?: string) {
  const base = process.env.NEXT_PUBLIC_DIALPAD_CTI_URL ?? "https://dialpad.com/cti/embedded";
  if (!clientId) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}client_id=${encodeURIComponent(clientId)}`;
}
