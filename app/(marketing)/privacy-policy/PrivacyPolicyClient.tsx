"use client";

import { useState } from "react";
import { sourceSans } from "@/lib/fonts";

const sections = [
  {
    id: "data-collection",
    number: 1,
    title: "Data Collection and Usage",
    content: (
      <>
        <h3 className="font-bold text-[#101828] text-base mb-2">Personally Identifiable Information</h3>
        <p className="mb-4">
          &quot;Personally Identifiable Information&quot; refers to any information that identifies or can be used to identify, contact, or locate the person to whom such information pertains, including, but not limited to, name, address, phone number, fax number, email address, financial profiles, social security number, and credit card information. Personally Identifiable Information does not include information that is collected anonymously (that is, without identification of the individual user) or demographic information not connected to an identified individual.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">What Personally Identifiable Information is collected?</h3>
        <p className="mb-4">
          We may collect basic user profile information from all of our Visitors. We collect the following additional information from our Authorized Customers: the name, email address, phone number, address, social media profile information.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">How does RPBS Limited use login information?</h3>
        <p className="mb-4">
          RPBS Limited uses login information, including, but not limited to, IP addresses, ISPs, and browser types, browser version, pages visited, date and time of visit, to analyze trends, administer the Site, track a user&apos;s movement and use, and gather broad demographic information.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">How does the Site use Personally Identifiable Information?</h3>
        <p>
          We use Personally Identifiable Information to customize the Site, to make appropriate service offerings, and to fulfill buying and selling requests on the Site. We may email Visitors and Authorized Customers about research or purchase and selling opportunities on the Site or information related to the subject matter of the Site. We may also use Personally Identifiable Information to contact Visitors and Authorized Customers in response to specific inquiries, or to provide requested information.
        </p>
      </>
    ),
  },
  {
    id: "data-sharing",
    number: 2,
    title: "Data Sharing & Third Parties",
    content: (
      <>
        <h3 className="font-bold text-[#101828] text-base mb-2">What organizations are collecting the information?</h3>
        <p className="mb-4">
          In addition to our direct collection of information, our third party service vendors (such as credit card companies, clearinghouses and banks) who may provide such services as credit, insurance, and escrow services may collect this information from our Visitors and Authorized Customers. We do not control how these third parties use such information, but we do ask them to disclose how they use personal information provided to them from Visitors and Authorized Customers. Some of these third parties may be intermediaries that act solely as links in the distribution chain, and do not store, retain, or use the information given to them.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">With whom may the information may be shared?</h3>
        <p className="mb-4">
          Personally Identifiable Information about Authorized Customers may be shared with other Authorized Customers who wish to evaluate potential transactions with other Authorized Customers. We may share aggregated information about our Visitors, including the demographics of our Visitors and Authorized Customers, with our affiliated agencies and third party vendors. We also offer the opportunity to &quot;opt out&quot; of receiving information or being contacted by us or by any agency acting on our behalf.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">What partners or service providers have access to Personally Identifiable Information?</h3>
        <p className="mb-4">
          RPBS Limited has entered into and will continue to enter into partnerships and other affiliations with a number of vendors. Such vendors may have access to certain Personally Identifiable Information on a need to know basis for evaluating Authorized Customers for service eligibility. Our privacy policy does not cover their collection or use of this information.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">Google AdSense &amp; DoubleClick Cookie</h3>
        <p>Google, as a third party vendor, uses cookies to serve ads on our Service.</p>
      </>
    ),
  },
  {
    id: "cookies",
    number: 3,
    title: "Cookies & Tracking",
    content: (
      <>
        <h3 className="font-bold text-[#101828] text-base mb-2">Cookies</h3>
        <p className="mb-4">
          A cookie is a string of information that a website stores on a visitor&apos;s computer, and that the visitor&apos;s browser provides to the website each time the visitor returns.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">Are Cookies Used on the Site?</h3>
        <p className="mb-4">
          Cookies are used for a variety of reasons. We use Cookies to obtain information about the preferences of our Visitors and the services they select. We also use Cookies for security purposes to protect our Authorized Customers. For example, if an Authorized Customer is logged on and the site is unused for more than 10 minutes, we will automatically log the Authorized Customer off. Visitors who do not wish to have cookies placed on their computers should set their browsers to refuse cookies before using{" "}
          <a href="https://www.rpbsltd.co.uk" className="text-[#262A6F] underline">https://www.rpbsltd.co.uk</a>,
          with the drawback that certain features of the website may not function properly without the aid of cookies.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">Cookies used by our service providers</h3>
        <p>
          Our service providers use cookies and those cookies may be stored on your computer when you visit our website. You can find more details about which cookies are used in our cookies info page.
        </p>
      </>
    ),
  },
  {
    id: "data-storage",
    number: 4,
    title: "Data Storage & Security",
    content: (
      <>
        <h3 className="font-bold text-[#101828] text-base mb-2">How is Personally Identifiable Information stored?</h3>
        <p className="mb-4">
          Personally Identifiable Information collected by RPBS Limited is securely stored and is not accessible to third parties or employees of RPBS Limited except for use as indicated above.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">How does the Site keep Personally Identifiable Information secure?</h3>
        <p>
          All of our employees are familiar with our security policy and practices. The Personally Identifiable Information of our Visitors and Authorized Customers is only accessible to a limited number of qualified employees who are given a password in order to gain access to the information. We audit our security systems and processes on a regular basis. Sensitive information, such as credit card numbers or social security numbers, is protected by encryption protocols, in place to protect information sent over the Internet. While we take commercially reasonable measures to maintain a secure site, electronic communications and databases are subject to errors, tampering, and break-ins, and we cannot guarantee or warrant that such events will not take place and we will not be liable to Visitors or Authorized Customers for any such occurrences.
        </p>
      </>
    ),
  },
  {
    id: "user-rights",
    number: 5,
    title: "User Rights & Control",
    content: (
      <>
        <h3 className="font-bold text-[#101828] text-base mb-2">What choices are available to Visitors?</h3>
        <p className="mb-4">
          Visitors and Authorized Customers may opt out of receiving unsolicited information from or being contacted by us and/or our vendors and affiliated agencies by responding to emails as instructed, or by contacting us at{" "}
          <a href="mailto:enquiry@rpbsltd.co.uk" className="text-[#262A6F] underline">enquiry@rpbsltd.co.uk</a>.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">How can Visitors correct any inaccuracies?</h3>
        <p className="mb-4">
          Visitors and Authorized Customers may contact us to update Personally Identifiable Information about them or to correct any inaccuracies by emailing us at{" "}
          <a href="mailto:enquiry@rpbsltd.co.uk" className="text-[#262A6F] underline">enquiry@rpbsltd.co.uk</a>.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">Can a Visitor delete or deactivate their information?</h3>
        <p className="mb-4">
          We provide Visitors and Authorized Customers with a mechanism to delete/deactivate Personally Identifiable Information from the Site&apos;s database by contacting us. However, because of backups and records of deletions, it may be impossible to delete a Visitor&apos;s entry without retaining some residual information. An individual who requests to have Personally Identifiable Information deactivated will have this information functionally deleted, and we will not sell, transfer, or use Personally Identifiable Information relating to that individual in any way moving forward.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">Your rights</h3>
        <ul className="space-y-2">
          {[
            "The right to access",
            "The right to rectification",
            "The right to erasure",
            "The right to restrict processing",
            "The right to object to processing",
            "The right to data portability",
            "The right to complain to a supervisory authority",
            "The right to withdraw consent",
          ].map((right) => (
            <li key={right} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#262A6F] shrink-0" />
              {right}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "others",
    number: 6,
    title: "Others",
    content: (
      <>
        <p className="text-[#6A7282] text-sm mb-6">
          Legal Compliance, Children&apos;s Privacy, Policy Changes, External links
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">Compliance With Laws</h3>
        <p className="mb-4">
          Disclosure of Personally Identifiable Information to comply with the law. We will disclose Personally Identifiable Information in order to comply with a court order or subpoena or a request from a law enforcement agency to release information. We will also disclose Personally Identifiable Information when reasonably necessary to protect the safety of our Visitors and Authorized Customers.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">Children&apos;s Privacy</h3>
        <p className="mb-4">
          Our Service does not address &quot;Children&quot;, anyone under the age of 18 years, and we do not knowingly collect personally identifiable information from children under 18 years.
        </p>
        <p className="mb-4">
          If you are a parent or guardian and you are aware that your child has provided us with Personal Information, please get in touch with us immediately in the contact details provided. If we come to know that children below 18 years have provided personal information, we will delete the information from our servers immediately.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">What happens if the Privacy Policy Changes?</h3>
        <p className="mb-4">
          We will let our Visitors and Authorized Customers know about changes to our privacy policy by posting such changes on the Site. However, if we are changing our privacy policy in a manner that might cause disclosure of Personally Identifiable Information that a Visitor or Authorized Customer has previously requested not be disclosed, we will contact such Visitor or Authorized Customer to allow such Visitor or Authorized Customer to prevent such disclosure.
        </p>
        <h3 className="font-bold text-[#101828] text-base mb-2">External Links</h3>
        <p>
          <a href="https://rosecrestgroupltd.co.uk" className="text-[#262A6F] underline">
            https://rosecrestgroupltd.co.uk
          </a>{" "}
          contains links to other websites. Please note that when you click on one of these links, you are moving to another website. We encourage you to read the privacy statements of these linked sites as their privacy policies may differ from ours.
        </p>
      </>
    ),
  },
];

const PrivacyPolicyClient = () => {
  const [activeId, setActiveId] = useState("data-collection");

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

        {/* All sections visible on mobile */}
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

      {/* ── Desktop: sidebar tabs + single content panel ── */}
      <div className="hidden lg:flex gap-10 items-start">
        {/* Sticky sidebar tabs */}
        <aside className="w-72 shrink-0 sticky top-8">
          <div className="bg-[white] rounded-2xl p-4 border border-gray-100 shadow-sm">
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
                    <span
                      className={`w-7 h-7 rounded-full text-xs flex items-center justify-center shrink-0 font-bold transition-colors ${
                        isActive
                          ? "bg-[#262A6F] text-white"
                          : "bg-[#262A6F] text-white"
                      }`}
                    >
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

        {/* Content panel */}
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

export default PrivacyPolicyClient;
