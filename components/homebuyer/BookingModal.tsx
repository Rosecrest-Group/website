"use client";

import React, { useState } from "react";
import {
  X,
  MapPin,
  Home,
  Bed,
  Clock,
  CheckCircle,
  Circle,
  PoundSterling,
} from "lucide-react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sourceSans } from "@/lib/fonts";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyLevel?: 1 | 2 | 3;
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

const LEVEL_1_PRICES: Record<string, number> = {
  Studio: 275,
  "1 Bedroom": 300,
  "2 Bedroom": 350,
  "3 Bedroom": 400,
  "4 Bedroom": 450,
  "5 Bedroom": 500,
  "6 Bedroom": 550,
  "7 Bedroom": 600,
  "8 Bedroom": 650,
  "9 Bedroom": 700,
  "10+ Bedroom": 750,
};

const LEVEL_2_PRICES: Record<string, number> = {
  Studio: 290,
  "1 Bedroom": 320,
  "2 Bedroom": 370,
  "3 Bedroom": 395,
  "4 Bedroom": 435,
  "5 Bedroom": 470,
  "6 Bedroom": 500,
  "7 Bedroom": 550,
  "8 Bedroom": 600,
  "9 Bedroom": 650,
  "10+ Bedroom": 700,
};

const LEVEL_3_PRICES: Record<string, number> = {
  Studio: 490,
  "1 Bedroom": 545,
  "2 Bedroom": 595,
  "3 Bedroom": 620,
  "4 Bedroom": 660,
  "5 Bedroom": 695,
  "6 Bedroom": 725,
  "7 Bedroom": 775,
  "8 Bedroom": 825,
  "9 Bedroom": 875,
  "10+ Bedroom": 925,
};

function getPrice(surveyType: string, bedrooms: string): number {
  const prices =
    surveyType === "level-3"
      ? LEVEL_3_PRICES
      : surveyType === "level-1"
        ? LEVEL_1_PRICES
        : LEVEL_2_PRICES;
  return prices[bedrooms] ?? prices["1 Bedroom"];
}

const SURVEY_LABELS: Record<string, string> = {
  "level-1": "Level 1 — Home Conditions Survey",
  "level-2": "Level 2 — Homebuyer Survey",
  "level-3": "Level 3 — Building Survey",
};

// ─── Schema ──────────────────────────────────────────────────────────────────

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(1, "Phone is required"),
  jobAddress: z.string().min(1, "Address is required"),
  jobTown: z.string().min(1, "Town is required"),
  jobPostcode: z.string().min(1, "Postcode is required"),
  propertyType: z.string().min(1, "Please select a property type"),
  propertyValue: z.string().min(1, "Please enter property value"),
  bedrooms: z.string().min(1, "Please select number of bedrooms"),
  timeline: z.string().min(1, "Please select a timeline"),
  helpWith: z.string().optional(),
  surveyType: z.string().min(1, "Please select survey type"),
});

// ─── Component ───────────────────────────────────────────────────────────────

