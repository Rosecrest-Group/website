import type { CallContext } from "@/crm/lib/callContext";

export const DIALPAD_CTI_ORIGIN = "https://dialpad.com";
export const DIALPAD_CTI_API = "opencti_dialpad";
export const DIALPAD_CTI_VERSION = "1.0";

export type DialpadCtiMethod =
  | "initiate_call"
  | "enable_current_tab"
  | "hang_up_all_calls"
  | "call_ringing"
  | "user_authentication";

export type DialpadCallRingingPayload = {
  state: "on" | "off";
  id: number;
  contact?: {
    phone?: string;
    name?: string;
    email?: string;
    type?: string;
    id?: string;
  };
  target?: {
    phone?: string;
    name?: string;
    email?: string;
    type?: string;
    id?: string | number;
  };
  internal_number?: string;
  external_number?: string;
};

export type DialpadUserAuthPayload = {
  user_authenticated: boolean;
  user_id?: number | string;
};

type DialpadOutboundMessage = {
  api: typeof DIALPAD_CTI_API;
  version: typeof DIALPAD_CTI_VERSION;
  method: DialpadCtiMethod;
  payload?: Record<string, unknown>;
};

export type DialpadCtiHandlers = {
  onAuthenticated?: (payload: DialpadUserAuthPayload) => void;
  onCallRinging?: (payload: DialpadCallRingingPayload) => void;
};

function isDialpadMessage(data: unknown): data is DialpadOutboundMessage & { method: string } {
  if (!data || typeof data !== "object") return false;
  const msg = data as Record<string, unknown>;
  return msg.api === DIALPAD_CTI_API;
}

export function buildCallCustomData(context: CallContext & { userId?: string }) {
  return JSON.stringify({
    leadId: context.leadId,
    jobId: context.jobId,
    userId: context.userId,
  });
}

export function normalizeDialNumber(number: string) {
  const trimmed = number.replace(/\s/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
  if (digits.startsWith("44")) return `+${digits}`;
  return digits ? `+${digits}` : trimmed;
}

export function postToDialpadIframe(
  iframe: HTMLIFrameElement | null,
  method: DialpadCtiMethod,
  payload?: Record<string, unknown>
) {
  if (!iframe?.contentWindow) return false;
  iframe.contentWindow.postMessage(
    {
      api: DIALPAD_CTI_API,
      version: DIALPAD_CTI_VERSION,
      method,
      ...(payload ? { payload } : {}),
    },
    DIALPAD_CTI_ORIGIN
  );
  return true;
}

export function dialViaDialpadIframe(
  iframe: HTMLIFrameElement | null,
  number: string,
  customData: string
) {
  return postToDialpadIframe(iframe, "initiate_call", {
    enable_current_tab: true,
    phone_number: normalizeDialNumber(number),
    custom_data: customData,
  });
}

export function attachDialpadMessageListener(handlers: DialpadCtiHandlers) {
  function onMessage(event: MessageEvent) {
    if (event.origin !== DIALPAD_CTI_ORIGIN && !event.origin.endsWith(".dialpad.com")) return;
    if (!isDialpadMessage(event.data)) return;

    const { method, payload } = event.data as DialpadOutboundMessage & {
      payload?: DialpadCallRingingPayload | DialpadUserAuthPayload;
    };

    if (method === "user_authentication" && payload) {
      handlers.onAuthenticated?.(payload as DialpadUserAuthPayload);
    }
    if (method === "call_ringing" && payload) {
      handlers.onCallRinging?.(payload as DialpadCallRingingPayload);
    }
  }

  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}
