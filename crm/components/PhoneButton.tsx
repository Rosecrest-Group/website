"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import type { CallContext } from "@/crm/lib/callContext";
import { usePhone } from "@/crm/lib/phoneContext";
import { api } from "@/crm/lib/api";

const DISABLED_TOOLTIP =
  "Team Connect calling is not configured — check API key and ask an admin";

export default function PhoneButton({
  number,
  context,
  className,
}: {
  number: string;
  context?: CallContext;
  className?: string;
}) {
  const { teamConnectEnabled, teamConnectNumbers, userPhone, selectedPhoneDocId } = usePhone();
  const [calling, setCalling] = useState(false);

  if (!number) return null;

  const canCall = teamConnectEnabled && teamConnectNumbers.length > 0;
  const disabled = !canCall;

  const title = disabled
    ? DISABLED_TOOLTIP
    : !userPhone?.trim()
      ? "Add your phone in Settings → Profile — your phone rings first"
      : "Your phone will ring first, then the customer is connected";

  async function handleClick() {
    if (!canCall) return;

    const phoneDocId =
      selectedPhoneDocId ??
      teamConnectNumbers.find((n) => n.status === "active")?.phoneDocId;
    if (!phoneDocId) {
      toast.error("No Team Connect number available");
      return;
    }
    if (!userPhone?.trim()) {
      toast.error("Add your phone number in Settings → Profile before calling");
      return;
    }

    setCalling(true);
    try {
      await api.placeTeamConnectCall({
        phoneDocId,
        to: number.replace(/\s/g, ""),
        agentPhone: userPhone,
        leadId: context?.leadId,
        jobId: context?.jobId,
      });
      toast.success("Calling your phone — answer to connect the customer");
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === "PAYMENT_REQUIRED") {
        toast.error("Team Connect account needs a top-up before placing calls");
      } else if (err.code === "MISSING_AGENT_PHONE" || err.message.includes("Agent phone")) {
        toast.error("Add your phone number in Settings → Profile before calling");
      } else {
        toast.error(err.message || "Failed to place call");
      }
    } finally {
      setCalling(false);
    }
  }

  return (
    <SecondaryButton
      type="button"
      size="small"
      className={`gap-1 ${className ?? ""}`}
      disabled={disabled || calling}
      title={title}
      onClick={handleClick}
    >
      <Phone className="size-4" />
      {calling ? "Calling…" : "Call"}
    </SecondaryButton>
  );
}
