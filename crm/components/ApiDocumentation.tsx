"use client";

import { useState } from "react";
import ApiDocsShell from "@/crm/components/docs/ApiDocsShell";
import DocsSection, { DocsCodePanel } from "@/crm/components/docs/DocsSection";
import {
  API_BASE_URL,
  CODE_LANGUAGES,
  COMMUNICATION_NOT_FOUND_RESPONSE,
  COMMUNICATION_SUCCESS_RESPONSE,
  COMMUNICATIONS_ENDPOINT,
  ERROR_RESPONSE,
  EXAMPLE_CALL_EVENT_JSON,
  EXAMPLE_EMAIL_EVENT_JSON,
  EXAMPLE_LEAD_JSON,
  EXAMPLE_SMS_EVENT_JSON,
  INTAKE_ENDPOINT,
  RATE_LIMIT_RESPONSE,
  SUCCESS_RESPONSE,
  VALIDATION_ERROR_RESPONSE,
  getCommunicationSnippet,
  getRequestSnippet,
  type CodeLanguage,
  type CommunicationExample,
} from "@/crm/lib/apiDocsSnippets";

function ParamTable({
  rows,
}: {
  rows: { name: string; type: string; required?: boolean; description: string }[];
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="min-w-[640px] overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Field</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.name} className="align-top">
              <td className="px-4 py-3">
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">{row.name}</code>
                {row.required && (
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-rose-600">
                    Required
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-500">{row.type}</td>
              <td className="px-4 py-3 text-slate-600">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

const ENDPOINT_SNIPPET = `POST ${INTAKE_ENDPOINT}
Content-Type: application/json
X-API-Key: rc_your_api_key_here`;

const COMMUNICATIONS_ENDPOINT_SNIPPET = `POST ${COMMUNICATIONS_ENDPOINT}
Content-Type: application/json
X-API-Key: rc_your_api_key_here`;

const COMMUNICATION_EXAMPLES: { id: CommunicationExample; label: string; code: string }[] = [
  { id: "call", label: "Call", code: EXAMPLE_CALL_EVENT_JSON },
  { id: "sms", label: "SMS", code: EXAMPLE_SMS_EVENT_JSON },
  { id: "email", label: "Email", code: EXAMPLE_EMAIL_EVENT_JSON },
];

export default function ApiDocumentation() {
  const [language, setLanguage] = useState<CodeLanguage>("curl");
  const [commLanguage, setCommLanguage] = useState<CodeLanguage>("curl");
  const [commExample, setCommExample] = useState<CommunicationExample>("call");
  const selectedCommExample = COMMUNICATION_EXAMPLES.find((item) => item.id === commExample) ?? COMMUNICATION_EXAMPLES[0];

  return (
    <ApiDocsShell>
      <DocsSection
        id="overview"
        code={
          <DocsCodePanel
            label="Endpoint"
            code={ENDPOINT_SNIPPET}
            wrap
          />
        }
      >
        <p className="text-sm font-medium text-(--color-primary)">Lead intake API</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Submit leads to Rosecrest</h1>
        <p className="text-lg leading-relaxed text-slate-600">
          Send surveying and property leads directly into the Rosecrest CRM. Each partner receives a unique API key.
          Leads are stored under the <strong>THIRD_PARTY</strong> source with a source reference like{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">TP-yourname-id</code>.
        </p>
        <p className="text-sm text-slate-500">
          Base URL: <code className="break-all text-slate-700">{API_BASE_URL}</code>. Use HTTPS in production and send
          JSON requests only.
        </p>
      </DocsSection>

      <DocsSection
        id="authentication"
        title="Authentication"
        code={
          <DocsCodePanel
            label="Request header"
            code={`X-API-Key: rc_your_api_key_here`}
          />
        }
      >
        <p className="text-slate-600">
          Include your partner API key in every request using the{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">X-API-Key</code> header. Contact Rosecrest to
          obtain a key.
        </p>
        <p className="text-sm text-slate-500">
          Intake requests are rate limited to 1,000 requests per minute per IP. Rate limit responses use HTTP 429 and
          include standard <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">RateLimit-*</code> headers.
        </p>
      </DocsSection>

      <DocsSection
        id="request"
        title="Request body"
        code={
          <DocsCodePanel
            label="Example payload"
            code={EXAMPLE_LEAD_JSON}
          />
        }
      >
        <p className="text-slate-600">
          Send JSON with{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">Content-Type: application/json</code>.
        </p>

        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Required fields</h3>
          <ParamTable
            rows={[
              { name: "first_name", type: "string", required: true, description: "Customer first name" },
              { name: "last_name", type: "string", required: true, description: "Customer last name" },
              { name: "email", type: "string", required: true, description: "Customer email address" },
              { name: "phone", type: "string", required: true, description: "UK phone number (converted to E.164)" },
              { name: "postcode", type: "string", required: true, description: "Property postcode" },
              { name: "property_address", type: "string", required: true, description: "Full property address" },
            ]}
          />
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Optional fields</h3>
          <ParamTable
            rows={[
              {
                name: "id",
                type: "string",
                description: "Stable partner reference for idempotency and sourceRef generation",
              },
              {
                name: "job_type",
                type: "string",
                description:
                  "RICS_SURVEY, CPR_35_REPORT, DAMP_MOULD, STOCK_CONDITION, HOUSING_DISREPAIR, EPC, ENVIRONMENTAL, PARTY_WALL, TRADE_WORK, OTHER (defaults to RICS_SURVEY)",
              },
              { name: "survey_level", type: "string", description: "LEVEL_1, LEVEL_2, LEVEL_3, CPR_35" },
              {
                name: "customer_type",
                type: "string",
                description: "HOMEBUYER, LANDLORD, LEGAL, COUNCIL, TRADE (defaults to HOMEBUYER)",
              },
              { name: "property_value", type: "number", description: "Property value in GBP, used for pricing bands" },
              { name: "quoted_amount", type: "number", description: "Pre-quoted amount in GBP if applicable" },
              { name: "message", type: "string", description: "Additional notes from the customer, max 5,000 chars" },
              { name: "company", type: "string", description: "Company name if applicable" },
              { name: "marketing_opt_in", type: "boolean", description: "Marketing consent (default: false)" },
            ]}
          />
        </div>
      </DocsSection>

      <DocsSection id="idempotency" title="Idempotency and retries">
        <p className="text-slate-600">
          Send a stable <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">id</code> for every lead. The API
          uses it with your partner slug to build{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">sourceRef</code>, for example{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">TP-your-company-your-unique-ref-123</code>.
        </p>
        <p className="text-slate-600">
          Retrying the same <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">id</code> returns the existing
          processed event with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">deduped: true</code>. If you
          omit <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">id</code>, retries can create duplicate
          leads because the API generates a new reference.
        </p>
      </DocsSection>

      <DocsSection
        id="examples"
        title="Code examples"
        code={
          <DocsCodePanel
            label="Send a lead"
            code={getRequestSnippet(language)}
            language={language}
            languages={CODE_LANGUAGES}
            onLanguageChange={setLanguage}
          />
        }
      >
        <p className="text-slate-600">
          Choose your language. Replace{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">rc_your_api_key_here</code> with your partner
          API key.
        </p>
        <p className="text-sm text-slate-500">
          All examples POST to the same endpoint with the JSON payload shown in the request body section.
        </p>
      </DocsSection>

      <DocsSection
        id="response"
        title="Responses"
        code={
          <div className="min-w-0 space-y-6 lg:sticky lg:top-24">
            <DocsCodePanel label="201 Created" code={SUCCESS_RESPONSE} />
            <DocsCodePanel label="401 Unauthorized" code={ERROR_RESPONSE} />
            <DocsCodePanel label="400 Validation error" code={VALIDATION_ERROR_RESPONSE} />
            <DocsCodePanel label="429 Rate limited" code={RATE_LIMIT_RESPONSE} />
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">201</span>
            <span className="font-medium text-slate-900">Created</span>
          </div>
          <p className="text-slate-600">
            Returns the new lead ID, partner name, and source reference. Duplicate submissions with the same{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">id</code> return{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">deduped: true</code>.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">401</span>
            <span className="font-medium text-slate-900">Unauthorized</span>
          </div>
          <p className="text-slate-600">Returned when the API key is missing or invalid.</p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">400</span>
            <span className="font-medium text-slate-900">Validation error</span>
          </div>
          <p className="text-slate-600">
            Returned when required fields are missing or values fail validation, such as an invalid email, phone, or
            postcode.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">429</span>
            <span className="font-medium text-slate-900">Rate limited</span>
          </div>
          <p className="text-slate-600">Returned when request volume exceeds the intake rate limit.</p>
        </div>
      </DocsSection>

      <DocsSection id="errors" title="Errors & troubleshooting">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[320px] overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="px-4 py-3 font-mono text-xs">INVALID_API_KEY</td>
                <td className="px-4 py-3">Missing or incorrect X-API-Key header</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">VALIDATION_ERROR</td>
                <td className="px-4 py-3">Required field missing or invalid format</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">RATE_LIMITED</td>
                <td className="px-4 py-3">Too many requests in the current rate limit window</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Lead source reference</p>
          <p className="mt-1 text-amber-800">
            Leads are stored with source <strong>THIRD_PARTY</strong> and reference{" "}
            <code className="rounded bg-amber-100 px-1">TP-yourcompanyslug-your-id</code>. The slug is set when your
            partner account is created.
          </p>
        </div>
      </DocsSection>

      <DocsSection
        id="communications"
        code={
          <DocsCodePanel
            label="Endpoint"
            code={COMMUNICATIONS_ENDPOINT_SNIPPET}
            wrap
          />
        }
      >
        <p className="text-sm font-medium text-(--color-primary)">Communication intake API</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Push calls, SMS, and email</h2>
        <p className="text-lg leading-relaxed text-slate-600">
          Send communication events from your telephony or messaging provider into Rosecrest. Events are matched to
          existing leads by phone number or email address. If no match exists, a new lead is created automatically.
        </p>
        <p className="text-sm text-slate-500">
          Uses the same partner API key as lead intake. Events appear on the lead activity timeline; SMS and email also
          appear in the message thread.
        </p>
      </DocsSection>

      <DocsSection
        id="comm-request"
        title="Communication request body"
        code={
          <DocsCodePanel
            label={`Example ${selectedCommExample.label.toLowerCase()} payload`}
            code={selectedCommExample.code}
          />
        }
      >
        <p className="text-slate-600">
          Set <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">type</code> to{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">call</code>,{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">sms</code>, or{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">email</code>. Matching uses phone for calls/SMS
          and email for email events. Send a stable{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">external_id</code> when retrying events.
        </p>

        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Shared optional fields</h3>
          <ParamTable
            rows={[
              {
                name: "create_lead_if_missing",
                type: "boolean",
                description: "Create a new lead when no match is found (default: true)",
              },
              {
                name: "external_id",
                type: "string",
                description: "Stable event ID for idempotency, scoped to your partner and event type",
              },
              { name: "first_name", type: "string", description: "Customer first name when creating a new lead" },
              { name: "last_name", type: "string", description: "Customer last name when creating a new lead" },
              {
                name: "property_address",
                type: "string",
                description: "Property address when creating a new lead",
              },
              { name: "postcode", type: "string", description: "Property postcode when creating a new lead" },
            ]}
          />
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Call events</h3>
          <ParamTable
            rows={[
              { name: "type", type: '"call"', required: true, description: "Event type" },
              { name: "phone", type: "string", required: true, description: "Customer phone number for lead matching" },
              {
                name: "direction",
                type: "string",
                required: true,
                description: "inbound or outbound",
              },
              { name: "duration", type: "number", required: true, description: "Call duration in seconds" },
              { name: "started_at", type: "string", required: true, description: "ISO 8601 timestamp when call started" },
              { name: "ended_at", type: "string", description: "ISO 8601 timestamp when call ended" },
              { name: "summary", type: "string", description: "Call summary or notes" },
              { name: "transcript", type: "string", description: "Full call transcript" },
              { name: "recording_url", type: "string", description: "URL to call recording" },
              {
                name: "outcome",
                type: "string",
                description: "answered, voicemail, no_answer, or busy",
              },
              { name: "agent_name", type: "string", description: "Agent who handled the call" },
              { name: "from_number", type: "string", description: "Caller phone number" },
              { name: "to_number", type: "string", description: "Recipient phone number" },
              { name: "email", type: "string", description: "Customer email when creating a new lead from a call" },
            ]}
          />
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">SMS events</h3>
          <ParamTable
            rows={[
              { name: "type", type: '"sms"', required: true, description: "Event type" },
              { name: "phone", type: "string", required: true, description: "Customer phone number for lead matching" },
              {
                name: "direction",
                type: "string",
                required: true,
                description: "inbound or outbound",
              },
              { name: "body", type: "string", required: true, description: "Message content" },
              { name: "sent_at", type: "string", description: "ISO 8601 timestamp when message was sent" },
              { name: "from_number", type: "string", description: "Sender phone number" },
              { name: "to_number", type: "string", description: "Recipient phone number" },
              { name: "email", type: "string", description: "Customer email when creating a new lead from SMS" },
            ]}
          />
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Email events</h3>
          <ParamTable
            rows={[
              { name: "type", type: '"email"', required: true, description: "Event type" },
              { name: "email", type: "string", required: true, description: "Customer email for lead matching" },
              {
                name: "direction",
                type: "string",
                required: true,
                description: "inbound or outbound",
              },
              { name: "subject", type: "string", required: true, description: "Email subject" },
              { name: "body", type: "string", required: true, description: "Email body (plain text or HTML)" },
              { name: "sent_at", type: "string", description: "ISO 8601 timestamp when email was sent" },
              { name: "from_address", type: "string", description: "Sender email address" },
              { name: "to_address", type: "string", description: "Recipient email address" },
              { name: "phone", type: "string", description: "Customer phone when creating a new lead from email" },
            ]}
          />
        </div>
      </DocsSection>

      <DocsSection
        id="comm-examples"
        title="Communication code examples"
        code={
          <DocsCodePanel
            label={`Send a ${commExample} event`}
            code={getCommunicationSnippet(commLanguage, commExample)}
            language={commLanguage}
            languages={CODE_LANGUAGES}
            onLanguageChange={setCommLanguage}
          />
        }
      >
        <p className="text-slate-600">
          Choose an event type and language. All examples POST to the communications endpoint with the same API key.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {COMMUNICATION_EXAMPLES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCommExample(item.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                commExample === item.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500">
          Example payload for the selected event type is shown in the request body section above.
        </p>
      </DocsSection>

      <DocsSection
        id="comm-response"
        title="Communication responses"
        code={
          <div className="min-w-0 space-y-6 lg:sticky lg:top-24">
            <DocsCodePanel label="201 Created" code={COMMUNICATION_SUCCESS_RESPONSE} />
            <DocsCodePanel label="401 Unauthorized" code={ERROR_RESPONSE} />
            <DocsCodePanel label="404 Not found" code={COMMUNICATION_NOT_FOUND_RESPONSE} />
            <DocsCodePanel label="400 Validation error" code={VALIDATION_ERROR_RESPONSE} />
            <DocsCodePanel label="429 Rate limited" code={RATE_LIMIT_RESPONSE} />
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">201</span>
            <span className="font-medium text-slate-900">Created</span>
          </div>
          <p className="text-slate-600">
            Returns the matched or newly created lead ID, activity timeline entry, and message ID for SMS/email events.
            Duplicate submissions with the same <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">external_id</code>{" "}
            are deduplicated.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">401</span>
            <span className="font-medium text-slate-900">Unauthorized</span>
          </div>
          <p className="text-slate-600">Returned when the API key is missing or invalid.</p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">404</span>
            <span className="font-medium text-slate-900">Lead not found</span>
          </div>
          <p className="text-slate-600">
            Returned when no lead matches the phone or email and{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">create_lead_if_missing</code> is{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">false</code>.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">400</span>
            <span className="font-medium text-slate-900">Validation error</span>
          </div>
          <p className="text-slate-600">
            Returned when the event type is unsupported, a required event field is missing, or a timestamp, email, URL,
            or phone number is invalid.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">429</span>
            <span className="font-medium text-slate-900">Rate limited</span>
          </div>
          <p className="text-slate-600">Returned when request volume exceeds the intake rate limit.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Lead matching</p>
          <p className="mt-1">
            Calls and SMS are matched by phone number (last 10 digits). Email events are matched by email address. A
            customer is considered unique by email or phone number.
          </p>
        </div>
      </DocsSection>
    </ApiDocsShell>
  );
}
