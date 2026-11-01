"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type PathValue } from "react-hook-form";
import { clearAttribution, getAttribution } from "@/lib/attribution";
import { PARTY_WALL_CONSENT_TEXT } from "@/lib/party-wall/consent";
import {
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
import { fieldClass } from "@/components/site/CallbackForm";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const STEP_TITLES = ["Adjoining properties", "Proposed works", "Work details & documents", "Your details & consent"];

// Display wording for the owner-type answers; the submitted values are unchanged.
const OWNER_TYPES = [
  { value: "single", label: "They are a single individual" },
  { value: "couple", label: "They are a couple or joint owners" },
  { value: "company", label: "They are a public company or other body" },
] as const;

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

const inputClass = cn(fieldClass, "bg-white");
const groupClass = "flex flex-col gap-1.5 text-sm font-semibold text-ink";
const hintClass = "text-[13px] font-normal text-muted-ink";

function Required() {
  return <span className="font-semibold text-[#B42318]"> (Required)</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-[13px] font-normal text-red-600">{message}</span>;
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2.5" aria-label={`Step ${step} of 4`}>
      {[1, 2, 3, 4].map((n) => (
        <Fragment key={n}>
          {n > 1 && <span aria-hidden="true" className={cn("h-[3px] flex-1", n <= step ? "bg-teal" : "bg-line")} />}
          <span
            aria-current={n === step ? "step" : undefined}
            className={cn(
              "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold",
              n <= step ? "bg-teal text-white" : "bg-line text-muted-ink",
            )}
          >
            {n}
          </span>
        </Fragment>
      ))}
    </div>
  );
}

/** Pill-shaped radio group, the design's choice control. */
function PillRadios({
  name,
  legend,
  hint,
  options,
  value,
  onChange,
  error,
  stacked,
}: {
  name: string;
  legend: React.ReactNode;
  hint?: React.ReactNode;
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** Long labels read better as full-width rows. */
  stacked?: boolean;
}) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0 text-sm font-semibold text-ink">
      <legend className="mb-2 p-0">
        {legend}
        <Required />
      </legend>
      {hint && <span className={cn(hintClass, "-mt-1")}>{hint}</span>}
      <div className={cn("flex gap-2", stacked ? "flex-col" : "flex-wrap")}>
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer items-start gap-2 border px-4 py-2 font-medium leading-snug",
                stacked ? "rounded-xl" : "rounded-full",
                checked ? "border-teal bg-teal-tint" : "border-line-strong bg-white hover:border-teal",
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="m-0 mt-[3px] h-4 w-4 shrink-0 accent-teal"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[18px] rounded-2xl border border-line px-[22px] py-5">
      <h3 className="text-[17px] font-extrabold leading-[1.3]">{title}</h3>
      {children}
    </div>
  );
}

function PdfField({
  label,
  file,
  error,
  onChange,
}: {
  label: string;
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className={groupClass}>
      <span>
        {label}
        <Required />
      </span>
      <span className={hintClass}>Document needs to be in PDF format. Max. file size: 10 MB.</span>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className={cn(
          inputClass,
          "cursor-pointer p-2.5 text-[15px] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-teal-tint file:px-3 file:py-2 file:text-sm file:font-bold file:text-teal",
        )}
      />
      {file && <span className="text-[13px] font-normal text-teal">Selected: {file.name}</span>}
      <FieldError message={error} />
    </label>
  );
}

async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

/**
 * Four-step party wall notice generator. Posts the answers and both PDFs to
 * /api/party-wall, which prepares the notice and emails it to the applicant.
 */
