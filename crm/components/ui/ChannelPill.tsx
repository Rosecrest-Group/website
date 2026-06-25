"use client";

import { Mail, MessageSquare, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNEL_CONFIG = {
  EMAIL: {
    label: "Email",
    icon: Mail,
    className: "border-sky-200/80 bg-sky-50 text-sky-800",
  },
  SMS: {
    label: "SMS",
    icon: MessageSquare,
    className: "border-(--color-tc-20) bg-(--color-nc-10) text-(--color-tc-40)",
  },
  WHATSAPP: {
    label: "WhatsApp",
    icon: Phone,
    className: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
  },
} as const;

export default function ChannelPill({
  channel,
  className,
}: {
  channel: string;
  className?: string;
}) {
  const config = CHANNEL_CONFIG[channel as keyof typeof CHANNEL_CONFIG] ?? {
    label: channel,
    icon: MessageSquare,
    className: "border-(--color-tc-20) bg-(--color-nc-10) text-(--color-tc-40)",
  };
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold leading-none tracking-wide",
        config.className,
        className
      )}
    >
      <Icon className="size-3 shrink-0 opacity-70" aria-hidden />
      {config.label}
    </span>
  );
}
