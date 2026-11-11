"use client";

import { useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2 } from "lucide-react";
import { clearAttribution, getAttribution } from "@/lib/attribution";
import { PHONE, PHONE_HREF } from "@/lib/constants";
import { isLikelyUkPostcode, UK_POSTCODE_HINT } from "@/lib/ukPostcode";
import { fieldClass, labelClass } from "@/components/site/CallbackForm";
import { cn } from "@/lib/utils";
import {
  BEDROOM_OPTIONS,
  EXPRESS_FEE,
  REPORT_TURNAROUND,
  SURVEY_LABELS,
  formatPounds,
  levelFromSurveyType,
  surveyPrice,
  type SurveyLevel,
} from "@/components/site/homebuyer/pricing";

// Same fields and payload as the original booking form, so /api/booking and the CRM see no change.
const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().min(1, "Phone is required"),
  jobAddress: z.string().trim().min(1, "Address is required"),
  jobTown: z.string().trim().min(1, "Town is required"),
  jobPostcode: z.string().trim().min(1, "Postcode is required"),
  propertyType: z.string().min(1, "Please select a property type"),
  propertyValue: z.string().trim().min(1, "Please enter property value"),
  bedrooms: z.string().min(1, "Please select number of bedrooms"),
  helpWith: z.string().optional(),
  surveyType: z.string().min(1, "Please select survey type"),
  express: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const PROPERTY_TYPES = ["Flat or maisonette", "Terraced house", "Semi-detached", "Detached", "Bungalow"];

const legendClass = "pb-3 font-display text-lg font-bold text-ink";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs font-normal text-red-600">{message}</span>;
}

/**
 * "Check Availability & Get a Fixed Price": the survey booking form with a live quote preview.
 * Posts to /api/booking, which creates the lead in the CRM and emails the quote and payment link.
 */