export default function NoticeGeneratorForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});
  const [landRegistryFile, setLandRegistryFile] = useState<File | null>(null);
  const [technicalDrawingsFile, setTechnicalDrawingsFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm<PartyWallFormValues>({
    defaultValues: defaultPartyWallFormValues,
    mode: "onTouched",
  });

  // Every field has a default, so the watched values are always complete.
  const values = useWatch({ control }) as PartyWallFormValues;
  const propertyCount = getEffectivePropertyCount(values);

  const showBoundaryFields = values.buildNewWall === "yes";
  const showExcavationFields = values.excavation !== "no" && values.excavation !== "";
  const showPartyStructureFields = values.workOnPartyStructure === "yes";

  /** Set a radio-style value and clear any error left from the last "Next". */
  function choose<K extends keyof PartyWallFormValues>(key: K, value: PartyWallFormValues[K]) {
    setValue(key, value as PathValue<PartyWallFormValues, K>);
    clearErrors(key);
    setStep3Errors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function applyIssues(issues: { path: PropertyKey[]; message: string }[]) {
    issues.forEach((issue) => {
      setError(issue.path.join(".") as never, { message: issue.message });
    });
  }

  function scrollToTop() {
    document.getElementById("notice-generator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goNext() {
    if (step === 1) {
      const parsed = step1Schema.safeParse(getValues());
      if (!parsed.success) return applyIssues(parsed.error.issues);
    }
    if (step === 2) {
      const parsed = step2Schema.safeParse(getValues());
      if (!parsed.success) return applyIssues(parsed.error.issues);
    }
    if (step === 3) {
      const nextErrors = validateStep3({
        ...getValues(),
        landRegistryFileName: landRegistryFile?.name ?? "",
        technicalDrawingsFileName: technicalDrawingsFile?.name ?? "",
      });
      setStep3Errors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
    }
    setStep((s) => Math.min(4, s + 1));
    scrollToTop();
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
    scrollToTop();
  }

  function handlePdfChange(file: File | null, kind: "landRegistry" | "technicalDrawings") {
    const errorKey = kind === "landRegistry" ? "landRegistryFileName" : "technicalDrawingsFileName";
    const setFile = kind === "landRegistry" ? setLandRegistryFile : setTechnicalDrawingsFile;
    if (!file) {
      setFile(null);
      return;
    }
    if (file.type !== "application/pdf") {
      setStep3Errors((prev) => ({ ...prev, [errorKey]: "Document must be a PDF" }));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setStep3Errors((prev) => ({ ...prev, [errorKey]: "File must be 10 MB or smaller" }));
      return;
    }
    setStep3Errors((prev) => {
      const next = { ...prev };
      delete next[errorKey];
      return next;
    });
    setFile(file);
  }

  const onSubmit = async (formValues: PartyWallFormValues) => {
    const parsed = step4Schema.safeParse(formValues);
    if (!parsed.success) return applyIssues(parsed.error.issues);

    if (!landRegistryFile || !technicalDrawingsFile) {
      setStep3Errors({
        landRegistryFileName: !landRegistryFile ? "Land Registry document is required" : "",
        technicalDrawingsFileName: !technicalDrawingsFile ? "Technical drawings document is required" : "",
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
          attribution: getAttribution("Party wall notice generator"),
        }),
      });

      if (!res.ok) throw new Error("Failed");
      clearAttribution();
      router.push("/thank-you");
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id="notice-generator"
      aria-label="Party wall notice generator"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex w-full max-w-[820px] scroll-mt-24 flex-col gap-[22px] rounded-[22px] bg-white p-5 shadow-[0_24px_50px_-30px_rgba(15,30,56,0.4)] sm:p-9"
    >
      <Stepper step={step} />

      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[22px] font-extrabold leading-[1.2] sm:text-[26px]">{STEP_TITLES[step - 1]}</h2>
        <span className="text-sm font-bold text-muted-ink">Step {step} of 4</span>
      </div>

      {step === 1 && (
        <>
          <label className={groupClass}>
            <span>
              How many adjoining properties are associated with the project?
              <Required />
            </span>
            <select {...register("adjoiningPropertyCount")} className={cn(inputClass, "max-w-[240px] cursor-pointer")}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="other">Other</option>
            </select>
            <span className={hintClass}>Select the number of adjoining properties you will be notifying.</span>
          </label>

          {values.adjoiningPropertyCount === "other" && (
            <label className={groupClass}>
              <span>
                Number of adjoining properties
                <Required />
              </span>
              <input
                type="number"
                min={1}
                max={4}
                {...register("customPropertyCount")}
                className={cn(inputClass, "max-w-[240px]")}
              />
              <FieldError message={errors.customPropertyCount?.message} />
            </label>
          )}

          {Array.from({ length: propertyCount }).map((_, i) => (
            <fieldset
              key={i}
              className="m-0 flex min-w-0 flex-col gap-[18px] rounded-2xl border border-line px-4 pb-5 pt-3 sm:px-[22px]"
            >
              <legend className="px-2 font-display text-[17px] font-extrabold text-ink">
                Adjoining property {i + 1}
              </legend>
              <label className={groupClass}>
                <span>
                  Property {i + 1} Address
                  <Required />
                </span>
                <input type="text" autoComplete="off" {...register(`propertyAddresses.${i}`)} className={inputClass} />
                <FieldError message={errors.propertyAddresses?.[i]?.message} />
              </label>
              <div className={groupClass}>
                <span>
                  Property {i + 1} Owner(s) Full Name(s)
                  <Required />
                </span>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    <input
                      type="text"
                      autoComplete="off"
                      {...register(`propertyOwners.${i}.firstName`)}
                      className={inputClass}
                    />
                    <span className={hintClass}>First</span>
                    <FieldError message={errors.propertyOwners?.[i]?.firstName?.message} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <input
                      type="text"
                      autoComplete="off"
                      {...register(`propertyOwners.${i}.lastName`)}
                      className={inputClass}
                    />
                    <span className={hintClass}>Last</span>
                    <FieldError message={errors.propertyOwners?.[i]?.lastName?.message} />
                  </label>
                </div>
              </div>
            </fieldset>
          ))}

          <label className={groupClass}>
            <span>
              List the full names of all legal owners.
              <Required />
            </span>
            <span className={hintClass}>This should include the names of all the owners of each adjoining property.</span>
            <input type="text" autoComplete="off" {...register("legalOwnersList")} className={inputClass} />
            <FieldError message={errors.legalOwnersList?.message} />
          </label>

          <PillRadios
            name="adjoiningOwnerType"
            legend="Regarding the adjoining owner stated above, which of the following is true?"
            options={OWNER_TYPES}
            value={values.adjoiningOwnerType}
            onChange={(v) => choose("adjoiningOwnerType", v as PartyWallFormValues["adjoiningOwnerType"])}
            error={errors.adjoiningOwnerType?.message}
          />

          <PillRadios
            name="livesAtAdjoiningProperty"
            legend="Do they live at the adjoining property?"
            options={YES_NO}
            value={values.livesAtAdjoiningProperty}
            onChange={(v) => choose("livesAtAdjoiningProperty", v as "yes" | "no")}
            error={errors.livesAtAdjoiningProperty?.message}
          />
        </>
      )}

      {step === 2 && (
        <>
          <PillRadios
            name="workOnPartyStructure"
            legend="Do you intend to carry out work directly to a party structure, such as inserting beams, removing a chimney breast, underpinning, or raising a wall?"
            options={YES_NO}
            value={values.workOnPartyStructure}
            onChange={(v) => choose("workOnPartyStructure", v as "yes" | "no")}
            error={errors.workOnPartyStructure?.message}
          />
          <PillRadios
            name="buildNewWall"
            legend="Do you intend to build a new wall on or immediately adjacent to the boundary line of the adjoining property?"
            options={YES_NO}
            value={values.buildNewWall}
            onChange={(v) => choose("buildNewWall", v as "yes" | "no")}
            error={errors.buildNewWall?.message}
          />
          <PillRadios
            name="excavation"
            legend="Do you intend to excavate within 3m / 6m of an adjoining building or structure?"
            options={EXCAVATION_OPTIONS}
            value={values.excavation}
            onChange={(v) => choose("excavation", v as PartyWallFormValues["excavation"])}
            error={errors.excavation?.message}
            stacked
          />
        </>
      )}

      {step === 3 && (
        <>
          {showBoundaryFields && (
            <SubSection title="About the proposed works on the boundary line">
              <PillRadios
                name="boundaryWallType"
                legend="Regarding the new wall at the boundary line, which of the following is true:"
                options={BOUNDARY_WALL_OPTIONS}
                value={values.boundaryWallType}
                onChange={(v) => choose("boundaryWallType", v as PartyWallFormValues["boundaryWallType"])}
                error={step3Errors.boundaryWallType}
                stacked
              />
              <PillRadios
                name="wallType"
                legend="Will the new wall be a boundary wall (party fence wall), or will it form part of an enclosure, such as an extension (party wall)?"
                options={WALL_TYPE_OPTIONS}
                value={values.wallType}
                onChange={(v) => choose("wallType", v as PartyWallFormValues["wallType"])}
                error={step3Errors.wallType}
              />
              <PillRadios
                name="projectingFootings"
                legend="Is it intended to place projecting footings under the land of the adjoining property?"
                options={YES_NO}
                value={values.projectingFootings}
                onChange={(v) => choose("projectingFootings", v as "yes" | "no")}
                error={step3Errors.projectingFootings}
              />
              <label className={groupClass}>
                Briefly describe the proposed works on the line of junction
                <textarea
                  rows={4}
                  {...register("boundaryWorksDescription")}
                  placeholder="Briefly outline the wall to be built, and any pertinent details about it."
                  className={cn(inputClass, "resize-y")}
                />
              </label>
            </SubSection>
          )}

          {showExcavationFields && (
            <SubSection title="About your proposed excavations">
              <PillRadios
                name="underpinAdjoining"
                legend="Do you intend to underpin, or otherwise strengthen, the adjoining property?"
                hint="If you intend on underpinning, or safeguarding, the structure / foundations of adjoining property, select yes. Otherwise, choose no."
                options={YES_NO}
                value={values.underpinAdjoining}
                onChange={(v) => choose("underpinAdjoining", v as "yes" | "no")}
                error={step3Errors.underpinAdjoining}
              />
              <label className={groupClass}>
                Briefly describe the proposed excavations
                <textarea
                  rows={4}
                  {...register("excavationDescription")}
                  placeholder="Briefly describe the excavations, including where possible, the location, depth, and purpose."
                  className={cn(inputClass, "resize-y")}
                />
              </label>
            </SubSection>
          )}

          {showPartyStructureFields && (
            <SubSection title="About your works to the party structure">
              <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0 text-sm font-semibold text-ink">
                <legend className="mb-2 p-0">
                  Which of the following activities are proposed as part of the works?
                  <Required />
                </legend>
                <span className={cn(hintClass, "-mt-1")}>Select all that apply.</span>
                {PARTY_STRUCTURE_ACTIVITIES.map((activity) => {
                  const checked = values.partyStructureActivities.includes(activity);
                  return (
                    <label
                      key={activity}
                      className={cn(
                        "flex cursor-pointer items-start gap-2.5 rounded-xl border px-4 py-2.5 font-medium leading-snug",
                        checked ? "border-teal bg-teal-tint" : "border-line-strong bg-white hover:border-teal",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const current = getValues("partyStructureActivities");
                          choose(
                            "partyStructureActivities",
                            checked ? current.filter((a) => a !== activity) : [...current, activity],
                          );
                        }}
                        className="m-0 mt-[3px] h-4 w-4 shrink-0 accent-teal"
                      />
                      {activity}
                    </label>
                  );
                })}
                <FieldError message={step3Errors.partyStructureActivities} />
              </fieldset>
              <label className={groupClass}>
                Briefly describe the proposed works to the party structure
                <textarea
                  rows={4}
                  {...register("partyStructureWorksDescription")}
                  placeholder="Include information about what works you intend to carry out."
                  className={cn(inputClass, "resize-y")}
                />
              </label>
            </SubSection>
          )}

          <PillRadios
            name="hasSurveyor"
            legend="Do you already have a surveyor?"
            hint={<>Select “No” to use Rosecrest Party Wall Surveyors. Otherwise, select “Yes” if you already have a surveyor.</>}
            options={YES_NO}
            value={values.hasSurveyor}
            onChange={(v) => choose("hasSurveyor", v as "yes" | "no")}
            error={step3Errors.hasSurveyor}
          />

          <label className={groupClass}>
            <span>
              Date of service
              <Required />
            </span>
            <span className={hintClass}>When do you intend on serving your party wall notice on your neighbour?</span>
            <input
              type="date"
              {...register("dateOfService", {
                onChange: () =>
                  setStep3Errors((prev) => {
                    const next = { ...prev };
                    delete next.dateOfService;
                    return next;
                  }),
              })}
              className={cn(inputClass, "max-w-[240px]")}
            />
            <FieldError message={step3Errors.dateOfService} />
          </label>

          <PdfField
            label="Upload your Land Registry document"
            file={landRegistryFile}
            error={step3Errors.landRegistryFileName}
            onChange={(f) => handlePdfChange(f, "landRegistry")}
          />
          <PdfField
            label="Upload your Technical Drawings document"
            file={technicalDrawingsFile}
            error={step3Errors.technicalDrawingsFileName}
            onChange={(f) => handlePdfChange(f, "technicalDrawings")}
          />
        </>
      )}

      {step === 4 && (
        <>
          <label className={groupClass}>
            <span>
              Enter your email address
              <Required />
            </span>
            <span className={hintClass}>We need this in order to send you your notices when you submit the form.</span>
            <input type="email" autoComplete="email" {...register("email")} className={inputClass} />
            <FieldError message={errors.email?.message} />
          </label>

          <div className="grid gap-[18px] sm:grid-cols-2">
            <label className={groupClass}>
              <span>
                Your name
                <Required />
              </span>
              <input type="text" autoComplete="name" {...register("fullName")} className={inputClass} />
              <FieldError message={errors.fullName?.message} />
            </label>
            <label className={groupClass}>
              <span>
                Phone <span className="font-normal text-muted-ink">(optional)</span>
              </span>
              <input type="tel" autoComplete="tel" {...register("phone")} className={inputClass} />
            </label>
          </div>

          <div className={groupClass}>
            <span>
              Consent
              <Required />
            </span>
            <div className="max-h-64 overflow-y-auto whitespace-pre-line rounded-xl border border-line bg-field p-4 text-sm font-normal leading-relaxed text-body">
              {PARTY_WALL_CONSENT_TEXT}
            </div>
            <label className="mt-1 flex cursor-pointer items-center gap-2.5 text-[15px] font-medium">
              <input
                type="checkbox"
                checked={values.termsAccepted}
                onChange={(e) => choose("termsAccepted", e.target.checked)}
                className="m-0 h-[18px] w-[18px] shrink-0 accent-teal"
              />
              I agree to the terms.
            </label>
            <FieldError message={errors.termsAccepted?.message} />
          </div>

          {submitError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Something went wrong submitting your request. Please try again.
            </p>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={goBack}
            className="min-h-14 cursor-pointer rounded-xl border border-line-strong bg-white px-7 py-4 text-[17px] font-bold text-ink hover:border-ink"
          >
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            type="button"
            onClick={goNext}
            className="min-h-14 flex-1 cursor-pointer rounded-xl border-0 bg-teal p-4 text-[17px] font-bold text-white hover:bg-teal-dark"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-14 flex-1 cursor-pointer rounded-xl border-0 bg-teal p-4 text-[17px] font-bold text-white hover:bg-teal-dark disabled:opacity-60"
          >
            {isSubmitting ? "Submitting…" : "Submit"}
          </button>
        )}
      </div>
    </form>
  );
}