const BookingModal = ({
  isOpen,
  onClose,
  surveyLevel = 2,
}: BookingModalProps) => {
  const defaultSurveyType = `level-${surveyLevel}`;
  const [submitError, setSubmitError] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<z.infer<typeof formSchema>>({
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
      bedrooms: "",
      surveyType: defaultSurveyType,
      timeline: "",
      helpWith: "",
    },
  });

  const selectedBedrooms = useWatch({
    control,
    name: "bedrooms",
    defaultValue: "",
  });
  const selectedSurveyType = useWatch({
    control,
    name: "surveyType",
    defaultValue: defaultSurveyType,
  });

  const activeSurveyTitle =
    SURVEY_LABELS[selectedSurveyType] ?? SURVEY_LABELS[defaultSurveyType];
  const totalPrice = selectedBedrooms
    ? getPrice(selectedSurveyType, selectedBedrooms)
    : getPrice(defaultSurveyType, "1 Bedroom");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitError(false);
    try {
      const valuesWithPrice = { ...values, surveyingFees: totalPrice };
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valuesWithPrice),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setSubmitError(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-4xl shadow-2xl overflow-hidden">
        {/* Header */}
        {isSubmitSuccessful ? (
          <div></div>
        ) : (
          <div className="flex items-center justify-between px-8 pt-7 pb-5 shrink-0">
            <h2 className="text-xl font-bold text-[#101828]">
              Check Availability & Get a Fixed Price
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto px-8 pb-2 flex-1">
          {isSubmitSuccessful ? (
            <div className="flex flex-col items-center text-center py-16 gap-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-[#101828]">
                Secure your booking
              </h3>
              <p
                className={`${sourceSans.className} text-[#4A5565] text-sm lg:text-base max-w-sm`}
              >
                Your quotation and payment details have been seent to your
                email. Complete payment to confirm your survey and secure your
                inspection slot
                <br/>
                <br/>
                <span className="text-xs lg:text-sm italic">Booking is only confirmed once payment is received</span>
              </p>
              <Button
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="mt-4 rounded-full px-8 bg-[#262A6F] text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* LEFT: Form */}
              <div className="space-y-5">
                <div className="bg-[#EFF6FF] rounded-xl p-3.5 flex items-start gap-3">
                  <div className="h-5 w-5 border-2 border-blue-600 rounded-full grid place-items-center shrink-0 mt-0.5">
                    <Circle className="w-2 h-2 text-blue-600 fill-blue-600" />
                  </div>
                  <p
                    className={`text-sm text-[#364153] ${sourceSans.className}`}
                  >
                    Provide a few details and we&apos;ll instantly show your
                    survey price. Takes less than 60 seconds.
                  </p>
                </div>

                <form
                  id="booking-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Contact */}
                  <p className="text-xs font-semibold text-[#6A7282] uppercase tracking-wide">
                    Your Details
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        First Name
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
                      <Label className="text-sm font-medium text-gray-700">
                        Last Name
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

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <Input
                        type="email"
                        className="h-11 rounded-xl border-[#E5E7EB] text-sm"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        Phone
                      </Label>
                      <Input
                        type="tel"
                        className="h-11 rounded-xl border-[#E5E7EB] text-sm"
                        {...register("phone")}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Property Location */}
                  <p className="text-xs font-semibold text-[#6A7282] uppercase tracking-wide pt-2">
                    Property Location
                  </p>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Street Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="12 Example Street"
                        className="pl-9 h-11 rounded-xl border-[#E5E7EB] text-sm"
                        {...register("jobAddress")}
                      />
                    </div>
                    {errors.jobAddress && (
                      <p className="text-xs text-red-500">
                        {errors.jobAddress.message}
                      </p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        Town / City
                      </Label>
                      <Input
                        placeholder="London"
                        className="h-11 rounded-xl border-[#E5E7EB] text-sm"
                        {...register("jobTown")}
                      />
                      {errors.jobTown && (
                        <p className="text-xs text-red-500">
                          {errors.jobTown.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        Postcode
                      </Label>
                      <Input
                        placeholder="SW1A 1AA"
                        className="h-11 rounded-xl border-[#E5E7EB] text-sm"
                        {...register("jobPostcode")}
                      />
                      {errors.jobPostcode && (
                        <p className="text-xs text-red-500">
                          {errors.jobPostcode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Property Details */}
                  <p className="text-xs font-semibold text-[#6A7282] uppercase tracking-wide pt-2">
                    Property Details
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        Property Type
                      </Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                        <Controller
                          name="propertyType"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="pl-9 h-11 rounded-xl border-[#E5E7EB] w-full text-sm">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="House">House</SelectItem>
                                <SelectItem value="Flat">Flat</SelectItem>
                                <SelectItem value="Bungalow">
                                  Bungalow
                                </SelectItem>
                                <SelectItem value="Maisonette">
                                  Maisonette
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      {errors.propertyType && (
                        <p className="text-xs text-red-500">
                          {errors.propertyType.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-gray-700">
                        Bedrooms
                      </Label>
                      <div className="relative">
                        <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                        <Controller
                          name="bedrooms"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="pl-9 h-11 rounded-xl border-[#E5E7EB] w-full text-sm">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Studio">Studio</SelectItem>
                                <SelectItem value="1 Bedroom">1</SelectItem>
                                <SelectItem value="2 Bedroom">2</SelectItem>
                                <SelectItem value="3 Bedroom">3</SelectItem>
                                <SelectItem value="4 Bedroom">4</SelectItem>
                                <SelectItem value="5 Bedroom">5</SelectItem>
                                <SelectItem value="6 Bedroom">6</SelectItem>
                                <SelectItem value="7 Bedroom">7</SelectItem>
                                <SelectItem value="8 Bedroom">8</SelectItem>
                                <SelectItem value="9 Bedroom">9</SelectItem>
                                <SelectItem value="10+ Bedroom">10+</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      {errors.bedrooms && (
                        <p className="text-xs text-red-500">
                          {errors.bedrooms.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Approximate Property Value
                    </Label>
                    <div className="relative">
                      <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="e.g. 350000"
                        type="number"
                        min="0"
                        className="pl-9 h-11 rounded-xl border-[#E5E7EB] text-sm"
                        {...register("propertyValue")}
                      />
                    </div>
                    {errors.propertyValue && (
                      <p className="text-xs text-red-500">
                        {errors.propertyValue.message}
                      </p>
                    )}
                  </div>

                  {/* Survey Details */}
                  <p className="text-xs font-semibold text-[#6A7282] uppercase tracking-wide pt-2">
                    Survey Details
                  </p>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Survey type
                    </Label>
                    <Controller
                      name="surveyType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-[#E5E7EB] w-full text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="level-1">
                              Level 1 — Home Conditions Survey
                            </SelectItem>
                            <SelectItem value="level-2">
                              Level 2 — Homebuyer Survey
                            </SelectItem>
                            <SelectItem value="level-3">
                              Level 3 — Building Survey
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.surveyType && (
                      <p className="text-xs text-red-500">
                        {errors.surveyType.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Timeline
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                      <Controller
                        name="timeline"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="pl-9 h-11 rounded-xl border-[#E5E7EB] w-full text-sm">
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Urgent (1-2 days)">
                                Urgent (1–2 days)
                              </SelectItem>
                              <SelectItem value="Within 1 week">
                                Within a week
                              </SelectItem>
                              <SelectItem value="Flexible">Flexible</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    {errors.timeline && (
                      <p className="text-xs text-red-500">
                        {errors.timeline.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Survey requirements{" "}
                      <span className="text-[#9CA3AF]">(optional)</span>
                    </Label>
                    <Input
                      placeholder="e.g. Structural survey to evaluate property condition"
                      className="h-11 rounded-xl border-[#E5E7EB] text-sm"
                      {...register("helpWith")}
                    />
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                      Something went wrong. Please try again or call us
                      directly.
                    </div>
                  )}
                </form>
              </div>

              {/* RIGHT: Quote preview */}
              <div className="border border-[#E5E7EB] rounded-2xl p-5 h-fit sticky top-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#00C950]" />
                  <span
                    className={`text-xs font-medium text-[#6A7282] ${sourceSans.className}`}
                  >
                    Quote preview
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#101828] mb-5">
                  {activeSurveyTitle}
                </h3>
                <div className={`space-y-3 ${sourceSans.className}`}>
                  <div className="flex items-center justify-between text-sm text-[#4A5565]">
                    <span>
                      Survey price{" "}
                      {selectedBedrooms ? `(${selectedBedrooms})` : ""}
                    </span>
                    <span className="font-medium">£{totalPrice}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#101828]">
                        Total (incl. VAT)
                      </span>
                      <span className="text-xl font-bold text-[#101828]">
                        £{totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
                {!selectedBedrooms && (
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    Select bedrooms to see your exact price
                  </p>
                )}
                <div className="bg-[#EFF6FF] rounded-xl p-4 mt-5">
                  <h4 className="text-sm font-bold text-[#101828] mb-3">
                    What happens next
                  </h4>
                  <ul className={`space-y-2.5 ${sourceSans.className}`}>
                    {[
                      "Receive your quote sent to your email instantly",
                      "Secure your booking - complete payment to confirm your slot",
                      "Inspection arranged - we coordinate access and confirm your date",
                      "Receive your report - delivered within the stated timeframe"
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="bg-[#262A6F] text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs font-semibold">
                          {i + 1}
                        </div>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#6A7282]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Payment is required to secure your booking.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSubmitSuccessful && (
          <div className="flex items-center justify-between px-8 py-5 border-t border-[#F3F4F6] shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className={`text-sm text-[#4A5565] hover:text-[#101828] transition-colors ${sourceSans.className}`}
            >
              Cancel
            </button>
            <Button
              type="submit"
              form="booking-form"
              disabled={isSubmitting}
              className="h-11 bg-[#262A6F] hover:bg-[#262A6F]/90 text-white rounded-full px-6 text-sm font-semibold gap-2 disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Book Survey"}
              <CheckCircle className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
