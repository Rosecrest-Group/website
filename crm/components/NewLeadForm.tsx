"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/crm/lib/api";
import type { CreateLeadPayload, LeadDuplicateMatch } from "@/crm/types";
import { LEAD_SOURCES, LEAD_STAGE_LABELS } from "@/crm/lib/constants";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import TextField from "@/crm/components/ui/TextField";
import SelectField from "@/crm/components/ui/SelectField";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";

function normalizeUkPhone(phoneRaw: string): string {
  const trimmed = phoneRaw.trim();
  if (trimmed.startsWith("+")) return trimmed.replace(/\s/g, "");
  if (trimmed.startsWith("0")) return `+44${trimmed.slice(1).replace(/\s/g, "")}`;
  return `+44${trimmed.replace(/\s/g, "")}`;
}

function sourceLabel(source: string): string {
  return LEAD_SOURCES.find((item) => item.value === source)?.label ?? source;
}

function matchSummary(match: LeadDuplicateMatch): string {
  const stage = LEAD_STAGE_LABELS[match.stage] ?? match.stage;
  return `${match.customer.firstName} ${match.customer.lastName} · ${sourceLabel(match.source)} · ${stage} · ${match.propertyAddress}, ${match.propertyPostcode}`;
}

const BANNER_STYLES = {
  duplicate: "border-red-200 bg-red-50 text-red-950",
  possible: "border-amber-200 bg-amber-50 text-amber-950",
  related: "border-slate-200 bg-slate-50 text-slate-900",
} as const;

const BANNER_TITLES = {
  duplicate: "This customer already has an open lead for this property",
  possible: "Another open lead uses this phone number",
  related: "This customer already has an open lead for a different property",
} as const;

const BANNER_HELP = {
  duplicate: "Creating another lead will duplicate the existing one.",
  possible:
    "The email is different, so this is likely a separate person or property. The new lead will be created and flagged for review.",
  related: "This will be created as a separate lead against the same customer.",
} as const;

export default function NewLeadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneFromCall = searchParams.get("phone") ?? "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(phoneFromCall);
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");
  const [matches, setMatches] = useState<LeadDuplicateMatch[]>([]);
  const [forceCreate, setForceCreate] = useState(false);

  const blockingMatches = matches.filter((match) => match.confidence === "duplicate");

  useEffect(() => {
    const normalizedPhone = normalizeUkPhone(phone);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes("@") || normalizedPhone.length < 11) {
      setMatches([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const result = await api.checkLeadDuplicates({
          email: normalizedEmail,
          phone: normalizedPhone,
          propertyAddress: address.trim() || undefined,
          propertyPostcode: postcode.trim() || undefined,
        });
        if (cancelled) return;
        setMatches(result.matches);
        if (!result.matches.some((match) => match.confidence === "duplicate")) {
          setForceCreate(false);
        }
      } catch {
        if (!cancelled) setMatches([]);
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [email, phone, address, postcode]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (blockingMatches.length > 0 && !forceCreate) {
      setError("An open lead already exists for this customer and property. Open it, or tick Create anyway.");
      return;
    }

    setLoading(true);

    const fd = new FormData(e.currentTarget);

    const payload: CreateLeadPayload = {
      customer: {
        firstName: String(fd.get("firstName")),
        lastName: String(fd.get("lastName")),
        email: String(fd.get("email")),
        phone: normalizeUkPhone(String(fd.get("phone") ?? "")),
        customerType: "HOMEBUYER",
      },
      jobType: "RICS_SURVEY",
      surveyLevel: (fd.get("surveyLevel") as CreateLeadPayload["surveyLevel"]) || "LEVEL_2",
      propertyAddress: String(fd.get("propertyAddress")),
      propertyPostcode: String(fd.get("propertyPostcode")),
      quotedAmount: fd.get("quotedAmount") ? Number(fd.get("quotedAmount")) : undefined,
      marketingOptIn: true,
      consent: {
        timestamp: new Date().toISOString(),
        source: "crm_manual_entry",
      },
      forceCreate: forceCreate || undefined,
    };

    try {
      const result = await api.createLead(payload);
      router.push(`/crm/leads/${result.leadId}`);
    } catch (err) {
      const duplicateError = err as Error & {
        code?: string;
        details?: { matches?: LeadDuplicateMatch[] };
      };
      if (duplicateError.code === "DUPLICATE_LEAD") {
        setMatches(duplicateError.details?.matches ?? []);
        setError("An open lead already exists for this customer and property. Open it, or tick Create anyway.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to create lead");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <CrmPageContent>
      <CrmPageHeader title="New lead" />

      <CurvedContainer>
        <div className="border-b border-(--color-tc-20) px-6 py-4">
          <h2 className="text-base font-semibold text-(--color-tc-40)">Customer & property</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {(["duplicate", "possible", "related"] as const).map((confidence) => {
            const group = matches.filter((match) => match.confidence === confidence);
            if (group.length === 0) return null;

            return (
              <div
                key={confidence}
                className={`rounded-xl border px-4 py-3 text-sm ${BANNER_STYLES[confidence]}`}
              >
                <p className="font-medium">{BANNER_TITLES[confidence]}</p>
                <ul className="mt-2 space-y-1.5">
                  {group.map((match) => (
                    <li key={match.leadId} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{matchSummary(match)}</span>
                      <Link
                        href={`/crm/leads/${match.leadId}`}
                        className="font-medium underline underline-offset-2"
                      >
                        Open lead
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs opacity-80">{BANNER_HELP[confidence]}</p>
                {confidence === "duplicate" && (
                  <label className="mt-3 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={forceCreate}
                      onChange={(e) => setForceCreate(e.target.checked)}
                      className="rounded"
                    />
                    Create a new lead anyway
                  </label>
                )}
              </div>
            );
          })}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TextField label="First name" name="firstName" required />
            <TextField label="Last name" name="lastName" required />
            <TextField
              label="Email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Phone (UK)"
              name="phone"
              placeholder="07700 900142"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <TextField
                label="Property address"
                name="propertyAddress"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <TextField
              label="Postcode"
              name="propertyPostcode"
              placeholder="BR2 8LN"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              required
            />
            <SelectField label="Survey level" name="surveyLevel" defaultValue="LEVEL_2">
              <option value="LEVEL_1">Level 1</option>
              <option value="LEVEL_2">Level 2</option>
              <option value="LEVEL_3">Level 3</option>
            </SelectField>
            <TextField label="Quoted amount (£)" name="quotedAmount" type="number" step="0.01" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <PrimaryButton type="submit" disabled={loading} className="w-auto min-w-40">
              {loading ? "Creating…" : "Create lead"}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => router.back()}>
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </CurvedContainer>
    </CrmPageContent>
  );
}
