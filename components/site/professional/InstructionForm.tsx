"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { clearAttribution, getAttribution } from "@/lib/attribution";
import { PHONE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { fieldClass, labelClass } from "@/components/site/CallbackForm";

const MATTER_TYPES = [
  "Housing disrepair claim",
  "Structural defects",
  "Damp and mould",
  "Water ingress and building defects",
  "Property condition for litigation",
  "Landlord and tenant dispute",
  "Other",
];
const SIDES = ["Claimant", "Defendant", "Single joint expert", "Not yet known"];
const FUNDING = ["Private", "Legal Aid", "CFA", "Other"];

const formSchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name"),
  firm: z.string().trim().min(1, "Please tell us your firm"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().trim().min(7, "Please enter a phone number we can call"),
  matterType: z.string().optional(),
  side: z.string().optional(),
  deadline: z.string().optional(),
  funding: z.string().optional(),
  details: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

function Select({
  label,
  options,
  registration,
}: {
  label: string;
  options: string[];
  registration: UseFormRegisterReturn;
}) {
  return (
    <label className={labelClass}>
      {label}
      <select className={cn(fieldClass, "cursor-pointer")} {...registration}>
        <option value="">Choose one</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Solicitor instruction form on the legal page. Sends the lead to /api/enquiry. */
export default function InstructionForm({
  formName = "Legal page instruction",
  className,
}: {
  formName?: string;
  className?: string;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onTouched",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      firm: "",
      email: "",
      phone: "",
      matterType: "",
      side: "",
      deadline: "",
      funding: "",
      details: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(false);
    const lines = [
      `Expert witness instruction enquiry from ${values.firm}.`,
      `Phone: ${values.phone}`,
      values.matterType ? `Matter type: ${values.matterType}` : "",
      values.side ? `Side: ${values.side}` : "",
      values.deadline?.trim() ? `Deadline: ${values.deadline.trim()}` : "",
      values.funding ? `Funding basis: ${values.funding}` : "",
      values.details?.trim() ? `The matter in brief: ${values.details.trim()}` : "",
    ];
    const message = lines.filter(Boolean).join("\n");

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
    <form
      aria-label="Solicitor instruction"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn("flex flex-col gap-4 rounded-[22px] bg-white p-6 text-ink md:p-9", className)}
    >
      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className={labelClass}>
          Name
          <input type="text" autoComplete="name" required className={fieldClass} {...register("name")} />
          {errors.name && <span className="text-xs font-normal text-red-600">{errors.name.message}</span>}
        </label>
        <label className={labelClass}>
          Firm
          <input type="text" autoComplete="organization" required className={fieldClass} {...register("firm")} />
          {errors.firm && <span className="text-xs font-normal text-red-600">{errors.firm.message}</span>}
        </label>
        <label className={labelClass}>
          Email
          <input type="email" autoComplete="email" required className={fieldClass} {...register("email")} />
          {errors.email && <span className="text-xs font-normal text-red-600">{errors.email.message}</span>}
        </label>
        <label className={labelClass}>
          Phone
          <input type="tel" autoComplete="tel" required className={fieldClass} {...register("phone")} />
          {errors.phone && <span className="text-xs font-normal text-red-600">{errors.phone.message}</span>}
        </label>
        <Select label="Matter type" options={MATTER_TYPES} registration={register("matterType")} />
        <Select label="Side" options={SIDES} registration={register("side")} />
        <label className={labelClass}>
          Deadline
          <input
            type="text"
            placeholder="Inspection or report date, or court direction"
            className={fieldClass}
            {...register("deadline")}
          />
        </label>
        <Select label="Funding basis" options={FUNDING} registration={register("funding")} />
      </div>
      <label className={labelClass}>
        <span>
          The matter in brief{" "}
          <span className="font-normal text-muted-ink">(optional; anonymised details are fine)</span>
        </span>
        <textarea rows={3} className={cn(fieldClass, "resize-y")} {...register("details")} />
      </label>
      {submitError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Something went wrong. Please try again or call us on {PHONE}.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 cursor-pointer rounded-xl border-0 bg-teal px-6 py-4 text-base font-bold text-white hover:bg-teal-dark disabled:opacity-60"
        >
          {isSubmitting ? "Sending…" : "Instruct an Inspection"}
        </button>
      </div>
      <span className="text-[13px] text-muted-ink">
        Your details are only used for this enquiry.{" "}
        <Link href="/privacy-policy" className="text-teal hover:text-teal-dark">
          Privacy
        </Link>
      </span>
    </form>
  );
}
