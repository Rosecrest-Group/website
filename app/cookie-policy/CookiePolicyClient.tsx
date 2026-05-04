"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { sourceSans } from "@/lib/fonts";


// ─── Types ───────────────────────────────────────────────────────────────────

interface CookieRow {
  name: string;
  nameHref?: string;
  expiration?: string;
  function?: string;
}

interface CookieGroup {
  label: string; // "Functional" | "Purpose pending investigation"
  rows: CookieRow[];
}

interface CookieProvider {
  name: string;
  usage?: string;
  usageHref?: string;
  sharing?: string;
  sharingHref?: string;
  groups: CookieGroup[];
}


// ─── Placed Cookies data ──────────────────────────────────────────────────────

const cookieProviders: CookieProvider[] = [
  {
    name: "WordPress",
    usage: "We use WordPress for website development.",
    usageHref: "https://wordpress.org",
    sharing: "This data is not shared with third parties.",
    groups: [
      {
        label: "Functional",
        rows: [
          { name: "WP_PREFERENCES_USER_*", nameHref: "#", expiration: "persistent", function: "Store user preferences" },
          { name: "wpEmojiSettingsSupports", nameHref: "#", expiration: "session", function: "Store browser details" },
          { name: "wp-settings-*", nameHref: "#", expiration: "persistent", function: "Store user preferences" },
          { name: "wp-settings-time-*", nameHref: "#", expiration: "1 year", function: "Store user preferences" },
          { name: "wordpress_test_cookie", nameHref: "#", expiration: "session", function: "Read if cookies can be placed" },
          { name: "wordpress_logged_in_*", nameHref: "#", expiration: "persistent", function: "Store logged in users" },
        ],
      },
    ],
  },
  {
    name: "Google reCAPTCHA",
    usage: "We use Google reCAPTCHA for spam prevention.",
    usageHref: "https://policies.google.com/privacy",
    sharing: "For more information, please read the Google reCAPTCHA Privacy Statement.",
    sharingHref: "https://policies.google.com/privacy",
    groups: [
      {
        label: "Functional",
        rows: [
          { name: "_grecaptcha", nameHref: "#", expiration: "6 months", function: "Provide spam protection" },
        ],
      },
      {
        label: "Purpose pending investigation",
        rows: [
          { name: "rc::a" },
          { name: "rc::b" },
          { name: "rc::c" },
        ],
      },
    ],
  },
  {
    name: "Miscellaneous",
    sharing: "Sharing of data is pending investigation",
    groups: [
      {
        label: "Purpose pending investigation",
        rows: [
          { name: "cmplz_functional", expiration: "365 days" },
          { name: "cmplz_preferences", expiration: "365 days" },
          { name: "cmplz_marketing", expiration: "365 days" },
          { name: "cmplz_consented_services", expiration: "365 days" },
          { name: "scribe_extension_state" },
          { name: "debug" },
          { name: "cmplz_banner-status", expiration: "365 days" },
          { name: "_gcl_au" },
          { name: "_ga" },
          { name: "rank-math-option-general-index" },
          { name: "rank-math-option-sitemap-index" },
          { name: "rank-math-option-titles-index" },
          { name: "_gcl_ls" },
          { name: "rank-math-option-search-index" },
          { name: "_clck" },
          { name: "_clsk" },
          { name: "wp_lang" },
          { name: "stackprotect" },
          { name: "_cfk" },
          { name: "adobeCleanFontAdded" },
          { name: "cmplz_policy_id", expiration: "365 days" },
          { name: "cmplz_statistics", expiration: "365 days" },
          { name: "WP_DATA_USER_1" },
          { name: "popupClosed" },
          { name: "wpcodeScrollPosition" },
          { name: "wlv5a3am4efzf84AIAll_68796c2175d4a1e292330b30_lead-connecter-live-widget-message-data" },
          { name: "v2_contact_session_wlv5a3am4efzf84AIAll_session_id" },
          { name: "v2_history_wlv5a3am4efzf84AIALL" },
          { name: "v2_session_history_wlv5a3am4efzf84AIALL" },
          { name: "wlv5a3am4efzf84AIAll_lead-connecter-text-widget-prompt-dismissed" },
          { name: "lead-connecter-text-widget-input-values" },
        ],
      },
    ],
  },
];

// ─── CookieProviderAccordion ──────────────────────────────────────────────────

