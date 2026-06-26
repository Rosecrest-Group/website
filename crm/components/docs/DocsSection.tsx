"use client";

import type { ReactNode } from "react";
import CodeBlock from "@/crm/components/docs/CodeBlock";
import type { CodeLanguage } from "@/crm/lib/apiDocsSnippets";

type CodePanelProps = {
  code: string;
  language?: CodeLanguage;
  languages?: { id: CodeLanguage; label: string }[];
  onLanguageChange?: (lang: CodeLanguage) => void;
  label?: string;
  wrap?: boolean;
};

export function DocsCodePanel({
  code,
  language,
  languages,
  onLanguageChange,
  label,
  wrap = false,
}: CodePanelProps) {
  return (
    <div className="w-full min-w-0 max-w-full lg:sticky lg:top-24 lg:self-start">
      {label ? <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p> : null}
      <CodeBlock
        code={code}
        language={language}
        languages={languages}
        onLanguageChange={onLanguageChange}
        wrap={wrap}
      />
    </div>
  );
}

export default function DocsSection({
  id,
  title,
  children,
  code,
}: {
  id: string;
  title?: string;
  children: ReactNode;
  code?: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-slate-100 py-10 last:border-b-0 sm:py-14">
      <div
        className={
          code
            ? "grid min-w-0 items-start gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_460px]"
            : "max-w-3xl min-w-0"
        }
      >
        <div className="min-w-0 space-y-4 overflow-hidden">
          {title ? (
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
          ) : null}
          {children}
        </div>
        {code ? <div className="min-w-0">{code}</div> : null}
      </div>
    </section>
  );
}
