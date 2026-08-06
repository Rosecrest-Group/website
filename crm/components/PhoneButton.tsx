"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import type { CallContext } from "@/crm/lib/callContext";
import { usePhone } from "@/crm/lib/phoneContext";
import { cn } from "@/lib/utils";

const DIALPAD_DISABLED_TOOLTIP =
  "Dialpad calling is not enabled for your account — ask an admin to enable phone access";

export default function PhoneButton({
  number,
  context,
  className,
  variant = "secondary",
}: {
  number: string;
  context?: CallContext;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const { dialpadEnabled, dialpadConfigured, placeCall, setDialpadSidebarOpen } = usePhone();
  const [calling, setCalling] = useState(false);

  if (!number) return null;

  const canCall = dialpadEnabled;
  const disabled = !canCall;

  const title = disabled
    ? dialpadConfigured
      ? DIALPAD_DISABLED_TOOLTIP
      : "Dialpad is not configured — set DIALPAD_CLIENT_ID in API env"
    : "Place call in CRM via Dialpad";

  async function handleClick() {
    if (!canCall) return;

    setCalling(true);
    setDialpadSidebarOpen(true);
    try {
      await placeCall(number, context);
      toast.success("Connecting call in Dialpad…");
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === "FORBIDDEN") {
        toast.error(DIALPAD_DISABLED_TOOLTIP);
      } else if (err.code === "NOT_CONFIGURED") {
        toast.error("Dialpad is not configured on the server");
      } else {
        toast.error(err.message || "Failed to place call");
      }
    } finally {
      setCalling(false);
    }
  }

  const label = (
    <>
      <Phone className="size-4" />
      {calling ? "Calling…" : "Call"}
    </>
  );

  if (variant === "primary") {
    return (
      <PrimaryButton
        type="button"
        className={cn("!h-auto min-h-0 w-auto gap-1.5 px-5 py-1 text-sm", className)}
        disabled={disabled || calling}
        title={title}
        onClick={handleClick}
      >
        {label}
      </PrimaryButton>
    );
  }

  return (
    <SecondaryButton
      type="button"
      size="small"
      className={cn("gap-1", className)}
      disabled={disabled || calling}
      title={title}
      onClick={handleClick}
    >
      {label}
    </SecondaryButton>
  );
}
