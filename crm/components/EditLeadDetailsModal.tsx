"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/crm/lib/api";
import type { LeadDetail, LeadDuplicateMatch } from "@/crm/types";
import CrmModal from "@/crm/components/ui/CrmModal";
import PrimaryButton from "@/crm/components/ui/PrimaryButton";
import SecondaryButton from "@/crm/components/ui/SecondaryButton";
import TextField from "@/crm/components/ui/TextField";
import { LEAD_STAGE_LABELS } from "@/crm/lib/constants";

function isLeadPaid(lead: LeadDetail): boolean {
  return lead.job?.paymentStatus === "PAID" || Boolean(lead.paid);
}

function quoteLocked(lead: LeadDetail): boolean {
  return isLeadPaid(lead) || lead.stage === "CONVERTED";
}

function parseQuote(value: string): number | null {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

export default function EditLeadDetailsModal({
  isOpen,
  lead,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  lead: LeadDetail | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const customer = lead?.customer;
  const locked = lead ? quoteLocked(lead) : false;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyPostcode, setPropertyPostcode] = useState("");
  const [quotedAmount, setQuotedAmount] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<LeadDuplicateMatch[]>([]);

  useEffect(() => {
    if (!isOpen || !lead) return;
    setFirstName(customer?.firstName ?? "");
    setLastName(customer?.lastName ?? "");
    setEmail(customer?.email ?? "");
    setPhone(customer?.phone ?? "");
    setPropertyAddress(lead.propertyAddress);
    setPropertyPostcode(lead.propertyPostcode);
    setQuotedAmount(lead.quotedAmount != null && lead.quotedAmount > 0 ? String(lead.quotedAmount) : "");
    setError("");
    setDuplicateMatches([]);
  }, [isOpen, lead, customer?.firstName, customer?.lastName, customer?.email, customer?.phone]);

  async function save(ignoreDuplicates = false) {
    if (!lead || saving) return;
    const first = firstName.trim();
    const last = lastName.trim();
    const mail = email.trim();
    const tel = phone.trim();
    const address = propertyAddress.trim();
    const postcode = propertyPostcode.trim();
    if (!first || !last) {
      setError("First and last name are required.");
      return;
    }
    if (!mail || !mail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (tel.replace(/\D/g, "").length < 6) {
      setError("Enter a valid phone number.");
      return;
    }
    if (!address || !postcode) {
      setError("Property address and postcode are required.");
      return;
    }

    let nextQuote: number | null = null;
    if (!locked) {
      nextQuote = parseQuote(quotedAmount);
      if (quotedAmount.trim() && nextQuote == null) {
        setError("Enter a valid quote amount greater than 0.");
        return;
      }
    }

    const currentQuote = lead.quotedAmount != null && lead.quotedAmount > 0 ? lead.quotedAmount : null;
    const quoteUnchanged =
      locked ||
      (nextQuote == null && currentQuote == null) ||
      nextQuote === currentQuote;
    const phoneTail = (value: string) => value.replace(/\D/g, "").slice(-10);
    if (
      first === (customer?.firstName ?? "").trim() &&
      last === (customer?.lastName ?? "").trim() &&
      mail.toLowerCase() === (customer?.email ?? "").trim().toLowerCase() &&
      phoneTail(tel) === phoneTail(customer?.phone ?? "") &&
      address === lead.propertyAddress.trim() &&
      postcode === lead.propertyPostcode.trim() &&
      quoteUnchanged
    ) {
      toast.message("No changes");
      onClose();
      return;
    }

    const payload: Parameters<typeof api.updateLead>[1] = {
      firstName: first,
      lastName: last,
      email: mail,
      phone: tel,
      propertyAddress: address,
      propertyPostcode: postcode,
    };

    if (!locked && nextQuote != null) payload.quotedAmount = nextQuote;

    const contactChanged =
      mail.toLowerCase() !== (customer?.email ?? "").toLowerCase() ||
      tel.replace(/\D/g, "").slice(-10) !== (customer?.phone ?? "").replace(/\D/g, "").slice(-10);

    if (contactChanged && !ignoreDuplicates) {
      try {
        const { matches } = await api.checkLeadDuplicates({
          email: mail,
          phone: tel,
          propertyAddress: address,
          propertyPostcode: postcode,
        });
        const others = matches.filter(
          (match) => match.leadId !== lead.id && match.customer.id !== customer?.id
        );
        if (others.length > 0) {
          setDuplicateMatches(others);
          setError("");
          return;
        }
      } catch {
        // Duplicate check is a warning, not a hard gate.
      }
    }

    setSaving(true);
    setError("");
    try {
      await api.updateLead(lead.id, payload);
      toast.success("Lead details updated");
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save lead details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <CrmModal
      isOpen={isOpen}
      title="Edit lead details"
      description="Name, email and phone update this customer on every lead and job."
      onClose={saving ? () => undefined : onClose}
      closeDisabled={saving}
      size="md"
      footer={
        <>
          <SecondaryButton type="button" onClick={onClose} disabled={saving}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={() => void save(duplicateMatches.length > 0)}
            disabled={saving}
          >
            {saving
              ? "Saving…"
              : duplicateMatches.length > 0
                ? "Save anyway"
                : "Save"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        {duplicateMatches.length > 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
            <p className="font-medium">This email or phone already belongs to another customer.</p>
            <ul className="mt-1.5 space-y-1 text-xs">
              {duplicateMatches.slice(0, 3).map((match) => (
                <li key={match.leadId}>
                  {match.customer.firstName} {match.customer.lastName} ·{" "}
                  {LEAD_STAGE_LABELS[match.stage] ?? match.stage} · {match.propertyAddress},{" "}
                  {match.propertyPostcode}
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-xs">Saving will keep this as a separate customer record.</p>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            id="edit-lead-first-name"
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={saving}
            autoComplete="given-name"
          />
          <TextField
            id="edit-lead-last-name"
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={saving}
            autoComplete="family-name"
          />
        </div>
        <TextField
          id="edit-lead-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setDuplicateMatches([]);
          }}
          disabled={saving}
          autoComplete="email"
        />
        <TextField
          id="edit-lead-phone"
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setDuplicateMatches([]);
          }}
          disabled={saving}
          autoComplete="tel"
        />
        <TextField
          id="edit-lead-address"
          label="Property address"
          value={propertyAddress}
          onChange={(e) => setPropertyAddress(e.target.value)}
          disabled={saving}
        />
        <TextField
          id="edit-lead-postcode"
          label="Postcode"
          value={propertyPostcode}
          onChange={(e) => setPropertyPostcode(e.target.value)}
          disabled={saving}
        />
        <div>
          <TextField
            id="edit-lead-quote"
            label="Quote amount (£)"
            type="text"
            inputMode="decimal"
            value={quotedAmount}
            disabled={saving || locked}
            onChange={(e) => setQuotedAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
          />
          {locked ? (
            <p className="mt-1.5 text-xs text-ink-muted">
              Quote is locked because this lead is paid or converted.
            </p>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>
    </CrmModal>
  );
}
