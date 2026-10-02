"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/crm/lib/api";
import type { Customer, CustomerType } from "@/crm/types";
import type { ContactListMemberRow } from "@/crm/types/prospecting";
import { CUSTOMER_TYPE_LABELS, CUSTOMER_TYPE_OPTIONS } from "@/crm/lib/constants";
import CrmModal from "@/crm/components/ui/CrmModal";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextField from "@/crm/components/ui/TextField";
import SelectField from "@/crm/components/ui/SelectField";

function splitPersonName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] ?? "", lastName: "" };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

export default function EditImportedContactModal({
  isOpen,
  member,
  defaultCustomerType,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  member: ContactListMemberRow | null;
  defaultCustomerType?: CustomerType | null;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [customerType, setCustomerType] = useState<CustomerType>("LEGAL");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !member) return;
    const split = splitPersonName(member.name);
    setFirstName(split.firstName);
    setLastName(split.lastName);
    setEmail(member.email ?? "");
    setPhone(member.phone ?? "");
    setCompany("");
    setCustomerType(defaultCustomerType ?? "LEGAL");
    setError("");

    if (!member.customerId) return;
    let cancelled = false;
    setLoading(true);
    void api
      .getCustomer(member.customerId)
      .then((customer) => {
        if (cancelled) return;
        setFirstName(customer.firstName);
        setLastName(customer.lastName);
        setEmail(customer.email);
        setPhone(customer.phone);
        setCompany(customer.company ?? "");
        setCustomerType(customer.customerType || defaultCustomerType || "LEGAL");
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load contact");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, member, defaultCustomerType]);

  async function save() {
    if (!member?.customerId || saving) return;
    const first = firstName.trim();
    const last = lastName.trim();
    const mail = email.trim();
    const tel = phone.trim();
    if (!first && !last) {
      setError("Enter a name.");
      return;
    }
    if (!mail && !tel) {
      setError("Enter an email or a phone.");
      return;
    }
    if (mail && !mail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        firstName: first,
        lastName: last,
        email: mail,
        phone: tel,
        company: company.trim(),
        customerType,
      };
      let updated;
      try {
        updated = await api.updateCustomer(member.customerId, payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (!/customerType|unrecogni[sz]ed|unexpected field/i.test(message)) throw err;
        updated = await api.updateCustomer(member.customerId, {
          firstName: first,
          lastName: last,
          email: mail,
          phone: tel,
          company: company.trim(),
        });
      }
      toast.success("Contact updated.");
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <CrmModal
      isOpen={isOpen}
      title="Edit contact"
      description="Correct details from this import without uploading the spreadsheet again."
      onClose={saving ? () => undefined : onClose}
      closeDisabled={saving}
      size="md"
      footer={
        <>
          <SecondaryButton type="button" onClick={onClose} disabled={saving}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" onClick={() => void save()} disabled={saving || loading || !member?.customerId}>
            {saving ? "Saving…" : "Save"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        {loading ? <p className="text-sm text-ink-muted">Loading contact…</p> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            id="import-edit-first-name"
            label="First name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            disabled={saving || loading}
            autoComplete="given-name"
          />
          <TextField
            id="import-edit-last-name"
            label="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            disabled={saving || loading}
            autoComplete="family-name"
          />
        </div>
        <TextField
          id="import-edit-email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={saving || loading}
          autoComplete="email"
        />
        <TextField
          id="import-edit-phone"
          label="Phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          disabled={saving || loading}
          autoComplete="tel"
        />
        <TextField
          id="import-edit-company"
          label="Company"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          disabled={saving || loading}
        />
        <SelectField
          id="import-edit-type"
          label="Type"
          value={customerType}
          onChange={(event) => setCustomerType(event.target.value as CustomerType)}
          disabled={saving || loading}
        >
          {CUSTOMER_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <p className="text-xs text-ink-muted">
          Solicitors and law firms should be {CUSTOMER_TYPE_LABELS.LEGAL}, not {CUSTOMER_TYPE_LABELS.LANDLORD}.
        </p>
        {error ? (
          <p className="text-sm text-orange-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </CrmModal>
  );
}
