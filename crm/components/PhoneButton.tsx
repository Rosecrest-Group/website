"use client";

import { Phone } from "lucide-react";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import { dialNumber, type DialContext } from "@/crm/lib/dialpad";
import { usePhone } from "@/crm/lib/phoneContext";

const DISABLED_TOOLTIP = "Dialpad not configured for your account — ask an admin";

export default function PhoneButton({
  number,
  context,
  className,
}: {
  number: string;
  context?: DialContext;
  className?: string;
}) {
  const { phoneEnabled, dialpadReady } = usePhone();

  if (!number) return null;

  const disabled = !phoneEnabled;
  const title = disabled
    ? DISABLED_TOOLTIP
    : !dialpadReady
      ? "Sign in to Dialpad in the Phone sidebar, then try again"
      : undefined;

  return (
    <SecondaryButton
      type="button"
      size="small"
      className={`gap-1 ${className ?? ""}`}
      disabled={disabled}
      title={title}
      onClick={() => dialNumber(number, context, { phoneEnabled })}
    >
      <Phone className="size-4" />
      Call
    </SecondaryButton>
  );
}