function CookieProviderAccordion({ provider, defaultOpen = false }: { provider: CookieProvider; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-semibold text-[#101828] text-base">{provider.name}</span>
        <span
          className={`w-8 h-8 rounded-full bg-[#262A6F] text-white flex items-center justify-center shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 bg-white border-t border-gray-100">
          {/* Usage & sharing */}
          {provider.usage && (
            <p className={`${sourceSans.className} text-sm text-[#4A5565] mt-4 mb-1`}>
              <span className="font-semibold text-[#101828]">Usage: </span>
              {provider.usage}{" "}
              {provider.usageHref && (
                <a href={provider.usageHref} target="_blank" rel="noopener noreferrer" className="text-[#262A6F] underline inline-flex items-center gap-0.5">
                  Read more about {provider.name} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </p>
          )}
          {provider.sharing && (
            <p className={`${sourceSans.className} text-sm text-[#4A5565] mb-4`}>
              <span className="font-semibold text-[#101828]">Sharing data: </span>
              {provider.sharingHref ? (
                <>
                  For more information, please read the{" "}
                  <a href={provider.sharingHref} target="_blank" rel="noopener noreferrer" className="text-[#262A6F] underline">
                    {provider.name} Privacy Statement
                  </a>
                  .
                </>
              ) : (
                provider.sharing
              )}
            </p>
          )}

          {/* Cookie groups */}
          {provider.groups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className={`${sourceSans.className} text-sm font-semibold text-[#4A5565] mb-2`}>{group.label}</p>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className={`${sourceSans.className} text-left px-4 py-2.5 font-semibold text-[#101828] text-xs uppercase tracking-wide`}>Name</th>
                      <th className={`${sourceSans.className} text-left px-4 py-2.5 font-semibold text-[#101828] text-xs uppercase tracking-wide`}>Expiration</th>
                      <th className={`${sourceSans.className} text-left px-4 py-2.5 font-semibold text-[#101828] text-xs uppercase tracking-wide`}>Function</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {group.rows.map((row, i) => (
                      <tr key={i} className="bg-white">
                        <td className={`${sourceSans.className} px-4 py-2.5 text-[#4A5565] font-mono text-xs`}>
                          {row.nameHref ? (
                            <a href={row.nameHref} target="_blank" rel="noopener noreferrer" className="text-[#262A6F] underline inline-flex items-center gap-0.5">
                              {row.name} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            row.name
                          )}
                        </td>
                        <td className={`${sourceSans.className} px-4 py-2.5 text-[#4A5565] text-xs`}>{row.expiration ?? ""}</td>
                        <td className={`${sourceSans.className} px-4 py-2.5 text-[#4A5565] text-xs`}>{row.function ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section data ─────────────────────────────────────────────────────────────

const sections = [
  {
    id: "introduction",
    number: 1,
    title: "Introduction",
    content: (
      <>
        <p className="mb-4">
          Our website,{" "}
          <a href="https://rosecrestgroupltd.co.uk" className="text-[#262A6F] underline">
            https://rosecrestgroupltd.co.uk
          </a>{" "}
          (hereinafter: &quot;the website&quot;) uses cookies and other related technologies (for convenience all technologies are referred to as &quot;cookies&quot;). Cookies are also placed by third parties we have engaged. In the document below we inform you about the use of cookies on our website.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">What are cookies?</h3>
        <p className="mb-4">
          A cookie is a small simple file that is sent along with pages of this website and stored by your browser on the hard drive of your computer or another device. The information stored therein may be returned to our servers or to the servers of the relevant third parties during a subsequent visit.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">What are scripts?</h3>
        <p className="mb-4">
          A script is a piece of program code that is used to make our website function properly and interactively. This code is executed on our server or on your device.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">What is a web beacon?</h3>
        <p className="mb-4">
          A web beacon (or a pixel tag) is a small, invisible piece of text or image on a website that is used to monitor traffic on a website. In order to do this, various data about you is stored using web beacons.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">Cookies</h3>
        <p className="font-semibold text-[#101828] text-sm mb-1">Technical or functional cookies</p>
        <p className="mb-4">
          Some cookies ensure that certain parts of the website work properly and that your user preferences remain known. By placing functional cookies, we make it easier for you to visit our website. This way, you do not need to repeatedly enter the same information when visiting our website and, for example, the items remain in your shopping cart until you have paid. We may place these cookies without your consent.
        </p>
        <p className="font-semibold text-[#101828] text-sm mb-1">Marketing/Tracking cookies</p>
        <p>
          Marketing/Tracking cookies are cookies or any other form of local storage, used to create user profiles to display advertising or to track the user on this website or across several websites for similar marketing purposes.
        </p>
      </>
    ),
  },
  {
    id: "placed-cookies",
    number: 2,
    title: "Placed cookies",
    content: (
      <div>
        {cookieProviders.map((provider, i) => (
          <CookieProviderAccordion key={provider.name} provider={provider} defaultOpen={i === 0} />
        ))}
      </div>
    ),
  },
  {
    id: "consent",
    number: 3,
    title: "Consent",
    content: (
      <>
        <p className="mb-6">
          When you visit our website for the first time, we will show you a pop-up with an explanation about cookies. As soon as you click on &quot;Save Preferences&quot;, you consent to us using the categories of cookies and plug-ins you selected in the pop-up, as described in this Cookie Policy. You can disable the use of cookies via your browser, but please note that our website may no longer work properly.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-4">Manage your consent settings</h3>

        {/* Functional — always active */}
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
          <div className="flex items-center justify-between px-5 py-4 bg-white">
            <span className="font-semibold text-[#101828] text-base">Functional</span>
            <span className={`${sourceSans.className} text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full`}>
              Always active
            </span>
          </div>
          <div className="px-5 pb-4 border-t border-gray-100 bg-white">
            <p className={`${sourceSans.className} text-sm text-[#4A5565] mt-3`}>
              The technical storage or access is strictly necessary for the legitimate purpose of enabling the use of a specific service explicitly requested by the subscriber or user, or for the sole purpose of carrying out the transmission of a communication over an electronic communications network.
            </p>
          </div>
        </div>

        {/* Marketing — toggle (visual only) */}
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
          <div className="flex items-center justify-between px-5 py-4 bg-white">
            <span className="font-semibold text-[#101828] text-base">Marketing</span>
            <div className="w-5 h-5 border-2 border-gray-300 rounded" />
          </div>
          <div className="px-5 pb-4 border-t border-gray-100 bg-white">
            <p className={`${sourceSans.className} text-sm text-[#4A5565] mt-3`}>
              The technical storage or access is required to create user profiles to send advertising, or to track the user on a website or across several websites for similar marketing purposes.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "managing-cookies",
    number: 4,
    title: "Managing Cookies",
    content: (
      <>
        <h3 className="font-bold text-[#101828] text-base mb-2">Enabling/disabling and deleting cookies</h3>
        <p className="mb-4">
          You can use your internet browser to automatically or manually delete cookies. You can also specify that certain cookies may not be placed. Another option is to change the settings of your internet browser so that you receive a message each time a cookie is placed. For more information about these options, please refer to the instructions in the Help section of your browser.
        </p>
        <p>
          Please note that our website may not work properly if all cookies are disabled. If you do delete the cookies in your browser, they will be placed again after your consent when you visit our website again.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    number: 5,
    title: "Your rights",
    content: (
      <>
        <h3 className="font-bold text-[#101828] text-base mb-2">Your rights with respect to personal data</h3>
        <p className="mb-4">You have the following rights with respect to your personal data:</p>
        <ul className={`${sourceSans.className} space-y-2 mb-6 text-sm text-[#4A5565]`}>
          {[
            "You have the right to know why your personal data is needed, what will happen to it, and how long it will be retained for.",
            "Right of access: You have the right to access your personal data that is known to us.",
            "Right to rectification: you have the right to supplement, correct, have deleted or blocked your personal data whenever you wish.",
            "If you give us your consent to process your data, you have the right to revoke that consent and to have your personal data deleted.",
            "Right to transfer your data: you have the right to request all your personal data from the controller and transfer it in its entirety to another controller.",
            "Right to object: you may object to the processing of your data. We comply with this, unless there are justified grounds for processing.",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#262A6F] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className={`${sourceSans.className} text-sm text-[#4A5565]`}>
          To exercise these rights, please contact us. Please refer to the contact details at the bottom of this Cookie Policy. If you have a complaint about how we handle your data, we would like to hear from you, but you also have the right to submit a complaint to the supervisory authority (the Information Commissioner&apos;s Office (ICO)).
        </p>
      </>
    ),
  },
  {
    id: "contact-details",
    number: 6,
    title: "Contact details",
    content: (
      <>
        <p className="mb-6">
          For questions and/or comments about our Cookie Policy and this statement, please contact us by using the following contact details:
        </p>
        <div className={`${sourceSans.className} space-y-1 text-[#4A5565] text-sm mb-6`}>
          <p className="font-semibold text-[#101828]">Rosecrest Group Ltd</p>
          <p>United Kingdom</p>
          <p>
            Website:{" "}
            <a href="https://rosecrestgroupltd.co.uk" className="text-[#262A6F] underline">
              https://rosecrestgroupltd.co.uk
            </a>
          </p>
          <p>
            Email:{" "}
            <a href="mailto:info@rosecrest.co.uk" className="text-[#262A6F] underline">
              info@rosecrest.co.uk
            </a>
          </p>
        </div>
        <p className={`${sourceSans.className} text-sm text-[#4A5565]`}>
          This Cookie Policy was synchronised with{" "}
          <a href="https://cookiedatabase.org" target="_blank" rel="noopener noreferrer" className="text-[#262A6F] underline">
            cookiedatabase.org
          </a>{" "}
          on 9 January 2025.
        </p>
      </>
    ),
  },
];

const CookiePolicyClient = () => {
  const [activeId, setActiveId] = useState("introduction");

  const active = sections.find((s) => s.id === activeId)!;
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20">
      {/* ── Mobile: accordion TOC + all sections ── */}
      <div className="lg:hidden space-y-4">
        <details className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <summary
            className={`${sourceSans.className} font-bold text-[#101828] px-6 py-4 cursor-pointer list-none flex items-center justify-between`}
          >
            Table of Contents
            <span className="text-[#262A6F] text-lg">▾</span>
          </summary>
          <nav className="px-4 pb-4 space-y-1">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`${sourceSans.className} flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#4A5565] hover:bg-[#F3F4F6] hover:text-[#262A6F] transition-colors`}
              >
                <span className="w-6 h-6 rounded-full bg-[#262A6F] text-white text-xs flex items-center justify-center shrink-0 font-bold">
                  {section.number}
                </span>
                {section.title}
              </a>
            ))}
          </nav>
        </details>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="px-6 py-8 scroll-mt-6"
            >
              <h2 className="text-xl font-bold text-[#101828] mb-6">
                {section.number}. {section.title.toUpperCase()}
              </h2>
              <div
                className={`${sourceSans.className} text-sm text-[#4A5565] leading-relaxed space-y-2`}
              >
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <p
          className={`${sourceSans.className} text-xs text-[#9CA3AF] text-center mt-4`}
        >
          © {new Date().getFullYear()} Rosecrest Group Ltd. All rights reserved.
        </p>
      </div>

      {/* ── Desktop: sticky sidebar + single content panel ── */}
      <div className="hidden lg:flex gap-10 items-start">
        <aside className="w-72 shrink-0 sticky top-8">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-[#101828] text-base px-3 mb-3">
              Table of Contents
            </h2>
            <nav className="space-y-1">
              {sections.map((section) => {
                const isActive = section.id === activeId;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveId(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-left transition-colors ${
                      isActive
                        ? "bg-[#F0F3FF] text-[#262A6F]"
                        : "text-[#4A5565] hover:bg-[#F3F4F6]"
                    }`}
                  >
                    <span className="w-7 h-7 rounded-full bg-[#262A6F] text-white text-xs flex items-center justify-center shrink-0 font-bold">
                      {section.number}
                    </span>
                    <span
                      className={`${sourceSans.className} ${isActive ? "font-semibold" : ""}`}
                    >
                      {section.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-10 py-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#101828] mb-2">
              {active.number}. {active.title.toUpperCase()}
            </h2>
            <div
              className={`${sourceSans.className} text-base text-[#4A5565] leading-relaxed space-y-2 mt-6`}
            >
              {active.content}
            </div>
          </div>

          <p
            className={`${sourceSans.className} text-xs text-[#9CA3AF] text-center mt-8`}
          >
            © {new Date().getFullYear()} Rosecrest Group Ltd. All rights
            reserved.
          </p>
        </main>
      </div>
    </div>
  );
};

export default CookiePolicyClient;