export default function SurveyBookingForm({
  level,
  formName = "Survey booking form",
  onClose,
  className,
  initialBedrooms = "",
}: {
  level: SurveyLevel;
  /** Pre-selects the property size, e.g. when opened from the hero price card. */
  initialBedrooms?: string;
  /** Recorded with the lead's attribution so the CRM shows which form it came from. */
  formName?: string;
  /** When set (e.g. inside a dialog), the success panel offers a Close button. */
  onClose?: () => void;
  className?: string;
}) {
  const formId = useId();
  const [submitError, setSubmitError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onTouched",
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobAddress: "",
      jobTown: "",
      jobPostcode: "",
      propertyType: "",
      propertyValue: "",
      bedrooms: initialBedrooms,
      helpWith: "",
      surveyType: `level-${level}`,
      express: false,
    },
  });

  const bedrooms = useWatch({ control, name: "bedrooms" });
  const surveyType = useWatch({ control, name: "surveyType" });
  const express = useWatch({ control, name: "express" });
  const postcode = useWatch({ control, name: "jobPostcode" });

  const selectedLevel = levelFromSurveyType(surveyType);
  const basePrice = surveyPrice(selectedLevel, bedrooms);
  const expressFee = express ? EXPRESS_FEE : 0;
  const totalPrice = basePrice + expressFee;

  // The page's own level comes first in the list, as in the design.
  const levelOrder = [level, ...([1, 2, 3] as SurveyLevel[]).filter((l) => l !== level)];

  const onSubmit = async ({ express: isExpress, ...values }: FormValues) => {
    setSubmitError(false);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          expressReportDelivery: isExpress ? "yes" : "no",
          surveyingFees: totalPrice,
          isExpressTurnaround: isExpress,
          attribution: getAttribution(formName),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      clearAttribution();
      setSubmitted(true);
    } catch {
      setSubmitError(true);
    }
  };

  if (submitted) {
    return (
      <div
        role="status"
        className={cn(
          "flex flex-col items-center gap-4 rounded-[22px] border border-line bg-white px-6 py-14 text-center shadow-card",
          className,
        )}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-tint text-teal">
          <CheckCircle2 aria-hidden="true" className="h-8 w-8" />
        </span>
        <h3 className="text-[26px] font-extrabold leading-[1.15]">Secure your booking</h3>
        <p className="max-w-[460px] text-base text-body">
          Your quotation and payment details have been sent to your email. Complete payment to confirm your survey and
          secure your inspection slot.
        </p>
        <p className="text-sm italic text-muted-ink">Booking is only confirmed once payment is received.</p>
        <p className="text-sm text-body">
          Questions? Call{" "}
          <a href={PHONE_HREF} className="font-bold text-teal no-underline hover:text-teal-dark">
            {PHONE}
          </a>
        </p>
        <button
          type="button"
          onClick={() => {
            if (onClose) {
              onClose();
            } else {
              reset();
              setSubmitted(false);
            }
          }}
          className="mt-2 min-h-12 cursor-pointer rounded-xl border-0 bg-teal px-7 py-3 text-base font-bold text-white hover:bg-teal-dark"
        >
          {onClose ? "Close" : "Back to the form"}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10", className)}>
      <form
        id={formId}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-[26px] rounded-[22px] border border-line bg-white p-5 shadow-card sm:p-8"
      >
        <fieldset className="m-0 flex min-w-0 flex-col gap-3.5 border-0 p-0">
          <legend className={legendClass}>Your Details</legend>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              First Name
              <input type="text" autoComplete="given-name" className={fieldClass} {...register("firstName")} />
              <FieldError message={errors.firstName?.message} />
            </label>
            <label className={labelClass}>
              Last Name
              <input type="text" autoComplete="family-name" className={fieldClass} {...register("lastName")} />
              <FieldError message={errors.lastName?.message} />
            </label>
            <label className={labelClass}>
              Email
              <input type="email" autoComplete="email" className={fieldClass} {...register("email")} />
              <FieldError message={errors.email?.message} />
            </label>
            <label className={labelClass}>
              Phone
              <input type="tel" autoComplete="tel" className={fieldClass} {...register("phone")} />
              <FieldError message={errors.phone?.message} />
            </label>
          </div>
        </fieldset>

        <fieldset className="m-0 flex min-w-0 flex-col gap-3.5 border-0 p-0">
          <legend className={legendClass}>Property Location</legend>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className={cn(labelClass, "sm:col-span-2")}>
              Street Address
              <input type="text" autoComplete="street-address" className={fieldClass} {...register("jobAddress")} />
              <FieldError message={errors.jobAddress?.message} />
            </label>
            <label className={labelClass}>
              Town / City
              <input type="text" autoComplete="address-level2" className={fieldClass} {...register("jobTown")} />
              <FieldError message={errors.jobTown?.message} />
            </label>
            <label className={labelClass}>
              Postcode
              <input type="text" autoComplete="postal-code" className={fieldClass} {...register("jobPostcode")} />
              <FieldError message={errors.jobPostcode?.message} />
              {postcode.trim() && !isLikelyUkPostcode(postcode) && (
                <span role="alert" className="text-xs font-normal text-amber-700">
                  {UK_POSTCODE_HINT}
                </span>
              )}
            </label>
          </div>
        </fieldset>

        <fieldset className="m-0 flex min-w-0 flex-col gap-3.5 border-0 p-0">
          <legend className={legendClass}>Property Details</legend>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              Property Type
              <select className={fieldClass} {...register("propertyType")}>
                <option value="">Select type</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <FieldError message={errors.propertyType?.message} />
            </label>
            <label className={labelClass}>
              Bedrooms
              <select className={fieldClass} {...register("bedrooms")}>
                <option value="">Select</option>
                {BEDROOM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.bedrooms?.message} />
            </label>
            <label className={cn(labelClass, "sm:col-span-2")}>
              Approximate Property Value
              <input type="text" inputMode="numeric" className={fieldClass} {...register("propertyValue")} />
              <FieldError message={errors.propertyValue?.message} />
            </label>
          </div>
        </fieldset>

        <fieldset className="m-0 flex min-w-0 flex-col gap-3.5 border-0 p-0">
          <legend className={legendClass}>Survey Details</legend>
          <div className="grid gap-3.5">
            <label className={labelClass}>
              Survey type
              <select className={fieldClass} {...register("surveyType")}>
                {levelOrder.map((l) => (
                  <option key={l} value={`level-${l}`}>
                    {SURVEY_LABELS[l]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-[15px] font-semibold text-ink">
              <input type="checkbox" className="m-0 h-[18px] w-[18px] accent-teal" {...register("express")} />
              <span>
                Express Report Delivery (48 hours){" "}
                <span className="font-normal text-muted-ink">+{formatPounds(EXPRESS_FEE)}</span>
              </span>
            </label>
            <label className={labelClass}>
              <span>
                Survey requirements <span className="font-normal text-muted-ink">(optional)</span>
              </span>
              <textarea rows={3} className={cn(fieldClass, "resize-y")} {...register("helpWith")} />
            </label>
          </div>
        </fieldset>
      </form>

      <div className={cn("flex flex-col gap-[18px] lg:sticky", onClose ? "lg:top-0" : "lg:top-24")}>
        <div aria-live="polite" className="flex flex-col gap-3.5 rounded-[22px] bg-navy p-7 text-white">
          <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-[#9FE0D3]">Quote preview</span>
          <b className="font-display text-[22px] leading-[1.25]">{SURVEY_LABELS[selectedLevel]}</b>
          <div className="flex justify-between gap-4 border-t border-[#2E4166] pt-3 text-[15px] text-navy-text">
            <span>Survey price{bedrooms ? ` (${bedrooms})` : ""}</span>
            <span>{formatPounds(basePrice)}</span>
          </div>
          {expressFee > 0 && (
            <div className="flex justify-between gap-4 text-[15px] text-navy-text">
              <span>Express Report Delivery (48 hours)</span>
              <span>{formatPounds(expressFee)}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-4 border-t border-[#2E4166] pt-3">
            <span className="text-[15px] text-navy-text">Total (incl. VAT)</span>
            <span className="font-display text-[30px] font-extrabold">{formatPounds(totalPrice)}</span>
          </div>
          {!bedrooms && <span className="text-[13px] text-[#9FB0C8]">Select bedrooms to see your exact price</span>}
        </div>

        <div className="flex flex-col gap-4 rounded-[22px] border border-line bg-white p-7">
          <b className="font-display text-xl leading-[1.25]">What happens next</b>
          <ol className="m-0 flex list-none flex-col gap-4 p-0">
            {[
              { title: "Receive your quote", text: "sent to your email instantly" },
              { title: "Secure your booking", text: "complete payment to confirm your slot" },
              { title: "Inspection arranged", text: "we coordinate access and confirm your date" },
              {
                title: "Receive your report",
                text: express
                  ? "delivered within 48 hours of the inspection"
                  : `delivered within ${REPORT_TURNAROUND[selectedLevel]} of the inspection`,
              },
            ].map((step, i) => (
              <li key={step.title} className="flex items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-navy text-sm font-extrabold text-white"
                >
                  {i + 1}
                </span>
                <span className="flex flex-col gap-0.5 text-[15px]">
                  <b>{step.title}</b>
                  <span className="text-body">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <span className="border-t border-line pt-3.5 text-sm text-muted-ink">
            Payment is required to secure your booking.
          </span>
          {submitError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Something went wrong. Please try again or call us on {PHONE}.
            </p>
          )}
          <button
            type="submit"
            form={formId}
            disabled={isSubmitting}
            className="min-h-14 cursor-pointer rounded-xl border-0 bg-teal p-4 text-[17px] font-bold text-white hover:bg-teal-dark disabled:opacity-60"
          >
            {isSubmitting ? "Sending…" : "Book Survey"}
          </button>
        </div>
      </div>
    </div>
  );
}
