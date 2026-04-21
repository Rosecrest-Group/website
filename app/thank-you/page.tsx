import type { Metadata } from "next";
import Link from "next/link";
import { sourceSans } from "@/lib/fonts";
import Footer from "@/components/common/Footer";
import { Reveal } from "@/components/common/Reveal";
import {
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  Home,
  Clock,
  FileText,
  MessageCircle,
} from "lucide-react";

// Block search engines — this page should only be reached via a form
// submission, not indexed as organic content.
export const metadata: Metadata = {
  title: "Thank You | Rosecrest Group",
  description:
    "Your enquiry has been received. A member of our team will be in touch shortly.",
  robots: {
    index: false,
    follow: false,
  },
};

const quickLinks = [
  { label: "Our Services", href: "/services" },
  { label: "Areas We Cover", href: "/areas-we-cover" },
  { label: "About Rosecrest", href: "/about" },
  { label: "Blog & Insights", href: "/blog" },
];

const nextSteps = [
  {
    icon: CheckCircle2,
    title: "Enquiry received",
    description:
      "Your details have been passed to the relevant team member for review.",
  },
  {
    icon: Clock,
    title: "Within one working day",
    description:
      "We will call or email to confirm your requirements and discuss timescales.",
  },
  {
    icon: FileText,
    title: "Formal quotation",
    description:
      "You will receive a written quotation outlining scope, fees and next actions.",
  },
];

export default function ThankYouPage() {
  return (
    <div className="bg-[#FBF7F4] min-h-screen flex flex-col">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-[#262A6F] text-white px-4 py-24 lg:py-36 lg:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal animation="fade-up" duration={500}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#DBB38E]/20 mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#DBB38E]" />
            </div>
          </Reveal>

          <Reveal animation="fade-up" duration={500} delay={100}>
            <p
              className={`${sourceSans.className} text-[#DBB38E] text-sm font-semibold uppercase tracking-widest mb-4`}
            >
              Enquiry Received
            </p>
          </Reveal>

          <Reveal animation="fade-up" duration={500} delay={200}>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
              Thank you — we&apos;ll be in touch shortly
            </h1>
          </Reveal>

          <Reveal animation="fade-up" duration={500} delay={300}>
            <p
              className={`${sourceSans.className} text-white/80 text-lg max-w-2xl mx-auto mb-10`}
            >
              A member of the Rosecrest team will review your enquiry and
              respond within one working day. If your matter is urgent, please
              call us directly using the number below.
            </p>
          </Reveal>

          <Reveal animation="fade-up" duration={500} delay={400}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#DBB38E] hover:bg-[#DBB38E]/90 text-[#262A6F] font-semibold rounded-full px-8 py-3.5 transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to homepage
              </Link>
              <Link
                href="/services"
                className={`${sourceSans.className} inline-flex items-center gap-2 text-white/90 hover:text-white font-semibold rounded-full px-6 py-3.5 transition-colors group`}
              >
                Browse our services
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── What Happens Next ───────────────────────────────────────────── */}
      <section className="px-4 py-16 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <Reveal animation="fade-up" duration={500}>
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#101828] mb-3">
                What happens next
              </h2>
              <p
                className={`${sourceSans.className} text-[#4A5565] max-w-xl mx-auto`}
              >
                Here&apos;s what to expect from our team in the coming days.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {nextSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal
                  key={step.title}
                  animation="fade-up"
                  duration={500}
                  delay={150 + i * 120}
                >
                  <div className="bg-white rounded-3xl p-6 lg:p-8 h-full border border-[#E5E7EB]/60">
                    <div className="w-12 h-12 rounded-full bg-[#262A6F]/5 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-[#262A6F]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#101828] mb-2">
                      {step.title}
                    </h3>
                    <p
                      className={`${sourceSans.className} text-[#4A5565] text-sm leading-relaxed`}
                    >
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Contact / Quick Links ───────────────────────────────────────── */}
      <section className="px-4 pb-16 lg:pb-24">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6">
          {/* Need to speak now? */}
          <Reveal animation="fade-up" duration={500}>
            <div className="bg-[#262A6F] text-white rounded-3xl p-8 lg:p-10 h-full">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-[#DBB38E]" />
                <p
                  className={`${sourceSans.className} text-[#DBB38E] text-sm font-semibold uppercase tracking-widest`}
                >
                  Need to speak now?
                </p>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Our team is available during office hours
              </h2>
              <p
                className={`${sourceSans.className} text-white/80 mb-8 leading-relaxed`}
              >
                If your enquiry is time-sensitive, reach out directly and
                we&apos;ll do our best to assist immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:02030111144"
                  className="inline-flex items-center justify-center gap-2 bg-[#DBB38E] hover:bg-[#DBB38E]/90 text-[#262A6F] font-semibold rounded-full px-6 py-3 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  020 3011 1144
                </a>
                <a
                  href="mailto:info@rosecrestgroupltd.co.uk"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full px-6 py-3 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email us
                </a>
              </div>
            </div>
          </Reveal>

          {/* Quick links */}
          <Reveal animation="fade-up" duration={500} delay={120}>
            <div className="bg-white rounded-3xl p-8 lg:p-10 h-full border border-[#E5E7EB]/60">
              <p
                className={`${sourceSans.className} text-[#262A6F] text-sm font-semibold uppercase tracking-widest mb-3`}
              >
                While you&apos;re here
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold text-[#101828] mb-6">
                Explore the rest of the site
              </h2>
              <ul className="space-y-1">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`${sourceSans.className} group flex items-center justify-between py-3 border-b border-[#E5E7EB]/70 text-[#101828] hover:text-[#262A6F] transition-colors`}
                    >
                      <span className="font-medium">{link.label}</span>
                      <ArrowRight className="w-4 h-4 text-[#4A5565] group-hover:text-[#262A6F] group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-6 text-[#262A6F] font-semibold hover:gap-3 transition-all"
              >
                <Home className="w-4 h-4" />
                Back to homepage
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
