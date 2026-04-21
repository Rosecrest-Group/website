"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sourceSans } from "@/lib/fonts";

// ─── Schema ──────────────────────────────────────────────────────────────────

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────

interface ContactFormProps {
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  prefillHelpWith?: string;
  /**
   * Called after a successful submission. If provided, this OVERRIDES the
   * default redirect-to-thank-you behaviour. Use for modals that need to
   * close themselves before navigating, etc.
   */
  onSuccess?: () => void;
  /**
   * Route to push to after a successful submission. Defaults to "/thank-you"
   * so SEO/PPC can fire conversion events on pageview. Set to `null` to
   * disable redirect entirely (e.g. for embedded test forms).
   */
  redirectTo?: string | null;
  compact?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

const ContactForm = ({
  title = "Free Quotation",
  subtitle,
  submitLabel = "Find Out For Free",
  prefillHelpWith,
  onSuccess,
  redirectTo = "/thank-you",
  compact = false,
}: ContactFormProps) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onTouched",
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: prefillHelpWith ?? "",
    },
  });

  const [submitError, setSubmitError] = useState(false);

  const onSubmit = async (values: FormValues) => {
    setSubmitError(false);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed");

      // If caller supplied onSuccess, let them handle everything
      // (e.g. close modal then redirect themselves).
      if (onSuccess) {
        onSuccess();
        return;
      }

      // Default behaviour: navigate to /thank-you so GA4 / Google Ads
      // can fire a conversion on the pageview.
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch {
      setSubmitError(true);
    }
  };

  const inner = (
    <>
      {/* Header */}
      {title && (
        <h2 className="text-xl lg:text-2xl font-bold text-[#101828] mb-1">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className={`${sourceSans.className} text-sm text-[#4A5565] mb-6`}>
          {subtitle}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First Name + Last Name — side by side */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#101828]">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-11 rounded-xl border-[#E5E7EB] text-sm"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#101828]">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-11 rounded-xl border-[#E5E7EB] text-sm"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email + Phone — side by side */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#101828]">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              className="h-11 rounded-xl border-[#E5E7EB] text-sm"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#101828]">Phone</Label>
            <Input
              type="tel"
              className="h-11 rounded-xl border-[#E5E7EB] text-sm"
              {...register("phone")}
            />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#101828]">
            Message <span className="text-red-500">*</span>
          </Label>
          <Textarea
            className="min-h-40 rounded-xl border-[#E5E7EB] text-sm resize-none"
            {...register("message")}
          />
          {errors.message && (
            <p className="text-xs text-red-500">{errors.message.message}</p>
          )}
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
            Something went wrong. Please try again or call us directly.
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 bg-[#262A6F] hover:bg-[#262A6F]/90 text-white rounded-full px-10 text-base font-semibold disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : submitLabel}
        </Button>
      </form>
    </>
  );

  if (compact) return <div>{inner}</div>;

  return <div className="bg-white rounded-4xl p-2 md:p-8 lg:p-10">{inner}</div>;
};

export default ContactForm;