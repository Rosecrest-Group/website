"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { EMAIL, EMAIL_HREF, PHONE, PHONE_HREF, REGISTERED_OFFICE } from "@/lib/constants";
import { FOOTER_COLUMNS } from "@/lib/site-nav";
import { getAttribution } from "@/lib/attribution";
import TermsDialog from "@/components/site/TermsDialog";

/**
 * There is no mailing-list endpoint yet, so sign-ups go to the CRM through the
 * enquiry intake, tagged in the message so the team can add them to the list.
 */
function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Newsletter",
          lastName: "Subscriber",
          email,
          message: "Newsletter sign-up from the website footer: add to the monthly email.",
          attribution: getAttribution("Newsletter sign-up"),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form
      aria-label="Newsletter"
      onSubmit={onSubmit}
      className="flex flex-wrap items-center gap-4 border-b border-navy-line pb-8"
    >
      <p className="flex-[1_1_320px] text-base text-white">
        <b>Get one useful email a month.</b>{" "}
        <span className="text-navy-text">
          Compliance dates, what changed and one real case. Unsubscribe in one click.
        </span>
      </p>
      {status === "done" ? (
        <p role="status" className="text-base font-bold text-white">
          Thanks, you’re on the list.
        </p>
      ) : (
        <>
          <label className="flex w-full sm:w-auto">
            <span className="sr-only">Email address</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full rounded-[10px] border border-navy-field-line bg-navy-field px-3.5 py-3 text-[15px] text-white placeholder:text-navy-muted sm:w-[260px]"
            />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="cursor-pointer rounded-[10px] border-0 bg-teal px-5 py-[13px] text-[15px] font-bold text-white hover:bg-teal-dark disabled:opacity-60"
          >
            {status === "sending" ? "Subscribing…" : "Subscribe"}
          </button>
          {status === "error" && (
            <p role="alert" className="w-full text-sm text-navy-text">
              That didn’t go through. Please try again, or email {EMAIL}.
            </p>
          )}
        </>
      )}
    </form>
  );
}

export default function SiteFooter() {
  const [termsOpen, setTermsOpen] = useState(false);
  const linkClass = "text-navy-text no-underline hover:text-white";

  return (
    <footer className="border-t border-navy-line bg-navy-deep text-[15px] text-navy-text">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-gutter pb-10 pt-14">
        <NewsletterForm />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-10">
          <div className="flex flex-col gap-3">
            <Image
              src="/assets/images/brand/rosecrest-logo-light.webp"
              alt="Rosecrest Group Ltd"
              width={500}
              height={74}
              className="block h-[38px] w-auto self-start"
            />
            <span>
              {REGISTERED_OFFICE.line1.replace(/,$/, "")}, {REGISTERED_OFFICE.line2}
            </span>
            <a href={PHONE_HREF} className="font-bold text-white no-underline hover:text-white">
              {PHONE}
            </a>
            <span>Mon to Fri, 8am to 5pm</span>
            <a href={EMAIL_HREF} className="break-all text-white no-underline hover:text-white">
              {EMAIL}
            </a>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-2.5">
              <b className="text-white">{column.title}</b>
              {column.links.map((link) =>
                "action" in link ? (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => setTermsOpen(true)}
                    className={`cursor-pointer border-0 bg-transparent p-0 text-left ${linkClass}`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link key={link.href} href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-navy-line pt-5 text-[13px] text-navy-muted">
          <span>Rosecrest Group Ltd</span>
          <span>RICS-regulated firm</span>
        </div>
      </div>
      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
    </footer>
  );
}
