import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { LeadDetail } from "@/crm/types";
import {
  buildEmailToOptions,
  commitEmailChips,
  emailContactsFromLead,
  emailSendFields,
  matchEmailToKind,
  mergeEmailContacts,
  parseEmailAddresses,
  resolveEmailToAddress,
  type EmailToOption,
} from "./emailCompose";

const options: EmailToOption[] = [
  { kind: "client", label: "Client", email: "client@example.com", name: "Ada Client" },
  { kind: "agent", label: "Agent", email: "agent@example.com", name: "Estate Agent" },
  { kind: "vendor", label: "Vendor", email: "vendor@example.com", name: "Vendor Co" },
  { kind: "surveyor", label: "Surveyor", email: "surveyor@example.com", name: "Sam Surveyor" },
];

describe("email cc chips", () => {
  it("splits on comma, semicolon, and space and lowercases", () => {
    assert.deepEqual(parseEmailAddresses(" A@B.com, c@d.com; e@f.com "), [
      "a@b.com",
      "c@d.com",
      "e@f.com",
    ]);
  });

  it("skips blanks and duplicates when committing", () => {
    assert.deepEqual(commitEmailChips(["a@b.com"], "a@b.com c@d.com"), ["a@b.com", "c@d.com"]);
    assert.deepEqual(commitEmailChips(["a@b.com"], "   "), ["a@b.com"]);
  });
});

describe("email to options", () => {
  it("always includes the client and only contacts that have an email", () => {
    const built = buildEmailToOptions(
      {
        customerName: "Ada",
        customerEmail: "ada@example.com",
        agentName: "No Email Agent",
        agentEmail: "  ",
        vendorEmail: "vendor@example.com",
        vendorName: "Vendor",
      },
      "Fallback"
    );
    assert.deepEqual(
      built.map((option) => option.kind),
      ["client", "vendor"]
    );
    assert.equal(built[0]?.email, "ada@example.com");
  });

  it("uses the fallback name when the client name is missing", () => {
    const built = buildEmailToOptions({}, "Jordan");
    assert.equal(built[0]?.name, "Jordan");
    assert.equal(built[0]?.email, "");
  });

  it("reads agent, vendor, and surveyor off the lead job", () => {
    const contacts = emailContactsFromLead({
      customer: { firstName: "Ada", lastName: "Client", email: "ada@example.com" },
      job: {
        agentEmail: "agent@example.com",
        agentName: "Agent",
        vendorEmail: "vendor@example.com",
        vendorName: "Vendor",
        assignedTo: { email: "surveyor@example.com", fullName: "Sam" },
      },
    } as LeadDetail);
    assert.equal(contacts.customerName, "Ada Client");
    assert.equal(contacts.surveyorEmail, "surveyor@example.com");
    assert.equal(contacts.surveyorName, "Sam");
  });

  it("lets an explicit override replace a cached contact", () => {
    const merged = mergeEmailContacts(
      { agentEmail: "old@example.com", vendorEmail: "vendor@example.com" },
      { agentEmail: "new@example.com" }
    );
    assert.equal(merged.agentEmail, "new@example.com");
    assert.equal(merged.vendorEmail, "vendor@example.com");
  });
});

describe("reply recipient matching", () => {
  it("defaults to the client when there is no from address", () => {
    assert.deepEqual(matchEmailToKind(undefined, options, "client@example.com"), { kind: "client" });
  });

  it("selects the matching stakeholder", () => {
    assert.deepEqual(matchEmailToKind("Agent@example.com", options, "client@example.com"), {
      kind: "agent",
    });
    assert.deepEqual(matchEmailToKind("vendor@example.com", options, "client@example.com"), {
      kind: "vendor",
    });
  });

  it("keeps the client when the sender is the customer", () => {
    assert.deepEqual(matchEmailToKind("client@example.com", options, "client@example.com"), {
      kind: "client",
    });
  });

  it("falls through to other with the raw address", () => {
    assert.deepEqual(matchEmailToKind(" stranger@example.com ", options, "client@example.com"), {
      kind: "other",
      otherEmail: "stranger@example.com",
    });
  });
});

describe("email send fields", () => {
  const base = {
    channel: "EMAIL",
    subject: "Re: survey",
    options,
    otherToEmail: "",
    ccAddresses: [] as string[],
  };

  it("omits toAddress for the client and includes cc when set", () => {
    const fields = emailSendFields({ ...base, toKind: "client", ccAddresses: ["cc@example.com"] });
    assert.deepEqual(fields, { ok: true, ccAddresses: ["cc@example.com"] });
  });

  it("sends the agent address as toAddress", () => {
    const fields = emailSendFields({ ...base, toKind: "agent" });
    assert.deepEqual(fields, { ok: true, toAddress: "agent@example.com" });
  });

  it("requires an address for other", () => {
    const missing = emailSendFields({ ...base, toKind: "other" });
    assert.deepEqual(missing, { ok: false, error: "Enter a To email address." });
    const filled = emailSendFields({
      ...base,
      toKind: "other",
      otherToEmail: " other@example.com ",
    });
    assert.deepEqual(filled, { ok: true, toAddress: "other@example.com" });
  });

  it("rejects a stakeholder option that has no email", () => {
    const fields = emailSendFields({
      ...base,
      toKind: "agent",
      options: [{ kind: "client", label: "Client", email: "ada@example.com" }],
    });
    assert.deepEqual(fields, { ok: false, error: "Selected contact has no email address." });
  });

  it("requires a subject for email and ignores addressing for sms", () => {
    assert.equal(emailSendFields({ ...base, subject: "  ", toKind: "client" }).ok, false);
    assert.deepEqual(emailSendFields({ ...base, channel: "SMS", subject: "", toKind: "agent" }), {
      ok: true,
    });
  });
});
