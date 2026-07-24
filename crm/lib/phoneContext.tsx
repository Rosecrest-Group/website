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

export function PhoneProvider({ children }: { children: ReactNode }) {
  const [teamConnectEnabled, setTeamConnectEnabled] = useState(false);
  const [teamConnectNumbers, setTeamConnectNumbers] = useState<TeamConnectNumber[]>([]);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [selectedPhoneDocId, setSelectedPhoneDocId] = useState<string | null>(null);
  const [dialpadConfigured, setDialpadConfigured] = useState(false);
  const [dialpadEnabled, setDialpadEnabled] = useState(false);
  const [dialpadIframeUrl, setDialpadIframeUrl] = useState<string | null>(null);
  const [dialpadSidebarOpen, setDialpadSidebarOpen] = useState(true);
  const iframeRef = useRef<RefObject<HTMLIFrameElement | null> | null>(null);

  async function refreshTeamConnectNumbers() {
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
  }

  async function refreshDialpadConfig() {
    try {
      const config = await api.getDialpadConfig();
      setDialpadConfigured(config.configured);
      setDialpadEnabled(config.enabled);
      setDialpadIframeUrl(config.ctiIframeUrl);
      if (config.enabled) setDialpadSidebarOpen(true);
    } catch {
      setDialpadConfigured(false);
      setDialpadEnabled(false);
      setDialpadIframeUrl(null);
    }
  }

  async function refreshPhoneSettings() {
    try {
      const u = await api.getMe();
      setUserPhone(u.phone ?? null);
    } catch {
      setUserPhone(null);
    }
    await Promise.all([refreshTeamConnectNumbers(), refreshDialpadConfig()]);
  }

  useEffect(() => {
    refreshPhoneSettings();
  }, []);

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
