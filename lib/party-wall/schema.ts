import * as z from "zod";

export const ADJOINING_OWNER_TYPES = [
  { value: "single", label: "They are single individual" },
  { value: "couple", label: "They are a couple or joint owners" },
  { value: "company", label: "They are a public company or other body" },
] as const;

export const EXCAVATION_OPTIONS = [
  { value: "within_3m", label: "Yes, within 3m" },
  {
    value: "within_6m",
    label:
      "Yes, within 6m (This typically only applies when using piled, or other deep foundations)",
  },
  { value: "no", label: "No" },
] as const;

export const BOUNDARY_WALL_OPTIONS = [
  {
    value: "astride",
    label:
      "It is intended that the new wall will be built astride the boundary line and be situated partly on the building owner's land, and partly on the adjoining property's land.",
  },
  {
    value: "on_owner_land",
    label:
      "The new wall will be built immediately next to the boundary line, but entirely on the building owner's land.",
  },
] as const;

export const WALL_TYPE_OPTIONS = [
  { value: "party_fence_wall", label: "Party Fence Wall" },
  { value: "party_wall", label: "Party Wall" },
] as const;

export const PARTY_STRUCTURE_ACTIVITIES = [
  "Underpin, thicken, or raise, a party structure.",
  "Make good, or repair, a party structure for want of defect.",
  "To cut away from a party structure, such as removing a chimney breast, or other projection.",
  "To cut into the wall of a neighbouring property in order to insert a flashing, or other weather proofing, in order to weatherproof a gap.",
  "To raise a party fence wall for use as a party wall, and demolish a party fence wall and rebuild it as a party fence wall or party wall.",
  "Demolish a party structure of insufficient strength or height for your purposes and rebuild it to a sufficient strength or height.",
  "To cut into a party structure for any purpose (e.g. inserting a beam or damp proof course).",
  "To cut away parts of an adjoining building overhanging your land in order to construct a wall against it.",
  "To expose a party wall or structure previously enclosed.",
] as const;

export type PartyWallFormValues = {
  adjoiningPropertyCount: "1" | "2" | "3" | "4" | "other";
  customPropertyCount: string;
  propertyAddresses: string[];
  legalOwnersList: string;
  propertyOwners: Array<{ firstName: string; lastName: string }>;
  adjoiningOwnerType: "single" | "couple" | "company" | "";
  livesAtAdjoiningProperty: "yes" | "no" | "";
  workOnPartyStructure: "yes" | "no" | "";
  buildNewWall: "yes" | "no" | "";
  excavation: "within_3m" | "within_6m" | "no" | "";
  boundaryWallType: "astride" | "on_owner_land" | "";
  wallType: "party_fence_wall" | "party_wall" | "";
  projectingFootings: "yes" | "no" | "";
  boundaryWorksDescription: string;
  underpinAdjoining: "yes" | "no" | "";
  excavationDescription: string;
  partyStructureActivities: string[];
  partyStructureWorksDescription: string;
  hasSurveyor: "yes" | "no" | "";
  dateOfService: string;
  landRegistryFileName: string;
  technicalDrawingsFileName: string;
  email: string;
  fullName: string;
  phone: string;
  termsAccepted: boolean;
};

export const defaultPartyWallFormValues: PartyWallFormValues = {
  adjoiningPropertyCount: "1",
  customPropertyCount: "",
  propertyAddresses: ["", "", "", ""],
  legalOwnersList: "",
  propertyOwners: [
    { firstName: "", lastName: "" },
    { firstName: "", lastName: "" },
    { firstName: "", lastName: "" },
    { firstName: "", lastName: "" },
  ],
  adjoiningOwnerType: "",
  livesAtAdjoiningProperty: "",
  workOnPartyStructure: "",
  buildNewWall: "",
  excavation: "",
  boundaryWallType: "",
  wallType: "",
  projectingFootings: "",
  boundaryWorksDescription: "",
  underpinAdjoining: "",
  excavationDescription: "",
  partyStructureActivities: [],
  partyStructureWorksDescription: "",
  hasSurveyor: "",
  dateOfService: "",
  landRegistryFileName: "",
  technicalDrawingsFileName: "",
  email: "",
  fullName: "",
  phone: "",
  termsAccepted: false,
};

export function getEffectivePropertyCount(values: PartyWallFormValues): number {
  if (values.adjoiningPropertyCount === "other") {
    const n = Number(values.customPropertyCount);
    if (Number.isFinite(n) && n >= 1 && n <= 4) return n;
    return 1;
  }
  return Number(values.adjoiningPropertyCount);
}

const yesNo = z.enum(["yes", "no"], { message: "Please select an option" });

export const step1Schema = z
  .object({
    adjoiningPropertyCount: z.enum(["1", "2", "3", "4", "other"]),
    customPropertyCount: z.string(),
    propertyAddresses: z.array(z.string()),
    legalOwnersList: z.string().min(1, "Please list all legal owners"),
    propertyOwners: z.array(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
      })
    ),
    adjoiningOwnerType: z.enum(["single", "couple", "company"], {
      message: "Please select an option",
    }),
    livesAtAdjoiningProperty: yesNo,
  })
  .superRefine((data, ctx) => {
    const count = getEffectivePropertyCount(data as PartyWallFormValues);
    if (data.adjoiningPropertyCount === "other") {
      const n = Number(data.customPropertyCount);
      if (!Number.isFinite(n) || n < 1 || n > 4) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a number between 1 and 4",
          path: ["customPropertyCount"],
        });
      }
    }
    for (let i = 0; i < count; i++) {
      if (!data.propertyAddresses[i]?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Address is required",
          path: ["propertyAddresses", i],
        });
      }
      if (!data.propertyOwners[i]?.firstName.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "First name is required",
          path: ["propertyOwners", i, "firstName"],
        });
      }
      if (!data.propertyOwners[i]?.lastName.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Last name is required",
          path: ["propertyOwners", i, "lastName"],
        });
      }
    }
  });

