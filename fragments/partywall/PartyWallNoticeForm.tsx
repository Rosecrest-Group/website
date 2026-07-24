"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sourceSans } from "@/lib/fonts";
import { PARTY_WALL_CONSENT_TEXT } from "@/lib/party-wall/consent";
import {
  ADJOINING_OWNER_TYPES,
  BOUNDARY_WALL_OPTIONS,
  defaultPartyWallFormValues,
  EXCAVATION_OPTIONS,
  getEffectivePropertyCount,
  PARTY_STRUCTURE_ACTIVITIES,
  type PartyWallFormValues,
  step1Schema,
  step2Schema,
  step4Schema,
  validateStep3,
  WALL_TYPE_OPTIONS,
} from "@/lib/party-wall/schema";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function RequiredTag() {
  return <span className="text-[#C45C26] font-normal">(Required)</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-600 mt-1">{message}</p>;
}

function ProgressSteps({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
            step === n
              ? "border-[#262A6F] bg-[#262A6F] text-white"
              : step > n
                ? "border-[#262A6F] bg-white text-[#262A6F]"
                : "border-[#D1D5DB] bg-white text-[#9CA3AF]"
          }`}
        >
          {n}
        </div>
      ))}
    </div>
  );
}

function RadioOption({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-1 h-4 w-4 accent-[#262A6F]"
      />
      <span className={`${sourceSans.className} text-[#101828] text-sm leading-relaxed`}>
        {label}
      </span>
    </label>
  );
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

export default function PartyWallNoticeForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});
  const [landRegistryFile, setLandRegistryFile] = useState<File | null>(null);
  const [technicalDrawingsFile, setTechnicalDrawingsFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm<PartyWallFormValues>({
    defaultValues: defaultPartyWallFormValues,
    mode: "onTouched",
  });

  const values = watch();
  const propertyCount = getEffectivePropertyCount(values);

  const showBoundaryFields = values.buildNewWall === "yes";
  const showExcavationFields = values.excavation !== "no" && values.excavation !== "";
  const showPartyStructureFields = values.workOnPartyStructure === "yes";

  const stepTitle = useMemo(() => {
    switch (step) {
      case 1:
        return "Adjoining properties";
      case 2:
        return "Proposed works";
      case 3:
        return "Work details & documents";
      default:
        return "Your details & consent";
    }
  }, [step]);

  async function goNext() {
    if (step === 1) {
      const parsed = step1Schema.safeParse(getValues());
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const path = issue.path.join(".") as keyof PartyWallFormValues;
          setError(path as never, { message: issue.message });
        });
        return;
      }
    }

    if (step === 2) {
      const parsed = step2Schema.safeParse(getValues());
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          const path = issue.path.join(".") as keyof PartyWallFormValues;
          setError(path as never, { message: issue.message });
        });
        return;
      }
    }

    if (step === 3) {
      const current = getValues();
      const nextErrors = validateStep3({
        ...current,
        landRegistryFileName: landRegistryFile?.name ?? "",
        technicalDrawingsFileName: technicalDrawingsFile?.name ?? "",
      });
      setStep3Errors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
    }

    setStep((s) => Math.min(4, s + 1));
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  function handlePdfChange(
    file: File | null,
    kind: "landRegistry" | "technicalDrawings"
  ) {
    if (!file) {
      if (kind === "landRegistry") setLandRegistryFile(null);
      else setTechnicalDrawingsFile(null);
      return;
    }
    if (file.type !== "application/pdf") {
      setStep3Errors((prev) => ({
        ...prev,
        [kind === "landRegistry" ? "landRegistryFileName" : "technicalDrawingsFileName"]:
          "Document must be a PDF",
      }));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setStep3Errors((prev) => ({
        ...prev,
        [kind === "landRegistry" ? "landRegistryFileName" : "technicalDrawingsFileName"]:
          "File must be 10 MB or smaller",
      }));
      return;
    }
    setStep3Errors((prev) => {
      const next = { ...prev };
      delete next[kind === "landRegistry" ? "landRegistryFileName" : "technicalDrawingsFileName"];
      return next;
    });
    if (kind === "landRegistry") setLandRegistryFile(file);
    else setTechnicalDrawingsFile(file);
  }

  const onSubmit = async (formValues: PartyWallFormValues) => {
    const parsed = step4Schema.safeParse(formValues);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const path = issue.path.join(".") as keyof PartyWallFormValues;
        setError(path as never, { message: issue.message });
      });
      return;
    }

    if (!landRegistryFile || !technicalDrawingsFile) {
      setStep3Errors({
        landRegistryFileName: !landRegistryFile ? "Land Registry document is required" : "",
        technicalDrawingsFileName: !technicalDrawingsFile
          ? "Technical drawings document is required"
          : "",
      });
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(false);

    try {
      const [landRegistryBase64, technicalDrawingsBase64] = await Promise.all([
        fileToBase64(landRegistryFile),
        fileToBase64(technicalDrawingsFile),
      ]);

      const res = await fetch("/api/party-wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formValues,
          landRegistryFileName: landRegistryFile.name,
          technicalDrawingsFileName: technicalDrawingsFile.name,
          landRegistryBase64,
          technicalDrawingsBase64,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      router.push("/thank-you");
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <ProgressSteps step={step} />

      <div>
        <h2 className="text-xl font-bold text-[#101828] mb-1">{stepTitle}</h2>
        <p className={`${sourceSans.className} text-sm text-[#6A7282]`}>
          Step {step} of 4
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold text-[#101828]">
              How many adjoining properties are associated with the project?{" "}
              <RequiredTag />
            </Label>
            <p className={`${sourceSans.className} text-sm text-[#6A7282]`}>
              Select the number of adjoining properties you will be notifying.
            </p>
            <Select
              value={values.adjoiningPropertyCount}
              onValueChange={(v) =>
                setValue("adjoiningPropertyCount", v as PartyWallFormValues["adjoiningPropertyCount"])
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {values.adjoiningPropertyCount === "other" && (
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#101828]">
                Number of adjoining properties <RequiredTag />
              </Label>
              <Input
                type="number"
                min={1}
                max={4}
                {...register("customPropertyCount")}
                className="bg-white"
              />
              <FieldError message={errors.customPropertyCount?.message} />
            </div>
          )}

          {Array.from({ length: propertyCount }).map((_, i) => (
            <div key={`address-${i}`} className="space-y-2">
              <Label className="text-base font-semibold text-[#101828]">
                Property {i + 1} Address <RequiredTag />
              </Label>
              <Input
                {...register(`propertyAddresses.${i}`)}
                className="bg-white"
              />
              <FieldError message={errors.propertyAddresses?.[i]?.message} />
            </div>
          ))}

          <div className="space-y-2">
            <Label className="text-base font-semibold text-[#101828]">
              List the full names of all legal owners. <RequiredTag />
            </Label>
            <p className={`${sourceSans.className} text-sm text-[#6A7282]`}>
              This should include the names of all the owners of each adjoining property.
            </p>
            <Input {...register("legalOwnersList")} className="bg-white" />
            <FieldError message={errors.legalOwnersList?.message} />
          </div>

          {Array.from({ length: propertyCount }).map((_, i) => (
            <div key={`owner-${i}`} className="space-y-2">
              <Label className="text-base font-semibold text-[#101828]">
                Property {i + 1} Owner(s) Full Name(s) <RequiredTag />
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className={`${sourceSans.className} text-xs text-[#6A7282]`}>First</span>
                  <Input
                    {...register(`propertyOwners.${i}.firstName`)}
                    className="bg-white"
                  />
                  <FieldError message={errors.propertyOwners?.[i]?.firstName?.message} />
                </div>
                <div className="space-y-1">
                  <span className={`${sourceSans.className} text-xs text-[#6A7282]`}>Last</span>
                  <Input
                    {...register(`propertyOwners.${i}.lastName`)}
                    className="bg-white"
                  />
                  <FieldError message={errors.propertyOwners?.[i]?.lastName?.message} />
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-3">
            <Label className="text-base font-semibold text-[#101828]">
              Regarding the adjoining owner stated above, which of the following is true{" "}
              <RequiredTag />
            </Label>
            {ADJOINING_OWNER_TYPES.map((opt) => (
              <RadioOption
                key={opt.value}
                name="adjoiningOwnerType"
                value={opt.value}
                label={opt.label}
                checked={values.adjoiningOwnerType === opt.value}
                onChange={(v) =>
                  setValue("adjoiningOwnerType", v as PartyWallFormValues["adjoiningOwnerType"], {
                    shouldValidate: true,
                  })
                }
              />
            ))}
            <FieldError message={errors.adjoiningOwnerType?.message} />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-[#101828]">
              Do they live at the adjoining property? <RequiredTag />
            </Label>
            {(["yes", "no"] as const).map((opt) => (
              <RadioOption
                key={opt}
                name="livesAtAdjoiningProperty"
                value={opt}
                label={opt === "yes" ? "Yes" : "No"}
                checked={values.livesAtAdjoiningProperty === opt}
                onChange={(v) =>
                  setValue("livesAtAdjoiningProperty", v as "yes" | "no", { shouldValidate: true })
                }
              />
            ))}
            <FieldError message={errors.livesAtAdjoiningProperty?.message} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-[#101828]">
              Do you intend to carry out work directly to a party structure, such as inserting
              beams, removing a chimney breast, underpinning, or raising a wall?{" "}
              <RequiredTag />
            </Label>
            {(["yes", "no"] as const).map((opt) => (
              <RadioOption
                key={opt}
                name="workOnPartyStructure"
                value={opt}
                label={opt === "yes" ? "Yes" : "No"}
                checked={values.workOnPartyStructure === opt}
                onChange={(v) =>
                  setValue("workOnPartyStructure", v as "yes" | "no", { shouldValidate: true })
                }
              />
            ))}
            <FieldError message={errors.workOnPartyStructure?.message} />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-[#101828]">
              Do you intend to build a new wall on or immediately adjacent to the boundary line
              of the adjoining property? <RequiredTag />
            </Label>
            {(["yes", "no"] as const).map((opt) => (
              <RadioOption
                key={opt}
                name="buildNewWall"
                value={opt}
                label={opt === "yes" ? "Yes" : "No"}
                checked={values.buildNewWall === opt}
                onChange={(v) =>
                  setValue("buildNewWall", v as "yes" | "no", { shouldValidate: true })
                }
              />
            ))}
            <FieldError message={errors.buildNewWall?.message} />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-[#101828]">
              Do you intend to excavate within 3m / 6m of an adjoining building or structure?{" "}
              <RequiredTag />
            </Label>
            {EXCAVATION_OPTIONS.map((opt) => (
              <RadioOption
                key={opt.value}
                name="excavation"
                value={opt.value}
                label={opt.label}
                checked={values.excavation === opt.value}
                onChange={(v) =>
                  setValue("excavation", v as PartyWallFormValues["excavation"], {
                    shouldValidate: true,
                  })
                }
              />
            ))}
            <FieldError message={errors.excavation?.message} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8">
          {showBoundaryFields && (
            <div className="space-y-6 border-t border-[#E5E7EB] pt-6">
              <h3 className="text-lg font-semibold text-[#101828]">
                About the proposed works on the boundary line
              </h3>
              <div className="space-y-3">
                <Label className="text-base font-semibold text-[#101828]">
                  Regarding the new wall at the boundary line, which of the following is true:{" "}
                  <RequiredTag />
                </Label>
                {BOUNDARY_WALL_OPTIONS.map((opt) => (
                  <RadioOption
                    key={opt.value}
                    name="boundaryWallType"
                    value={opt.value}
                    label={opt.label}
                    checked={values.boundaryWallType === opt.value}
                    onChange={(v) =>
                      setValue("boundaryWallType", v as PartyWallFormValues["boundaryWallType"])
                    }
                  />
                ))}
                <FieldError message={step3Errors.boundaryWallType} />
              </div>
              <div className="space-y-3">
                <Label className="text-base font-semibold text-[#101828]">
                  Will the new wall be a boundary wall (party fence wall), or will it form part
                  of an enclosure, such as an extension (party wall)? <RequiredTag />
                </Label>
                {WALL_TYPE_OPTIONS.map((opt) => (
                  <RadioOption
                    key={opt.value}
                    name="wallType"
                    value={opt.value}
                    label={opt.label}
                    checked={values.wallType === opt.value}
                    onChange={(v) =>
                      setValue("wallType", v as PartyWallFormValues["wallType"])
                    }
                  />
                ))}
                <FieldError message={step3Errors.wallType} />
              </div>
              <div className="space-y-3">
                <Label className="text-base font-semibold text-[#101828]">
                  Is it intended to place projecting footings under the land of the adjoining
                  property? <RequiredTag />
                </Label>
                {(["yes", "no"] as const).map((opt) => (
                  <RadioOption
                    key={opt}
                    name="projectingFootings"
                    value={opt}
                    label={opt === "yes" ? "Yes" : "No"}
                    checked={values.projectingFootings === opt}
                    onChange={(v) =>
                      setValue("projectingFootings", v as "yes" | "no")
                    }
                  />
                ))}
                <FieldError message={step3Errors.projectingFootings} />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold text-[#101828]">
                  Briefly describe the proposed works on the line of junction
                </Label>
                <Textarea
                  {...register("boundaryWorksDescription")}
                  rows={4}
                  className="bg-white"
                  placeholder="Briefly outline the wall to be built, and any pertinent details about it."
                />
              </div>
            </div>
          )}

          {showExcavationFields && (
            <div className="space-y-6 border-t border-[#E5E7EB] pt-6">
              <h3 className="text-lg font-semibold text-[#101828]">
                About your proposed excavations
              </h3>
              <div className="space-y-3">
                <Label className="text-base font-semibold text-[#101828]">
                  Do you intend to underpin, or otherwise strengthen, the adjoining property?{" "}
                  <RequiredTag />
                </Label>
                <p className={`${sourceSans.className} text-sm text-[#6A7282]`}>
                  If you intend on underpinning, or safeguarding, the structure / foundations of
                  adjoining property, select yes. Otherwise, choose no.
                </p>
                {(["yes", "no"] as const).map((opt) => (
                  <RadioOption
                    key={opt}
                    name="underpinAdjoining"
                    value={opt}
                    label={opt === "yes" ? "Yes" : "No"}
                    checked={values.underpinAdjoining === opt}
                    onChange={(v) =>
                      setValue("underpinAdjoining", v as "yes" | "no")
                    }
                  />
                ))}
                <FieldError message={step3Errors.underpinAdjoining} />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold text-[#101828]">
                  Briefly describe the proposed excavations
                </Label>
                <Textarea
                  {...register("excavationDescription")}
                  rows={4}
                  className="bg-white"
                  placeholder="Briefly describe the excavations, including where possible, the location, depth, and purpose."
                />
              </div>
            </div>
          )}

          {showPartyStructureFields && (
            <div className="space-y-6 border-t border-[#E5E7EB] pt-6">
              <h3 className="text-lg font-semibold text-[#101828]">
                About your works to the party structure
              </h3>
              <div className="space-y-3">
                <Label className="text-base font-semibold text-[#101828]">
                  Which of the following activities are proposed as part of the works?{" "}
                  <RequiredTag />
                </Label>
                <p className={`${sourceSans.className} text-sm text-[#6A7282]`}>
                  Select all that apply.
                </p>
                {PARTY_STRUCTURE_ACTIVITIES.map((activity) => (
                  <label key={activity} className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={values.partyStructureActivities.includes(activity)}
                      onCheckedChange={(checked) => {
                        const current = getValues("partyStructureActivities");
                        setValue(
                          "partyStructureActivities",
                          checked
                            ? [...current, activity]
                            : current.filter((a) => a !== activity)
                        );
                      }}
                    />
                    <span className={`${sourceSans.className} text-sm text-[#101828] leading-relaxed`}>
                      {activity}
                    </span>
                  </label>
                ))}
                <FieldError message={step3Errors.partyStructureActivities} />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold text-[#101828]">
                  Briefly describe the proposed works to the party structure
                </Label>
                <Textarea
                  {...register("partyStructureWorksDescription")}
                  rows={4}
                  className="bg-white"
                  placeholder="Include information about what works you intend to carry out."
                />
              </div>
            </div>
          )}

          <div className="space-y-6 border-t border-[#E5E7EB] pt-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-[#101828]">
                Do you already have a surveyor? <RequiredTag />
              </Label>
              <p className={`${sourceSans.className} text-sm text-[#6A7282]`}>
                Select &ldquo;No&rdquo; to use Rosecrest Party Wall Surveyors. Otherwise, select
                &ldquo;Yes&rdquo; if you already have a surveyor.
              </p>
              {(["yes", "no"] as const).map((opt) => (
                <RadioOption
                  key={opt}
                  name="hasSurveyor"
                  value={opt}
                  label={opt === "yes" ? "Yes" : "No"}
                  checked={values.hasSurveyor === opt}
                  onChange={(v) => setValue("hasSurveyor", v as "yes" | "no")}
                />
              ))}
              <FieldError message={step3Errors.hasSurveyor} />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#101828]">
                Date of service <RequiredTag />
              </Label>
              <p className={`${sourceSans.className} text-sm text-[#6A7282]`}>
                When do you intend on serving your party wall notice on your neighbour?
              </p>
              <Input type="date" {...register("dateOfService")} className="bg-white max-w-xs" />
              <FieldError message={step3Errors.dateOfService} />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#101828]">
                Upload your Land Registry document <RequiredTag />
              </Label>
              <p className={`${sourceSans.className} text-sm text-[#6A7282]`}>
                Document needs to be in PDF format. Max. file size: 10 MB.
              </p>
              <Input
                type="file"
                accept="application/pdf"
                className="bg-white"
                onChange={(e) => handlePdfChange(e.target.files?.[0] ?? null, "landRegistry")}
              />
              {landRegistryFile && (
                <p className={`${sourceSans.className} text-sm text-[#262A6F]`}>
                  Selected: {landRegistryFile.name}
                </p>
              )}
              <FieldError message={step3Errors.landRegistryFileName} />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#101828]">
                Upload your Technical Drawings document <RequiredTag />
              </Label>
              <p className={`${sourceSans.className} text-sm text-[#6A7282]`}>
                Document needs to be in PDF format. Max. file size: 10 MB.
              </p>
              <Input
                type="file"
                accept="application/pdf"
                className="bg-white"
                onChange={(e) =>
                  handlePdfChange(e.target.files?.[0] ?? null, "technicalDrawings")
                }
              />
              {technicalDrawingsFile && (
                <p className={`${sourceSans.className} text-sm text-[#262A6F]`}>
                  Selected: {technicalDrawingsFile.name}
                </p>
              )}
              <FieldError message={step3Errors.technicalDrawingsFileName} />
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold text-[#101828]">
              Enter your email address <RequiredTag />
            </Label>
            <p className={`${sourceSans.className} text-sm text-[#6A7282]`}>
              We need this in order to send you your notices when you submit the form.
            </p>
            <Input type="email" {...register("email")} className="bg-white" />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-[#101828]">
              Your name <RequiredTag />
            </Label>
            <Input {...register("fullName")} className="bg-white" />
            <FieldError message={errors.fullName?.message} />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold text-[#101828]">Phone (optional)</Label>
            <Input type="tel" {...register("phone")} className="bg-white" />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold text-[#101828]">
              Consent <RequiredTag />
            </Label>
            <div
              className={`${sourceSans.className} max-h-64 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#364153] whitespace-pre-line leading-relaxed`}
            >
              {PARTY_WALL_CONSENT_TEXT}
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={values.termsAccepted}
                onCheckedChange={(checked) =>
                  setValue("termsAccepted", checked === true, { shouldValidate: true })
                }
              />
              <span className={`${sourceSans.className} text-sm text-[#101828]`}>
                I agree to the terms.
              </span>
            </label>
            <FieldError message={errors.termsAccepted?.message} />
          </div>

          {submitError && (
            <p className="text-sm text-red-600">
              Something went wrong submitting your request. Please try again.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            className="rounded-full px-8 border-[#262A6F] text-[#262A6F]"
          >
            Back
          </Button>
        )}
        {step < 4 ? (
          <Button
            type="button"
            onClick={goNext}
            className="rounded-full px-10 bg-[#262A6F] hover:bg-[#1A1D4F] text-white uppercase tracking-wide"
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full px-10 bg-[#262A6F] hover:bg-[#1A1D4F] text-white uppercase tracking-wide"
          >
            {isSubmitting ? "Submitting…" : "Submit"}
          </Button>
        )}
      </div>
    </form>
  );
}
