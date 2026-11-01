import type { Metadata } from "next";
import { Check } from "lucide-react";
import { EMAIL_HREF, PHONE, PHONE_HREF } from "@/lib/constants";
import CallbackSection from "@/components/site/CallbackSection";
import { ButtonLink, Eyebrow, Section, SectionHeading, SmartLink, StepNumber } from "@/components/site/primitives";

// Block search engines: this page should only be reached via a form
// submission, not indexed as organic content. The pageview itself is the
// GA4 / Google Ads conversion, so every lead form routes here on success.
export const metadata: Metadata = {
  title: "Thank You | Rosecrest Group",
  description: "Your enquiry has been received. A member of our team will be in touch shortly.",
  robots: {
    index: false,
    follow: false,
  },
};

const NEXT_STEPS = [
  {
    title: "Enquiry received",
    text: "Your details have been passed to the relevant team member for review.",
  },
  {
    title: "Within one working day",
    text: "We will call or email to confirm your requirements and discuss timescales.",
  },
  {
    title: "Formal quotation",
    text: "You will receive a written quotation outlining scope, fees and next actions.",
  },
];

const QUICK_LINKS = [
  { label: "Our services", href: "/services" },
  { label: "Areas we cover", href: "/areas-we-cover" },
  { label: "About Rosecrest", href: "/about" },
  { label: "Guides and insights", href: "/guides" },
  { label: "Back to homepage", href: "/" },
];

const outlineButton =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-xl border-2 border-line-strong bg-white px-5 py-[13px] text-base font-bold text-ink no-underline transition-colors hover:border-teal hover:text-ink";

export default function ThankYouPage() {
  return (
    <>
      <Section tone="mist">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-[22px] text-center">
          <span
            aria-hidden="true"
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl bg-teal-tint text-teal"
          >
            <Check className="h-6 w-6" strokeWidth={2} />
          </span>
          <Eyebrow>Enquiry received</Eyebrow>
          <h1 className="text-[36px] font-extrabold leading-[1.05] md:text-[52px]">
            Thank you, we’ll be in touch shortly
          </h1>
          <p className="text-lg text-body md:text-xl">
            A member of the Rosecrest team will review your enquiry and respond within one working day. If your matter
            is urgent, please call us directly using the number below.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/">Back to homepage</ButtonLink>
            <SmartLink href="/services" className={outlineButton}>
              Browse our services
            </SmartLink>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading title="What happens next" intro="Here’s what to expect from our team in the coming days." />
        <ol className="m-0 grid list-none gap-[18px] p-0 md:grid-cols-3">
          {NEXT_STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-[26px]">
              <StepNumber n={i + 1} />
              <b className="text-lg text-ink">{step.title}</b>
              <span className="text-[15px] text-body">{step.text}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="mist">
        <div className="flex max-w-[820px] flex-col gap-4">
          <Eyebrow>Need to speak now?</Eyebrow>
          <h2 className="text-[28px] font-extrabold leading-[1.1] md:text-[38px]">
            Our team is available during office hours
          </h2>
          <p className="text-[17px] text-body">
            If your enquiry is time-sensitive, reach out directly and we’ll do our best to assist immediately. Office
            hours are Mon to Fri, 8am to 5pm.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={PHONE_HREF}>{PHONE}</ButtonLink>
            <a href={EMAIL_HREF} className={outlineButton}>
              Email us
            </a>
          </div>
        </div>
      </Section>

      <Section innerClassName="gap-7">
        <div className="flex max-w-[820px] flex-col gap-3">
          <Eyebrow>While you’re here</Eyebrow>
          <h2 className="text-[30px] font-extrabold leading-[1.08] md:text-[40px]">Explore the rest of the site</h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {QUICK_LINKS.map((link) => (
            <SmartLink
              key={link.href}
              href={link.href}
              className="rounded-full border border-line bg-white px-4 py-[9px] text-[15px] text-ink no-underline hover:border-teal hover:text-ink"
            >
              {link.label}
            </SmartLink>
          ))}
        </div>
      </Section>

      <CallbackSection formName="Thank-you page call back" />
    </>
  );
}