export const step2Schema = z.object({
  workOnPartyStructure: yesNo,
  buildNewWall: yesNo,
  excavation: z.enum(["within_3m", "within_6m", "no"], {
    message: "Please select an option",
  }),
});

export function validateStep3(values: PartyWallFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (values.buildNewWall === "yes") {
    if (!values.boundaryWallType) errors.boundaryWallType = "Please select an option";
    if (!values.wallType) errors.wallType = "Please select an option";
    if (!values.projectingFootings) errors.projectingFootings = "Please select an option";
  }

  if (values.excavation !== "no" && values.excavation !== "") {
    if (!values.underpinAdjoining) errors.underpinAdjoining = "Please select an option";
  }

  if (values.workOnPartyStructure === "yes") {
    if (values.partyStructureActivities.length === 0) {
      errors.partyStructureActivities = "Select at least one activity";
    }
  }

  if (!values.hasSurveyor) errors.hasSurveyor = "Please select an option";
  if (!values.dateOfService) errors.dateOfService = "Date of service is required";
  if (!values.landRegistryFileName) {
    errors.landRegistryFileName = "Land Registry document is required";
  }
  if (!values.technicalDrawingsFileName) {
    errors.technicalDrawingsFileName = "Technical drawings document is required";
  }

  return errors;
}

export const step4Schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(1, "Your name is required"),
  phone: z.string().optional(),
  termsAccepted: z.literal(true, {
    message: "You must accept the terms to continue",
  }),
});

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const space = trimmed.indexOf(" ");
  if (space === -1) return { firstName: trimmed, lastName: "—" };
  return {
    firstName: trimmed.slice(0, space),
    lastName: trimmed.slice(space + 1).trim() || "—",
  };
}

export function extractUkPostcode(address: string): string {
  const match = address.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
  return match ? match[0].toUpperCase() : "TBC";
}

function labelFor(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function buildPartyWallCrmMessage(
  values: PartyWallFormValues,
  files?: { landRegistry?: string; technicalDrawings?: string }
): string {
  const count = getEffectivePropertyCount(values);
  const lines: string[] = [
    "Party Wall Notice Generator submission",
    "",
    `Adjoining properties: ${count}`,
    "",
    "Adjoining property addresses:",
    ...values.propertyAddresses.slice(0, count).map((a, i) => `  ${i + 1}. ${a}`),
    "",
    `Legal owners list: ${values.legalOwnersList}`,
    "",
    "Property owner names:",
    ...values.propertyOwners.slice(0, count).map(
      (o, i) => `  Property ${i + 1}: ${o.firstName} ${o.lastName}`.trim()
    ),
    "",
    `Adjoining owner type: ${labelFor(ADJOINING_OWNER_TYPES, values.adjoiningOwnerType)}`,
    `Lives at adjoining property: ${values.livesAtAdjoiningProperty === "yes" ? "Yes" : "No"}`,
    "",
    `Work on party structure: ${values.workOnPartyStructure === "yes" ? "Yes" : "No"}`,
    `Build new wall at boundary: ${values.buildNewWall === "yes" ? "Yes" : "No"}`,
    `Excavation: ${labelFor(EXCAVATION_OPTIONS, values.excavation)}`,
  ];

  if (values.buildNewWall === "yes") {
    lines.push(
      "",
      "Boundary line works:",
      `  Wall position: ${labelFor(BOUNDARY_WALL_OPTIONS, values.boundaryWallType)}`,
      `  Wall type: ${labelFor(WALL_TYPE_OPTIONS, values.wallType)}`,
      `  Projecting footings: ${values.projectingFootings === "yes" ? "Yes" : "No"}`,
      `  Description: ${values.boundaryWorksDescription || "—"}`
    );
  }

  if (values.excavation !== "no") {
    lines.push(
      "",
      "Excavation details:",
      `  Underpin adjoining property: ${values.underpinAdjoining === "yes" ? "Yes" : "No"}`,
      `  Description: ${values.excavationDescription || "—"}`
    );
  }

  if (values.workOnPartyStructure === "yes") {
    lines.push(
      "",
      "Party structure activities:",
      ...values.partyStructureActivities.map((a) => `  • ${a}`),
      `  Description: ${values.partyStructureWorksDescription || "—"}`
    );
  }

  lines.push(
    "",
    `Already has surveyor: ${values.hasSurveyor === "yes" ? "Yes" : "No"}`,
    `Date of service: ${values.dateOfService}`,
    "",
    "Documents:",
    `  Land Registry: ${values.landRegistryFileName}${files?.landRegistry ? " (attached as base64 in payload)" : ""}`,
    `  Technical drawings: ${values.technicalDrawingsFileName}${files?.technicalDrawings ? " (attached as base64 in payload)" : ""}`,
    "",
    "Terms accepted: Yes"
  );

  return lines.join("\n");
}
