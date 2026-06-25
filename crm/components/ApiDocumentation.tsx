"use client";

import { useState } from "react";
import ApiDocsShell from "@/crm/components/docs/ApiDocsShell";
import CodeBlock from "@/crm/components/docs/CodeBlock";
import {
  API_BASE_URL,
  CODE_LANGUAGES,
  ERROR_RESPONSE,
  INTAKE_ENDPOINT,
  SUCCESS_RESPONSE,
  getRequestSnippet,
  type CodeLanguage,
} from "@/crm/lib/apiDocsSnippets";

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-28 text-2xl font-semibold tracking-tight text-slate-900">
      {children}
    </h2>
  );
}

function ParamTable({
  rows,
}: {
  rows: { name: string; type: string; required?: boolean; description: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
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
  );
}

export default function ApiDocumentation() {
  const [language, setLanguage] = useState<CodeLanguage>("curl");

  return (
    <ApiDocsShell>
      <div className="space-y-14">
        <section className="space-y-4">
          <p className="text-sm font-medium text-(--color-primary)">Lead intake API</p>
          <h1 id="overview" className="scroll-mt-28 text-4xl font-bold tracking-tight text-slate-900">
            Submit leads to Rosecrest
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
            Send surveying and property leads directly into the Rosecrest CRM. Each partner receives a unique API key.
            Leads appear with source reference <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">TP-yourname-id</code>.
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                POST
              </span>
              <code className="text-sm text-slate-800">{INTAKE_ENDPOINT}</code>
            </div>
            <p className="text-sm text-slate-600">
              Base URL: <code className="text-slate-800">{API_BASE_URL}</code>
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle id="authentication">Authentication</SectionTitle>
          <p className="text-slate-600">
            Include your partner API key in every request using the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">X-API-Key</code> header.
            Contact Rosecrest to obtain a key.
          </p>
          <CodeBlock code={`X-API-Key: rc_your_api_key_here`} />
        </section>

        <section className="space-y-6">
          <SectionTitle id="request">Request body</SectionTitle>
          <p className="text-slate-600">Send JSON with <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">Content-Type: application/json</code>.</p>

          <div className="space-y-3">
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

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Optional fields</h3>
            <ParamTable
              rows={[
                { name: "id", type: "string", description: "Your unique reference ID for deduplication" },
                {
                  name: "job_type",
                  type: "string",
                  description:
                    "RICS_SURVEY, CPR_35_REPORT, DAMP_MOULD, STOCK_CONDITION, HOUSING_DISREPAIR, EPC, ENVIRONMENTAL, PARTY_WALL, TRADE_WORK, OTHER",
                },
                { name: "survey_level", type: "string", description: "LEVEL_1, LEVEL_2, LEVEL_3, CPR_35" },
                { name: "customer_type", type: "string", description: "HOMEBUYER, LANDLORD, LEGAL, COUNCIL, TRADE" },
                { name: "property_value", type: "number", description: "Property value in GBP" },
                { name: "quoted_amount", type: "number", description: "Pre-quoted amount if applicable" },
                { name: "message", type: "string", description: "Additional notes from the customer" },
                { name: "company", type: "string", description: "Company name if applicable" },
                { name: "marketing_opt_in", type: "boolean", description: "Marketing consent (default: false)" },
              ]}
            />
          </div>
        </section>

        <section className="space-y-6">
          <SectionTitle id="response">Responses</SectionTitle>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">201</span>
              <span className="font-medium text-slate-900">Created</span>
            </div>
            <CodeBlock code={SUCCESS_RESPONSE} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">401</span>
              <span className="font-medium text-slate-900">Unauthorized</span>
            </div>
            <CodeBlock code={ERROR_RESPONSE} />
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle id="examples">Code examples</SectionTitle>
          <p className="text-slate-600">
            Choose your language. Replace <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">rc_your_api_key_here</code> with your partner API key.
          </p>
          <CodeBlock
            code={getRequestSnippet(language)}
            language={language}
            languages={CODE_LANGUAGES}
            onLanguageChange={setLanguage}
          />
        </section>

        <section className="space-y-4">
          <SectionTitle id="errors">Errors &amp; troubleshooting</SectionTitle>
          <div className="overflow-hidden rounded-xl border border-slate-200">
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
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Lead source reference</p>
            <p className="mt-1 text-amber-800">
              Leads are stored with source <strong>THIRD_PARTY</strong> and reference{" "}
              <code className="rounded bg-amber-100 px-1">TP-yourcompanyslug-your-id</code>. The slug is set when your partner account is created.
            </p>
          </div>
        </section>
      </div>
    </ApiDocsShell>
  );
}
