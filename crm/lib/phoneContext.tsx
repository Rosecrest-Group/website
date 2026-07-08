"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/crm/lib/api";
import type { TeamConnectNumber } from "@/crm/types";

type PhoneContextValue = {
  teamConnectEnabled: boolean;
  teamConnectNumbers: TeamConnectNumber[];
  userPhone: string | null;
  selectedPhoneDocId: string | null;
  setSelectedPhoneDocId: (phoneDocId: string | null) => void;
  refreshPhoneSettings: () => Promise<void>;
  refreshTeamConnectNumbers: () => Promise<void>;
};

const PhoneContext = createContext<PhoneContextValue>({
  teamConnectEnabled: false,
  teamConnectNumbers: [],
  userPhone: null,
  selectedPhoneDocId: null,
  setSelectedPhoneDocId: () => {},
  refreshPhoneSettings: async () => {},
  refreshTeamConnectNumbers: async () => {},
});

export function usePhone() {
  return useContext(PhoneContext);
}

export function PhoneProvider({ children }: { children: ReactNode }) {
  const [teamConnectEnabled, setTeamConnectEnabled] = useState(false);
  const [teamConnectNumbers, setTeamConnectNumbers] = useState<TeamConnectNumber[]>([]);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [selectedPhoneDocId, setSelectedPhoneDocId] = useState<string | null>(null);

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

  async function refreshPhoneSettings() {
    try {
      const u = await api.getMe();
      setUserPhone(u.phone ?? null);
    } catch {
      setUserPhone(null);
    }
    await refreshTeamConnectNumbers();
  }

  useEffect(() => {
    refreshPhoneSettings();
  }, []);

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
      }}
    >
      {children}
    </PhoneContext.Provider>
  );
}
