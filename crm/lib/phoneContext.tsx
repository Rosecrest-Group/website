"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/crm/lib/api";
import { initDialpadListener } from "@/crm/lib/dialpad";

type PhoneContextValue = {
  phoneEnabled: boolean;
  dialpadReady: boolean;
  refreshPhoneSettings: () => Promise<void>;
};

const PhoneContext = createContext<PhoneContextValue>({
  phoneEnabled: false,
  dialpadReady: false,
  refreshPhoneSettings: async () => {},
});

export function usePhone() {
  return useContext(PhoneContext);
}

export function PhoneProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [phoneEnabled, setPhoneEnabled] = useState(false);
  const [dialpadReady, setDialpadReady] = useState(false);

  async function refreshPhoneSettings() {
    try {
      const u = await api.getMe();
      setPhoneEnabled(Boolean(u.phoneEnabled));
    } catch {
      setPhoneEnabled(false);
    }
  }

  useEffect(() => {
    refreshPhoneSettings();
  }, []);

  useEffect(() => {
    if (!phoneEnabled) {
      setDialpadReady(false);
      return;
    }

    return initDialpadListener({
      onReady: () => setDialpadReady(true),
      onIncomingCall: async (call) => {
        try {
          const { customers } = await api.lookupCustomerByPhone(call.fromNumber);
          if (customers.length === 1) {
            const c = customers[0];
            const leadId = c.leads?.[0]?.id;
            if (leadId) {
              router.push(`/crm/leads/${leadId}`);
            } else {
              router.push(`/crm/customers/${c.id}`);
            }
            toast.info(`Incoming call: ${c.firstName} ${c.lastName}`);
          } else if (customers.length > 1) {
            toast.info(`Incoming call from ${call.fromNumber} — multiple matches`);
          } else {
            toast.info(`Unknown caller: ${call.fromNumber}`, {
              action: {
                label: "New lead",
                onClick: () =>
                  router.push(`/crm/leads/new?phone=${encodeURIComponent(call.fromNumber)}`),
              },
            });
          }
        } catch {
          toast.info(`Incoming call: ${call.fromNumber}`);
        }
      },
    });
  }, [phoneEnabled, router]);

  return (
    <PhoneContext.Provider value={{ phoneEnabled, dialpadReady, refreshPhoneSettings }}>
      {children}
    </PhoneContext.Provider>
  );
}
