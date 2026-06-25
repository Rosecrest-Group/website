"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { CodeLanguage } from "@/crm/lib/apiDocsSnippets";

export default function CodeBlock({
  code,
  language,
  languages,
  onLanguageChange,
}: {
  code: string;
  language?: CodeLanguage;
  languages?: { id: CodeLanguage; label: string }[];
  onLanguageChange?: (lang: CodeLanguage) => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
        {languages && languages.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {languages.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => onLanguageChange?.(lang.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  language === lang.id
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs font-medium text-slate-400">JSON</span>
        )}
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
