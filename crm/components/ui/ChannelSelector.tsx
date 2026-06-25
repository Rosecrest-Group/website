"use client";

import { ChevronDown, Mail, MessageSquare, Phone } from "lucide-react";

export type MessageChannel = "EMAIL" | "SMS" | "WHATSAPP";

const CHANNELS: Array<{ id: MessageChannel; label: string; icon: typeof Mail }> = [
  { id: "EMAIL", label: "Email", icon: Mail },
  { id: "SMS", label: "SMS", icon: MessageSquare },
  { id: "WHATSAPP", label: "WhatsApp", icon: Phone },
];

export default function ChannelSelector({
  channel,
  onChange,
  disabled = false,
}: {
  channel: MessageChannel;
  onChange: (channel: MessageChannel) => void;
  disabled?: boolean;
}) {
  const active = CHANNELS.find((item) => item.id === channel) ?? CHANNELS[0];
  const ActiveIcon = active.icon;

  return (
    <div className="relative shrink-0 self-end border-l border-(--color-tc-20) pl-1.5">
      <ActiveIcon
        className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-(--color-tc-30)"
        aria-hidden
      />
      <select
        value={channel}
        onChange={(e) => onChange(e.target.value as MessageChannel)}
        disabled={disabled}
        aria-label="Message channel"
        className="h-9 min-w-[7.5rem] cursor-pointer appearance-none rounded-xl bg-transparent py-1.5 pl-8 pr-7 text-xs font-medium text-(--color-tc-40) outline-none hover:bg-(--color-nc-10) focus:bg-(--color-nc-10) disabled:cursor-not-allowed disabled:opacity-50"
      >
        {CHANNELS.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-1 top-1/2 size-3.5 -translate-y-1/2 text-(--color-tc-30)"
        aria-hidden
      />
    </div>
  );
}
