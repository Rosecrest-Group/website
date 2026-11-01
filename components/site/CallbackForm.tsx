"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronDown } from "lucide-react";
import { clearAttribution, getAttribution } from "@/lib/attribution";
import { CALLBACK_NEEDS } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name"),
  phone: z.string().trim().min(7, "Please enter a phone number we can call"),
  // The CRM needs an email to create the lead.
  email: z.email("Please enter a valid email address"),
  details: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const fieldClass =
  "w-full rounded-xl border border-line-strong bg-field p-[13px] text-base font-normal text-ink placeholder:text-muted-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20";
export const labelClass = "flex flex-col gap-1.5 text-sm font-semibold text-ink";

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

function needsSummary(picked: string[]) {
  if (picked.length === 0) return "Choose all that apply";
  if (picked.length <= 2) return picked.join(", ");
  return `${picked[0]}, ${picked[1]} +${picked.length - 2} more`;
}

/** Multi-select dropdown for "What do you need help with?". */
function NeedsPicker({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const labelId = useId();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (label: string) =>
    onChange(value.includes(label) ? value.filter((x) => x !== label) : [...value, label]);

  return (
    <div ref={wrapRef} className="relative flex min-w-0 flex-col gap-1.5">
      <span id={labelId} className="text-sm font-semibold">
        What do you need help with?
      </span>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full min-w-0 cursor-pointer items-center justify-between gap-2.5 rounded-xl border bg-field p-[13px] text-left text-base text-ink",
          open ? "border-teal" : "border-line-strong",
        )}
      >
        <span className={cn("truncate", value.length ? "text-ink" : "text-muted-ink")}>{needsSummary(value)}</span>
        <ChevronDown aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-muted-ink" />
      </button>
      {open && (
        <div
          id={listId}
          role="group"
          aria-labelledby={labelId}
          className="absolute inset-x-0 top-full z-10 mt-1.5 flex max-h-[340px] flex-col overflow-y-auto rounded-xl border border-line-strong bg-white p-1.5 shadow-pop"
        >
          {CALLBACK_NEEDS.map((label) => {
            const checked = value.includes(label);
            return (
              <label
                key={label}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] font-medium",
                  checked ? "bg-teal-tint" : "bg-white hover:bg-mist",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(label)}
                  className="m-0 h-[18px] w-[18px] accent-teal"
                />
                {label}
              </label>
            );
          })}
          <div className="mt-1 flex items-center justify-between border-t border-line px-3 pb-1 pt-2 text-[13px] text-muted-ink">
            <span>Choose all that apply</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer border-0 bg-transparent px-1 py-1.5 text-sm font-bold text-teal"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CallbackForm({
  formName = "Call back request",
  defaultNeeds = [],
  context,
  submitLabel = "Request a call back",
  detailsPlaceholder = "e.g. We’re buying a Victorian terrace, or a tenant has reported mould",
  className,
}: {
  /** Recorded with the lead's attribution so the CRM shows which form it came from. */
  formName?: string;
  /** Pre-ticked options, e.g. the service of the page the form sits on. */
  defaultNeeds?: string[];
  /** Extra line for the CRM message, e.g. the service or postcode the visitor came from. */
  context?: string;
  submitLabel?: string;
  detailsPlaceholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const [needs, setNeeds] = useState<string[]>(defaultNeeds);
  const [submitError, setSubmitError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onTouched",
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", phone: "", email: "", details: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(false);
    const message = [
      `Call back requested on ${values.phone}.`,
      context ? `Enquiry about: ${context}.` : "",
      needs.length ? `Needs help with: ${needs.join(", ")}.` : "",
      values.details?.trim() ? `What's going on: ${values.details.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...splitName(values.name),
          email: values.email,
          phone: values.phone,
          message,
          attribution: getAttribution(formName),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      clearAttribution();
      // Thank-you pageview fires the GA4 / Google Ads conversion.
      router.push("/thank-you");
    } catch {
      setSubmitError(true);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn("flex flex-col gap-[18px]", className)}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5">
        <label className={labelClass}>
          Your name
          <input type="text" autoComplete="name" className={fieldClass} {...register("name")} />
          {errors.name && <span className="text-xs font-normal text-red-600">{errors.name.message}</span>}
        </label>
        <label className={labelClass}>
          Phone number
          <input type="tel" autoComplete="tel" className={fieldClass} {...register("phone")} />
          {errors.phone && <span className="text-xs font-normal text-red-600">{errors.phone.message}</span>}
        </label>
        <label className={labelClass}>
          Email
          <input type="email" autoComplete="email" className={fieldClass} {...register("email")} />
          {errors.email && <span className="text-xs font-normal text-red-600">{errors.email.message}</span>}
        </label>
        <NeedsPicker value={needs} onChange={setNeeds} />
      </div>
      <label className={labelClass}>
        <span>
          What’s going on? <span className="font-normal text-muted-ink">(optional)</span>
        </span>
        <textarea
          rows={3}
          placeholder={detailsPlaceholder}
          className={cn(fieldClass, "resize-y")}
          {...register("details")}
        />
      </label>
      {submitError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Something went wrong. Please try again or call us on 020 4576 5317.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-[18px] gap-y-3.5">
        <span className="flex-[1_1_220px] text-[13px] text-muted-ink">
          We call back within one business day. Your details are only used for this enquiry.{" "}
          <Link href="/privacy-policy" className="text-teal hover:text-teal-dark">
            Privacy
          </Link>
        </span>
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-14 flex-[1_1_260px] cursor-pointer rounded-xl border-0 bg-teal px-7 py-4 text-[17px] font-bold text-white hover:bg-teal-dark disabled:opacity-60"
        >
          {isSubmitting ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
