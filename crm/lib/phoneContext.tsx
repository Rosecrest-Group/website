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
import type { TeamConnectNumber } from "@/crm/types";

type PhoneContextValue = {
  teamConnectEnabled: boolean;
  teamConnectNumbers: TeamConnectNumber[];
  userPhone: string | null;
  selectedPhoneDocId: string | null;
  setSelectedPhoneDocId: (phoneDocId: string | null) => void;
  refreshPhoneSettings: () => Promise<void>;
  refreshTeamConnectNumbers: () => Promise<void>;
  dialpadConfigured: boolean;
  dialpadEnabled: boolean;
  dialpadIframeUrl: string | null;
  dialpadSidebarOpen: boolean;
  setDialpadSidebarOpen: (open: boolean) => void;
  registerDialpadIframe: (ref: RefObject<HTMLIFrameElement | null>) => void;
  placeCall: (number: string, context?: CallContext) => Promise<void>;
};

const PhoneContext = createContext<PhoneContextValue>({
  teamConnectEnabled: false,
  teamConnectNumbers: [],
  userPhone: null,
  selectedPhoneDocId: null,
  setSelectedPhoneDocId: () => {},
  refreshPhoneSettings: async () => {},
  refreshTeamConnectNumbers: async () => {},
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
  const [teamConnectEnabled, setTeamConnectEnabled] = useState(false);
  const [teamConnectNumbers, setTeamConnectNumbers] = useState<TeamConnectNumber[]>([]);
  const [userPhone, setUserPhone] = useState<string | null>(initialUser?.phone ?? null);
  const [selectedPhoneDocId, setSelectedPhoneDocId] = useState<string | null>(null);
  const [dialpadConfigured, setDialpadConfigured] = useState(false);
  const [dialpadEnabled, setDialpadEnabled] = useState(false);
  const [dialpadIframeUrl, setDialpadIframeUrl] = useState<string | null>(null);
  // Start closed — auto-opening the Dialpad panel on boot covers the CRM and looks like a blank/hung page.
  const [dialpadSidebarOpen, setDialpadSidebarOpen] = useState(false);
  const iframeRef = useRef<RefObject<HTMLIFrameElement | null> | null>(null);

  const refreshTeamConnectNumbers = useCallback(async () => {
    try {
      const result = await api.listTeamConnectNumbers();
      setTeamConnectEnabled(result.enabled);
      setTeamConnectNumbers(result.numbers);
      setSelectedPhoneDocId((current) => {
        if (current && result.numbers.some((n) => n.phoneDocId === current)) return current;
        return result.defaultPhoneDocId;
      });
    } catch {
      setTeamConnectEnabled(false);
      setTeamConnectNumbers([]);
      setSelectedPhoneDocId(null);
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
    await Promise.all([refreshTeamConnectNumbers(), refreshDialpadConfig()]);
  }, [refreshTeamConnectNumbers, refreshDialpadConfig]);

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
        teamConnectEnabled,
        teamConnectNumbers,
        userPhone,
        selectedPhoneDocId,
        setSelectedPhoneDocId,
        refreshPhoneSettings,
        refreshTeamConnectNumbers,
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
