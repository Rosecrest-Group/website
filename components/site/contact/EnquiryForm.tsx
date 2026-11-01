"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { clearAttribution, getAttribution } from "@/lib/attribution";
import { PHONE } from "@/lib/constants";
import { fieldClass, labelClass } from "@/components/site/CallbackForm";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  firstName: z.string().trim().min(1, "Please enter your first name"),
  lastName: z.string().trim().min(1, "Please enter your last name"),
  // The CRM needs an email to create the lead.
  email: z.email("Please enter a valid email address"),
  phone: z.string().trim().optional(),
  message: z.string().trim().min(1, "Please tell us about your enquiry"),
});

type FormValues = z.infer<typeof formSchema>;

function Required() {
  return (
    <span aria-hidden="true" className="text-[#B42318]">
      *
    </span>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs font-normal text-red-600">{message}</span>;
}

/**
 * "Send an enquiry" form used on /contact and /request-inspection.
 * Posts to /api/enquiry, then sends the visitor to /thank-you.
 */
export default function EnquiryForm({
  title,
  intro,
  submitLabel,
  formName,
  className,
}: {
  title: string;
  intro: string;
  submitLabel: string;
  /** Recorded with the lead's attribution so the CRM shows which form it came from. */
  formName: string;
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
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", message: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(false);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || undefined,
          message: values.message,
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

  const inputClass = cn(fieldClass, "bg-white px-4 py-3.5");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn("flex flex-col gap-[22px] rounded-3xl bg-white p-6 shadow-[0_24px_50px_-30px_rgba(15,30,56,0.4)] md:p-10", className)}
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-[24px] font-extrabold leading-[1.15] md:text-[28px]">{title}</h2>
        <p className="text-[17px] text-body">{intro}</p>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className={labelClass}>
          <span>
            First name <Required />
          </span>
          <input type="text" autoComplete="given-name" aria-required="true" className={inputClass} {...register("firstName")} />
          <FieldError message={errors.firstName?.message} />
        </label>
        <label className={labelClass}>
          <span>
            Last name <Required />
          </span>
          <input type="text" autoComplete="family-name" aria-required="true" className={inputClass} {...register("lastName")} />
          <FieldError message={errors.lastName?.message} />
        </label>
        <label className={labelClass}>
          <span>
            Email <Required />
          </span>
          <input type="email" autoComplete="email" aria-required="true" className={inputClass} {...register("email")} />
          <FieldError message={errors.email?.message} />
        </label>
        <label className={labelClass}>
          <span>Phone</span>
          <input type="tel" autoComplete="tel" className={inputClass} {...register("phone")} />
        </label>
        <label className={cn(labelClass, "sm:col-span-2")}>
          <span>
            Message <Required />
          </span>
          <textarea rows={5} aria-required="true" className={cn(inputClass, "resize-y")} {...register("message")} />
          <FieldError message={errors.message?.message} />
        </label>
      </div>
      {submitError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Something went wrong. Please try again or call us on {PHONE}.
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer rounded-xl border-0 bg-teal p-[18px] text-center text-lg font-bold text-white hover:bg-teal-dark disabled:opacity-60"
      >
        {isSubmitting ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
