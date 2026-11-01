import { getPageMetadata } from "@/lib/page-metadata";
import { EMAIL, EMAIL_HREF, PHONE, PHONE_HREF, REGISTERED_OFFICE, SOCIAL_LINKS } from "@/lib/constants";
import PageJsonLd from "@/components/common/PageJsonLd";
import EnquiryForm from "@/components/site/contact/EnquiryForm";
import { Breadcrumbs, Eyebrow } from "@/components/site/primitives";

export const metadata = getPageMetadata("/contact");

// Design order: LinkedIn, Facebook, Instagram.
const SOCIALS = ["LinkedIn", "Facebook", "Instagram"]
  .map((label) => SOCIAL_LINKS.find((s) => s.label === label))
  .filter((s): s is (typeof SOCIAL_LINKS)[number] => Boolean(s));

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-t border-line py-[18px]">
      <b className="text-[13px] uppercase tracking-[0.06em] text-muted-ink">{label}</b>
      {children}
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageJsonLd path="/contact" />

      <section className="bg-mist text-ink">
        <div className="mx-auto w-full max-w-[1440px] px-gutter pb-16 pt-4 md:pb-24">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
          <div className="mt-10 flex flex-col gap-12 md:mt-14">
            <div className="flex max-w-[820px] flex-col gap-4">
              <Eyebrow>Talk to us</Eyebrow>
              <h1 className="text-[38px] font-extrabold leading-[1.04] md:text-[52px]">Contact Rosecrest</h1>
              <p className="text-xl text-body">
                If you have an enquiry, need to request an inspection, or would like to discuss your requirements, our
                trusted advisors will be happy to assist.
              </p>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12">
              <EnquiryForm
                title="Send an enquiry"
                intro="Provide a few details about your enquiry and our team will guide you on the most appropriate next step."
                submitLabel="Submit enquiry"
                formName="Contact page enquiry"
              />

              <div className="flex flex-col rounded-3xl border border-line bg-white px-6 pb-3.5 pt-7 md:px-8 md:pt-8">
                <h2 className="mb-[18px] text-[24px] font-extrabold leading-[1.15] md:text-[28px]">Speak with us</h2>
                <ContactRow label="Telephone">
                  <a href={PHONE_HREF} className="text-xl font-bold text-ink no-underline hover:text-teal">
                    {PHONE}
                  </a>
                </ContactRow>
                <ContactRow label="Email">
                  <a
                    href={EMAIL_HREF}
                    className="break-all text-[17px] font-semibold text-teal no-underline hover:text-teal-dark"
                  >
                    {EMAIL}
                  </a>
                </ContactRow>
                <ContactRow label="Opening hours">
                  <span className="text-[17px]">Mon to Fri, 8am to 5pm</span>
                  <span className="text-[15px] text-muted-ink">
                    Calls are answered by our trusted advisors, who will point you to the right service.
                  </span>
                </ContactRow>
                <ContactRow label="Registered office">
                  <address className="text-[17px] not-italic">
                    {REGISTERED_OFFICE.name}
                    <br />
                    {REGISTERED_OFFICE.line1}
                    <br />
                    {REGISTERED_OFFICE.line2}
                  </address>
                  <span className="text-[15px] text-muted-ink">{REGISTERED_OFFICE.note}</span>
                </ContactRow>
                <ContactRow label="Connect with us">
                  <span className="mt-1.5 flex flex-wrap gap-2.5">
                    {SOCIALS.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-line px-3.5 py-2 text-sm font-bold text-ink no-underline hover:border-teal hover:text-ink"
                      >
                        {s.label}
                      </a>
                    ))}
                  </span>
                </ContactRow>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
