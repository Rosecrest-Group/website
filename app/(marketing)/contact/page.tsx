import Footer from "@/components/common/Footer";
import ContactForm from "@/components/common/ContactForm";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import {
  PHONE,
  PHONE_HREF,
  EMAIL,
  EMAIL_HREF,
  REGISTERED_OFFICE,
  SOCIAL_LINKS,
} from "@/lib/constants";
import { Phone, Mail, MapPin } from "lucide-react";
import { getPageMetadata } from "@/lib/page-metadata";

export const metadata = getPageMetadata("/contact");

// ─── Social icon map ──────────────────────────────────────────────────────────
const SocialIcon = ({ label }: { label: string }) => {
  if (label === "Instagram")
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-5 h-5"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    );
  if (label === "X")
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.73-8.835L2.5 2.25h6.944l4.262 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    );
  if (label === "LinkedIn")
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  if (label === "Facebook")
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    );
  return null;
};

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16">
          Contact Rosecrest
        </p>
        <p
          className={`${sourceSans.className} mt-4 mx-auto text-white text-base lg:text-xl leading-relaxed max-w-3xl`}
        >
          If you have an enquiry, need to request an inspection, or would like
          to discuss your requirements, our team will be happy to assist.
        </p>
      </JourneyHero>

      {/* Main content */}
      <section className="py-10 lg:py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto bg-[#FBF7F4] rounded-4xl p-6 lg:p-10">
          <div className="grid lg:grid-cols-[0.6fr_0.4fr] gap-8 lg:gap-12 items-start">
            {/* Left — Form */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 order-2 lg:order-1">
              <ContactForm
                title="Send an Enquiry"
                subtitle="Provide a few details about your enquiry and our team will guide you on the most appropriate next step."
                submitLabel="Submit Enquiry"
              />
            </div>

            {/* Right — Speak With Us */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 lg:py-17 space-y-8 order-1 lg:order-2">
              <h2 className="text-2xl font-bold text-[#101828]">
                Speak With Us
              </h2>

              {/* Telephone */}
              <div>
                <p className="font-semibold text-[#DBB38E] text-sm mb-2">
                  Telephone
                </p>
                <a
                  href={PHONE_HREF}
                  className={`${sourceSans.className} flex items-center gap-2 text-[#4A5565] hover:text-[#262A6F] transition-colors text-sm`}
                >
                  <Phone className="w-4 h-4 text-[#262A6F] shrink-0" />
                  {PHONE}
                </a>
              </div>

              {/* Email */}
              <div>
                <p className="font-semibold text-[#DBB38E] text-sm mb-2">
                  Email
                </p>
                <a
                  href={EMAIL_HREF}
                  className={`${sourceSans.className} flex items-center gap-2 text-[#4A5565] hover:text-[#262A6F] transition-colors text-sm`}
                >
                  <Mail className="w-4 h-4 text-[#262A6F] shrink-0" />
                  {EMAIL}
                </a>
              </div>

              {/* Registered Office */}
              <div>
                <p className="font-semibold text-[#DBB38E] text-sm mb-2">
                  Registered Office
                </p>
                <div
                  className={`${sourceSans.className} flex items-start gap-2 text-[#4A5565] text-sm`}
                >
                  <MapPin className="w-4 h-4 text-[#262A6F] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#101828]">
                      {REGISTERED_OFFICE.name}
                    </p>
                    <p>{REGISTERED_OFFICE.line1}</p>
                    <p className="mb-2">{REGISTERED_OFFICE.line2}</p>
                    <p className="text-[#6A7282] text-xs leading-relaxed">
                      {REGISTERED_OFFICE.note}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div>
                <p className="font-semibold text-[#101828] text-sm mb-3">
                  Connect With Us
                </p>
                <div className="flex items-center gap-4">
                  {SOCIAL_LINKS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="text-[#64748B] hover:text-[#262A6F] transition-colors"
                    >
                      <SocialIcon label={s.label} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Page;
