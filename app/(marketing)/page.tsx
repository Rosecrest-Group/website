import Image from "next/image";
import { Building2, Check, Home as HomeIcon, KeyRound, Phone, Scale } from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";
import { PHONE, PHONE_HREF } from "@/lib/constants";
import PageJsonLd from "@/components/common/PageJsonLd";
import CallbackSection from "@/components/site/CallbackSection";
import TrustBadges from "@/components/site/TrustBadges";
import { ButtonLink, Eyebrow, IconTile, NavyPanel, Section, TextLink } from "@/components/site/primitives";

export const metadata = getPageMetadata("/");

const LANES = [
  {
    icon: HomeIcon,
    title: "I’m buying a property",
    service: "RICS Level 1, 2 and 3 surveys",
    text: "Homebuyer surveys and clear advice before you commit",
    href: "/homebuyer",
    cta: "Choose the right survey →",
  },
  {
    icon: KeyRound,
    title: "I’m a landlord or property owner",
    service: "Damp, mould and condensation surveys and mould treatment",
    text: "Compliance, condition and disrepair reports",
    href: "/landlord",
    cta: "Get an estimate →",
  },
  {
    icon: Scale,
    title: "I’m a solicitor or legal professional",
    service: "Expert witness surveyors for property claims",
    text: "Independent expert and CPR-35 compliant reports",
    href: "/legal",
    cta: "Instruct an expert →",
  },
  {
    icon: Building2,
    title: "I represent a council or organisation",
    service: "Councils, housing associations and contractors",
    text: "Framework-ready property inspections and consultancy",
    href: "/councils",
    cta: "Book a call →",
  },
];

const REASONS = [
  {
    title: "Qualified and experienced surveyors",
    text: <>You know who is coming and who you’re dealing with.</>,
  },
  { title: "Fees agreed up front", text: <>You see the fee before you commit to anything.</> },
  { title: "Independent where it counts", text: <>A conflict check on every expert witness instruction.</> },
  {
    title: "London and the M25",
    text: (
      <>
        All 32 boroughs, the City of London and nearby towns. <TextLink href="/areas-we-cover">See areas</TextLink>
      </>
    ),
  },
];

export default function Home() {
  return (
    <>
      <PageJsonLd path="/" />

      {/*
        Hero: who we are, one contact action. The text sits on solid navy and the cover photo
        from the previous site fills the right-hand side (a band under the text on phones),
        so the photo never sits behind the words.
      */}
      <section id="start" className="relative isolate overflow-hidden bg-navy-deep text-white">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 hidden w-[50%] lg:block">
          <Image
            src="/assets/images/landing-hero.png"
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-navy-deep to-transparent" />
        </div>
        <div className="mx-auto w-full max-w-[1440px] px-gutter pb-12 pt-10 md:pb-16 md:pt-14">
          <div className="flex flex-col gap-[22px] lg:w-1/2 lg:pr-12">
            <h1 className="text-balance text-[38px] font-extrabold leading-[1.04] md:text-[clamp(38px,3.8vw,54px)]">
              RICS-regulated surveyors for London and the M25
            </h1>
            <p className="text-lg text-navy-soft md:text-xl">
              Surveys, inspections and expert reports, each carried out by our qualified and experienced surveyors. Tell
              us who you are and we’ll take you straight to the right service.
            </p>
            <div className="flex flex-wrap items-center gap-x-[22px] gap-y-3.5">
              <ButtonLink href={PHONE_HREF} size="lg">
                <Phone aria-hidden="true" className="h-5 w-5" />
                Call {PHONE}
              </ButtonLink>
              <span className="text-[15px] text-navy-soft">
                Mon to Fri, 8am to 5pm · or{" "}
                <a href="#callback" className="font-bold text-white underline underline-offset-4 hover:text-white">
                  request a call back
                </a>
              </span>
            </div>
          </div>
        </div>
        <div className="relative h-56 sm:h-72 lg:hidden">
          <Image
            src="/assets/images/landing-hero.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[center_40%]"
          />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-navy-deep to-transparent" />
        </div>
      </section>

      {/* The selector: identify the visitor first, then route them to their own page */}
      <Section id="help" className="md:py-[72px]" innerClassName="gap-8">
        <div className="flex max-w-[760px] flex-col gap-2.5">
          <h2 className="text-[30px] font-extrabold leading-[1.1] md:text-[40px]">What do you need help with today?</h2>
          <p className="text-lg text-body">
            Select the option that best describes you and we’ll guide you to the right service.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-[18px]">
          {LANES.map((lane) => (
            <div key={lane.href} className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-[26px]">
              <IconTile>
                <lane.icon className="h-6 w-6" strokeWidth={2} />
              </IconTile>
              <h3 className="text-[22px] font-bold leading-[1.2]">{lane.title}</h3>
              <p className="text-base font-semibold">{lane.service}</p>
              <p className="text-[15px] text-body">{lane.text}</p>
              <ButtonLink href={lane.href} size="sm" className="mt-auto self-start">
                {lane.cta}
              </ButtonLink>
            </div>
          ))}
        </div>
        <p className="text-[15px] text-body">
          Planning work on a shared wall? See <TextLink href="/services/party-wall">party wall surveys</TextLink>.
          Looking for something else? See <TextLink href="/services">all services</TextLink>.
        </p>
        <NavyPanel
          title="Not sure which option applies to you?"
          text="Property problems rarely fit one box. Tell us what’s going on and our trusted advisors will point you to the right service."
          actions={
            <>
              <ButtonLink href="#callback" variant="light" size="sm">
                Request a call back
              </ButtonLink>
              <a href={PHONE_HREF} className="text-[15px] font-bold text-white no-underline hover:text-white">
                or call {PHONE}
              </a>
            </>
          }
        />
      </Section>

      {/* Trust badges and a compact why Rosecrest strip */}
      <Section tone="mist" className="md:py-16" innerClassName="gap-7">
        <div className="flex flex-col gap-2">
          <Eyebrow>Check before you work with us</Eyebrow>
          <h2 className="text-[26px] font-extrabold leading-[1.15] md:text-[32px]">Regulated and accredited</h2>
        </div>
        <div className="rounded-[18px] border border-line bg-white px-5 py-7 md:px-10">
          <TrustBadges />
        </div>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-6 p-0">
          {REASONS.map((reason) => (
            <li key={reason.title} className="flex items-start gap-3">
              <Check aria-hidden="true" className="mt-0.5 h-[22px] w-[22px] shrink-0 text-teal" strokeWidth={2.4} />
              <span className="flex flex-col gap-1">
                <b className="text-[17px]">{reason.title}</b>
                <span className="text-[15px] text-body">{reason.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <CallbackSection eyebrow="Request a call back" formName="Homepage call back" />
    </>
  );
}
