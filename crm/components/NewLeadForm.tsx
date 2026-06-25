"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/crm/lib/api";
import type { CreateLeadPayload } from "@/crm/types";
import CrmPageContent from "@/crm/components/layout/CrmPageContent";
import CrmPageHeader from "@/crm/components/layout/CrmPageHeader";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";
import TextField from "@/crm/components/ui/TextField";
import SelectField from "@/crm/components/ui/SelectField";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";

export default function NewLeadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneFromCall = searchParams.get("phone") ?? "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const phoneRaw = String(fd.get("phone") ?? "");
    const phone = phoneRaw.startsWith("+")
      ? phoneRaw
      : phoneRaw.startsWith("0")
        ? `+44${phoneRaw.slice(1).replace(/\s/g, "")}`
        : `+44${phoneRaw.replace(/\s/g, "")}`;

    const payload: CreateLeadPayload = {
      customer: {
        firstName: String(fd.get("firstName")),
        lastName: String(fd.get("lastName")),
        email: String(fd.get("email")),
        phone,
        customerType: "HOMEBUYER",
      },
      jobType: "RICS_SURVEY",
      surveyLevel: (fd.get("surveyLevel") as CreateLeadPayload["surveyLevel"]) || "LEVEL_2",
      propertyAddress: String(fd.get("propertyAddress")),
      propertyPostcode: String(fd.get("propertyPostcode")),
      quotedAmount: fd.get("quotedAmount") ? Number(fd.get("quotedAmount")) : undefined,
      marketingOptIn: fd.get("marketingOptIn") === "on",
      consent: {
        timestamp: new Date().toISOString(),
        source: "crm_manual_entry",
      },
    };

    try {
      const result = await api.createLead(payload);
      router.push(`/crm/leads/${result.leadId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CrmPageContent className="max-w-2xl">
      <CrmPageHeader title="New lead" />

      <CurvedContainer>
        <div className="border-b border-(--color-tc-20) px-6 py-4">
          <h2 className="text-base font-semibold text-(--color-tc-40)">Customer & property</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="First name" name="firstName" required />
            <TextField label="Last name" name="lastName" required />
          </div>
          <TextField label="Email" name="email" type="email" required />
          <TextField
            label="Phone (UK)"
            name="phone"
            placeholder="07700 900142"
            defaultValue={phoneFromCall}
            required
          />
          <TextField label="Property address" name="propertyAddress" required />
          <TextField label="Postcode" name="propertyPostcode" placeholder="BR2 8LN" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Survey level" name="surveyLevel" defaultValue="LEVEL_2">
              <option value="LEVEL_1">Level 1</option>
              <option value="LEVEL_2">Level 2</option>
              <option value="LEVEL_3">Level 3</option>
            </SelectField>
            <TextField label="Quoted amount (£)" name="quotedAmount" type="number" step="0.01" />
          </div>
          <label className="flex items-center gap-2 text-sm text-(--color-tc-40)">
            <input type="checkbox" name="marketingOptIn" className="rounded" />
            Marketing opt-in
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <PrimaryButton type="submit" disabled={loading} className="w-auto min-w-[160px]">
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
