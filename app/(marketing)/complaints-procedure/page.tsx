import PageJsonLd from "@/components/common/PageJsonLd";
import { ButtonLink, CheckList, PageHero, Section } from "@/components/site/primitives";
import { getPageMetadata } from "@/lib/page-metadata";

export const metadata = getPageMetadata("/complaints-procedure");

const COMPLAINTS_EMAIL = "rge@rosecrestgroupltd.co.uk";

const TIMELINE = [
  { label: "Acknowledgement", value: "Within 7 calendar days" },
  { label: "Written response", value: "Within 28 calendar days" },
  { label: "Updates provided", value: "If more time is needed" },
];

const COMMITMENTS = [
  "Treat your complaint seriously and respectfully",
  "Investigate fairly and impartially",
  "Keep clear records at every stage in line with RICS requirements",
  "Aim to resolve matters as quickly as possible",
];

function StepCard({
  number,
  title,
  subtitle,
  children,
  aside,
}: {
  number: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 rounded-[20px] border border-line bg-white p-6 md:grid-cols-[96px_minmax(0,1fr)] md:gap-6 md:p-8">
      <span aria-hidden="true" className="font-display text-[44px] font-extrabold leading-none text-teal">
        {number}
      </span>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-muted-ink">Step {Number(number)}</span>
          <h2 className="text-[24px] font-extrabold leading-[1.15] md:text-[28px]">{title}</h2>
          <span className="text-[17px] font-semibold text-ink">{subtitle}</span>
        </div>
        {aside ? (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-8">
            <div className="flex flex-col gap-3">{children}</div>
            {aside}
          </div>
        ) : (
          <div className="flex flex-col gap-3">{children}</div>
        )}
      </div>
    </div>
  );
}

function ContactPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-mist px-6 py-[22px]">{children}</div>
  );
}

export default function ComplaintsProcedurePage() {
  return (
    <>
      <PageJsonLd path="/complaints-procedure" />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Complaints procedure" }]}
        title="Complaints procedure"
        intro={
          <p>
            We take all complaints seriously and handle them promptly, fairly, and transparently, in line with RICS
            professional standards.
          </p>
        }
      />

      <Section innerClassName="gap-6">
        <p className="mb-4 max-w-[900px] text-lg text-body">
          At Rosecrest Group Ltd, we are committed to providing a high standard of service to all our clients. However,
          if something goes wrong, we want to hear from you. All complaints are handled and documented in accordance
          with RICS professional standards and regulatory requirements, ensuring a structured, consistent, and fair
          process at every stage.
        </p>

        <StepCard number="01" title="Speak to us" subtitle="Informal resolution">
          <p className="text-[17px] text-body">
            In many cases, concerns can be resolved quickly and efficiently by speaking with a member of our team. If you
            are unhappy with any aspect of our service, we encourage you to contact us in the first instance so we can
            try to resolve the issue informally.
          </p>
        </StepCard>

        <StepCard
          number="02"
          title="Submit a formal complaint"
          subtitle="Written complaint"
          aside={
            <ContactPanel>
              <b className="text-[17px]">Submit your complaint by email</b>
              <span className="text-[15px] text-body">Send your written complaint with all relevant details to:</span>
              <a
                href={`mailto:${COMPLAINTS_EMAIL}`}
                className="break-all font-bold text-teal no-underline hover:text-teal-dark"
              >
                {COMPLAINTS_EMAIL}
              </a>
            </ContactPanel>
          }
        >
          <p className="text-[17px] text-body">
            If your concern cannot be resolved informally, or you remain dissatisfied, you may submit a formal written
            complaint. This ensures we fully understand your concerns and can investigate them thoroughly.
          </p>
          <b className="text-[17px]">Please include the following in your complaint:</b>
          <ul className="m-0 flex list-disc flex-col gap-1 pl-[22px] text-[17px] text-body">
            <li>Your full name</li>
            <li>Property address (if applicable)</li>
            <li>Details of your complaint</li>
            <li>Any supporting documents</li>
          </ul>
        </StepCard>

        <StepCard
          number="03"
          title="Independent review"
          subtitle="CEDR escalation"
          aside={
            <ContactPanel>
              <b className="text-[17px]">CEDR contact details</b>
              <span className="text-[15px] text-body">
                Centre for Effective Dispute Resolution
                <br />
                100 St Paul’s Churchyard, London, EC4M 8BU
              </span>
              <a href="tel:02075366000" className="font-bold text-ink no-underline hover:text-teal">
                020 7536 6000
              </a>
              <a
                href="https://www.cedr.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-teal no-underline hover:text-teal-dark"
              >
                www.cedr.com
              </a>
            </ContactPanel>
          }
        >
          <p className="text-[17px] text-body">
            If you are not satisfied with our final response, you may refer the matter to our independent redress
            provider, the Centre for Effective Dispute Resolution (CEDR), who provide a free and impartial dispute
            resolution service for consumers.
          </p>
          <p className="text-[15px] text-body">
            <b className="text-ink">Please note:</b> CEDR does not deal with residential agency complaints.
          </p>
        </StepCard>
      </Section>

      <Section tone="mist" innerClassName="gap-7">
        <h2 className="text-[30px] font-extrabold leading-[1.1] md:text-[36px]">What happens next?</h2>
        <div className="grid gap-[18px] md:grid-cols-3">
          {TIMELINE.map((item) => (
            <div key={item.label} className="flex flex-col gap-1 rounded-[18px] border border-line bg-white p-6">
              <b className="text-[19px]">{item.label}</b>
              <span className="text-base text-body">{item.value}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section innerClassName="gap-5">
        <h2 className="text-[30px] font-extrabold leading-[1.1] md:text-[36px]">Our commitment to you</h2>
        <CheckList items={COMMITMENTS} size="lg" />
        <p className="text-[17px] text-body">
          All complaints are reviewed internally to help us improve our services and prevent similar issues in the
          future.
        </p>
      </Section>

      <section className="bg-navy-deep text-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-8 px-gutter py-12 md:py-14">
          <div className="flex flex-col gap-2">
            <h2 className="text-[28px] font-extrabold text-white md:text-[34px]">Ready to submit a complaint?</h2>
            <p className="text-lg text-navy-text">We will acknowledge your complaint within 7 calendar days.</p>
          </div>
          <ButtonLink href={`mailto:${COMPLAINTS_EMAIL}`}>Email us now</ButtonLink>
        </div>
      </section>
    </>
  );
}
