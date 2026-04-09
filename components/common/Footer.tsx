"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { sourceSans } from "@/lib/fonts";
import TermsModal from "@/components/common/TermsModal";
import {
  PHONE,
  PHONE_HREF,
  EMAIL,
  EMAIL_HREF,
  REGISTERED_OFFICE,
  SOCIAL_LINKS,
} from "@/lib/constants";

interface QuickLink {
  label: string;
  href: string;
  onClick?: () => void;
}

interface FooterProps {
  quickLinks?: QuickLink[];
}

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

const Footer: React.FC<FooterProps> = ({ quickLinks }) => {
  const [termsOpen, setTermsOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const defaultQuickLinksCol1: QuickLink[] = [
    { label: "Services", href: "/services" },
    { label: "About Rosecrest", href: "/about" },
    { label: "Areas we cover", href: "/areas-we-cover" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "FAQs", href: "/faqs" },
  ];

  const defaultQuickLinksCol2: QuickLink[] = [
    {
      label: "Terms of Engagement",
      href: "#",
      onClick: () => setTermsOpen(true),
    },
    { label: "Complaints Procedure", href: "#" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ];

  const col1 = quickLinks ?? defaultQuickLinksCol1;
  const col2 = quickLinks ? [] : defaultQuickLinksCol2;

  const contactInfo = [
    { icon: Mail, label: EMAIL, href: EMAIL_HREF },
    { icon: Phone, label: PHONE, href: PHONE_HREF },
    {
      icon: MapPin,
      label: `${REGISTERED_OFFICE.line1} ${REGISTERED_OFFICE.line2}`,
      href: "#",
    },
  ];

  const accreditations = [
    "RICS Regulated",
    "Constructionline Gold",
    "SafeContractor",
    "Professional Indemnity Insured",
  ];

  const linkClass = `${sourceSans.className} text-[#64748B] hover:text-[#1E3A8A] transition-colors text-sm lg:text-base`;

  return (
    <>
      <footer className="w-full bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
            {/* Column 1: Logo & Description */}
            <div className="space-y-6">
              <Link href="/">
                <Image
                  src="/assets/svgs/logo-blue.svg"
                  alt="Rosecrest Group Ltd"
                  width={350}
                  height={54}
                  className="-ml-1.5"
                />
              </Link>
              <p
                className={`${sourceSans.className} text-[#64748B] text-sm lg:text-base leading-relaxed max-w-sm`}
              >
                Rosecrest Group Ltd delivers trusted building, maintenance, and
                property care solutions across London and the surrounding areas within the M25.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:ml-28">
              <h3 className="font-semibold text-[#DBB38E] text-lg mb-6">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {col1.map((link, i) => (
                  <li key={i}>
                    {link.onClick ? (
                      <button
                        onClick={link.onClick}
                        className={`${linkClass} text-left`}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Legal */}
            {col2.length > 0 && (
              <div className="md:ml-12">
                <h3 className="font-semibold text-[#DBB38E] text-lg mb-6">
                  Legal
                </h3>
                <ul className="space-y-3">
                  {col2.map((link, i) => (
                    <li key={i}>
                      {link.onClick ? (
                        <button
                          onClick={link.onClick}
                          className={`${linkClass} text-left`}
                        >
                          {link.label}
                        </button>
                      ) : (
                        <Link href={link.href} className={linkClass}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Column 4: Get in Touch + Socials */}
            <div>
              <h3 className="font-semibold text-[#DBB38E] text-lg mb-6">
                Get in Touch
              </h3>
              <ul className="space-y-4 mb-8">
                {contactInfo.map((item, i) => (
                  <li key={i}>
                    <a
                      href={item.href}
                      className={`${sourceSans.className} flex items-start gap-3 text-[#64748B] hover:text-[#1E3A8A] transition-colors text-sm lg:text-base`}
                    >
                      <item.icon className="w-5 h-5 shrink-0 text-[#1E3A8A] mt-0.5" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>

              {/* Social icons from constants */}
              <div className="flex items-center gap-4">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="text-[#64748B] hover:text-[#1E3A8A] transition-colors"
                  >
                    <SocialIcon label={s.label} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p
                className={`${sourceSans.className} text-[#64748B] text-sm text-center md:text-left`}
              >
                © {currentYear} Rosecrest Group Ltd. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 lg:gap-5">
                {accreditations.map((a, i) => (
                  <React.Fragment key={i}>
                    <span
                      className={`${sourceSans.className} text-[#64748B] text-xs lg:text-sm`}
                    >
                      {a}
                    </span>
                    {i < accreditations.length - 1 && (
                      <span className="text-[#CBD5E1]">•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </>
  );
};

export default Footer;
