"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { api } from "@/crm/lib/api";
import type { CallContext } from "@/crm/lib/callContext";
import { dialViaDialpadIframe, normalizeDialNumber } from "@/crm/lib/dialpadCti";

type PhoneContextValue = {
  smsEnabled: boolean;
  smsFromNumber: string | null;
  userPhone: string | null;
  refreshPhoneSettings: () => Promise<void>;
  dialpadConfigured: boolean;
  dialpadEnabled: boolean;
  dialpadIframeUrl: string | null;
  dialpadSidebarOpen: boolean;
  setDialpadSidebarOpen: (open: boolean) => void;
  registerDialpadIframe: (ref: RefObject<HTMLIFrameElement | null>) => void;
  placeCall: (number: string, context?: CallContext) => Promise<void>;
};

const PhoneContext = createContext<PhoneContextValue>({
  smsEnabled: false,
  smsFromNumber: null,
  userPhone: null,
  refreshPhoneSettings: async () => {},
  dialpadConfigured: false,
  dialpadEnabled: false,
  dialpadIframeUrl: null,
  dialpadSidebarOpen: false,
  setDialpadSidebarOpen: () => {},
  registerDialpadIframe: () => {},
  placeCall: async () => {},
});

export function usePhone() {
  return useContext(PhoneContext);
}

export function PhoneProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: { phone?: string | null } | null;
}) {
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsFromNumber, setSmsFromNumber] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(initialUser?.phone ?? null);
  const [dialpadConfigured, setDialpadConfigured] = useState(false);
  const [dialpadEnabled, setDialpadEnabled] = useState(false);
  const [dialpadIframeUrl, setDialpadIframeUrl] = useState<string | null>(null);
  // Start closed — auto-opening the Dialpad panel on boot covers the CRM and looks like a blank/hung page.
  const [dialpadSidebarOpen, setDialpadSidebarOpen] = useState(false);
  const iframeRef = useRef<RefObject<HTMLIFrameElement | null> | null>(null);

  const refreshSmsConfig = useCallback(async () => {
    try {
      const config = await api.getSmsConfig();
      setSmsEnabled(config.enabled);
      setSmsFromNumber(config.fromNumber);
    } catch {
      setSmsEnabled(false);
      setSmsFromNumber(null);
    }
  }, []);

  const refreshDialpadConfig = useCallback(async () => {
    try {
      const config = await api.getDialpadConfig();
      setDialpadConfigured(config.configured);
      setDialpadEnabled(config.enabled);
      setDialpadIframeUrl(config.ctiIframeUrl);
    } catch {
      setDialpadConfigured(false);
      setDialpadEnabled(false);
      setDialpadIframeUrl(null);
    }
  }, []);

  const refreshPhoneSettings = useCallback(async () => {
    try {
      const u = await api.getMe();
      setUserPhone(u.phone ?? null);
    } catch {
      setUserPhone(null);
    }
    await Promise.all([refreshSmsConfig(), refreshDialpadConfig()]);
  }, [refreshSmsConfig, refreshDialpadConfig]);

  useEffect(() => {
    // Defer phone/telephony boot so first page data isn't competing for bandwidth.
    const timer = window.setTimeout(() => {
      void refreshPhoneSettings();
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [refreshPhoneSettings]);

  const registerDialpadIframe = useCallback((ref: RefObject<HTMLIFrameElement | null>) => {
    iframeRef.current = ref;
  }, []);

  const placeCall = useCallback(
    async (number: string, context?: CallContext) => {
      if (!dialpadEnabled) {
        throw new Error("Dialpad calling is not enabled for your account");
      }

      const normalized = normalizeDialNumber(number);
      const result = await api.initiateDialpadCall({
        to: normalized,
        leadId: context?.leadId,
        jobId: context?.jobId,
      });

      setDialpadSidebarOpen(true);
      const iframe = iframeRef.current?.current ?? null;
      const dialed = dialViaDialpadIframe(iframe, normalized, result.customData);
      if (!dialed) {
        throw new Error("Dialpad softphone is still loading — try again in a moment");
      }
    },
    [dialpadEnabled]
  );

  return (
    <PhoneContext.Provider
      value={{
        smsEnabled,
        smsFromNumber,
        userPhone,
        refreshPhoneSettings,
        dialpadConfigured,
        dialpadEnabled,
        dialpadIframeUrl,
        dialpadSidebarOpen,
        setDialpadSidebarOpen,
        registerDialpadIframe,
        placeCall,
      }}
    >
      {children}
    </PhoneContext.Provider>
  );
}
