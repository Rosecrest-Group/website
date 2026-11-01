import { ChevronDown, ExternalLink } from "lucide-react";
import JourneyOptOut from "@/components/analytics/JourneyOptOut";
import PolicyLayout, { PolicyH3, PolicyList, type PolicySection } from "@/components/site/policies/PolicyLayout";
import { JOURNEY_OPT_OUT_KEY, JOURNEY_STORAGE_KEY } from "@/lib/attribution-session";

// The policy text below is the live legal text, kept word for word. Only the layout changed.

// ─── Placed cookies data ──────────────────────────────────────────────────────

interface CookieRow {
  name: string;
  expiration?: string;
  function?: string;
}

interface CookieGroup {
  label: string;
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

const cookieProviders: CookieProvider[] = [
  {
    name: "Rosecrest",
    usage:
      "We remember the pages you view on this browser so that, if you enquire, we can see which pages you read on earlier visits. You can turn this off under Consent below.",
    sharing:
      "This stays in your browser until you enquire. It is then saved with that enquiry. It is not shared with third parties.",
    groups: [
      {
        label: "Statistics",
        rows: [
          {
            name: JOURNEY_STORAGE_KEY,
            expiration: "180 days",
            function: "Remember pages viewed on this browser so an enquiry includes earlier visits",
          },
        ],
      },
      {
        label: "Functional",
        rows: [
          {
            name: JOURNEY_OPT_OUT_KEY,
            expiration: "persistent",
            function: "Remember that you turned off page history, so we keep respecting it",
          },
        ],
      },
    ],
  },
  {
    name: "WordPress",
    usage: "We use WordPress for website development.",
    usageHref: "https://wordpress.org",
    sharing: "This data is not shared with third parties.",
    groups: [
      {
        label: "Functional",
        rows: [
          { name: "WP_PREFERENCES_USER_*", expiration: "persistent", function: "Store user preferences" },
          { name: "wpEmojiSettingsSupports", expiration: "session", function: "Store browser details" },
          { name: "wp-settings-*", expiration: "persistent", function: "Store user preferences" },
          { name: "wp-settings-time-*", expiration: "1 year", function: "Store user preferences" },
          { name: "wordpress_test_cookie", expiration: "session", function: "Read if cookies can be placed" },
          { name: "wordpress_logged_in_*", expiration: "persistent", function: "Store logged in users" },
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
        rows: [{ name: "_grecaptcha", expiration: "6 months", function: "Provide spam protection" }],
      },
      {
        label: "Purpose pending investigation",
        rows: [{ name: "rc::a" }, { name: "rc::b" }, { name: "rc::c" }],
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

function CookieTable({ group }: { group: CookieGroup }) {
  return (
    <div className="flex flex-col gap-2">
      <b className="text-[15px] text-ink">{group.label}</b>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-navy text-white">
              <th scope="col" className="px-4 py-2.5 font-bold">
                Name
              </th>
              <th scope="col" className="px-4 py-2.5 font-bold">
                Expiration
              </th>
              <th scope="col" className="px-4 py-2.5 font-bold">
                Function
              </th>
            </tr>
          </thead>
          <tbody>
            {group.rows.map((row, i) => (
              <tr key={row.name} className={i % 2 === 1 ? "bg-mist-soft" : "bg-white"}>
                <td className="break-all border-t border-line px-4 py-2.5 font-mono text-[13px] text-ink">{row.name}</td>
                <td className="border-t border-line px-4 py-2.5 text-body">{row.expiration ?? ""}</td>
                <td className="border-t border-line px-4 py-2.5 text-body">{row.function ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CookieProviderBlock({ provider, open }: { provider: CookieProvider; open?: boolean }) {
  return (
    <details open={open} className="group rounded-2xl border border-line bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="text-[17px] font-bold text-ink">{provider.name}</span>
        <ChevronDown
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-teal transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="flex flex-col gap-4 border-t border-line px-5 pb-5 pt-4 text-[15px]">
        {provider.usage && (
          <p>
            <b className="text-ink">Usage: </b>
            {provider.usage}{" "}
            {provider.usageHref && (
              <a
                href={provider.usageHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
              >
                Read more about {provider.name} <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            )}
          </p>
        )}
        {provider.sharing && (
          <p>
            <b className="text-ink">Sharing data: </b>
            {provider.sharingHref ? (
              <>
                For more information, please read the{" "}
                <a href={provider.sharingHref} target="_blank" rel="noopener noreferrer">
                  {provider.name} Privacy Statement
                </a>
                .
              </>
            ) : (
              provider.sharing
            )}
          </p>
        )}
        {provider.groups.map((group) => (
          <CookieTable key={group.label} group={group} />
        ))}
      </div>
    </details>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

const sections: PolicySection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <>
        <p>
          Our website, <a href="https://rosecrestgroupltd.co.uk">https://rosecrestgroupltd.co.uk</a> (hereinafter:
          &quot;the website&quot;) uses cookies and other related technologies (for convenience all technologies are
          referred to as &quot;cookies&quot;). Cookies are also placed by third parties we have engaged. In the document
          below we inform you about the use of cookies on our website.
        </p>
        <PolicyH3>What are cookies?</PolicyH3>
        <p>
          A cookie is a small simple file that is sent along with pages of this website and stored by your browser on
          the hard drive of your computer or another device. The information stored therein may be returned to our
          servers or to the servers of the relevant third parties during a subsequent visit.
        </p>
        <PolicyH3>What are scripts?</PolicyH3>
        <p>
          A script is a piece of program code that is used to make our website function properly and interactively.
          This code is executed on our server or on your device.
        </p>
        <PolicyH3>What is a web beacon?</PolicyH3>
        <p>
          A web beacon (or a pixel tag) is a small, invisible piece of text or image on a website that is used to
          monitor traffic on a website. In order to do this, various data about you is stored using web beacons.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    content: (
      <>
        <PolicyH3>Technical or functional cookies</PolicyH3>
        <p>
          Some cookies ensure that certain parts of the website work properly and that your user preferences remain
          known. By placing functional cookies, we make it easier for you to visit our website. This way, you do not
          need to repeatedly enter the same information when visiting our website and, for example, the items remain in
          your shopping cart until you have paid. We may place these cookies without your consent.
        </p>
        <PolicyH3>Marketing/Tracking cookies</PolicyH3>
        <p>
          Marketing/Tracking cookies are cookies or any other form of local storage, used to create user profiles to
          display advertising or to track the user on this website or across several websites for similar marketing
          purposes.
        </p>
      </>
    ),
  },
  {
    id: "placed-cookies",
    title: "2. Placed cookies",
    content: (
      <div className="flex flex-col gap-3">
        {cookieProviders.map((provider, i) => (
          <CookieProviderBlock key={provider.name} provider={provider} open={i === 0} />
        ))}
      </div>
    ),
  },
  {
    id: "consent",
    title: "3. Consent",
    content: (
      <>
        <p>
          When you visit our website for the first time, we will show you a pop-up with an explanation about cookies. As
          soon as you click on &quot;Save Preferences&quot;, you consent to us using the categories of cookies and
          plug-ins you selected in the pop-up, as described in this Cookie Policy. You can disable the use of cookies
          via your browser, but please note that our website may no longer work properly.
        </p>
        <PolicyH3>Manage your consent settings</PolicyH3>
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="flex items-center justify-between gap-4 bg-white px-5 py-4">
            <span className="text-base font-semibold text-ink">Functional</span>
            <span className="rounded-full bg-teal-tint px-3 py-1 text-xs font-semibold text-teal">Always active</span>
          </div>
          <div className="border-t border-line bg-white px-5 pb-4">
            <p className="mt-3 text-sm text-body">
              The technical storage or access is strictly necessary for the legitimate purpose of enabling the use of a
              specific service explicitly requested by the subscriber or user, or for the sole purpose of carrying out
              the transmission of a communication over an electronic communications network.
            </p>
          </div>
        </div>
        <JourneyOptOut />
      </>
    ),
  },
  {
    id: "managing-cookies",
    title: "4. Managing cookies",
    content: (
      <>
        <PolicyH3>Enabling/disabling and deleting cookies</PolicyH3>
        <p>
          You can use your internet browser to automatically or manually delete cookies. You can also specify that
          certain cookies may not be placed. Another option is to change the settings of your internet browser so that
          you receive a message each time a cookie is placed. For more information about these options, please refer to
          the instructions in the Help section of your browser.
        </p>
        <p>
          Please note that our website may not work properly if all cookies are disabled. If you do delete the cookies
          in your browser, they will be placed again after your consent when you visit our website again.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "5. Your rights",
    content: (
      <>
        <PolicyH3>Your rights with respect to personal data</PolicyH3>
        <p>You have the following rights with respect to your personal data:</p>
        <PolicyList
          items={[
            "You have the right to know why your personal data is needed, what will happen to it, and how long it will be retained for.",
            "Right of access: You have the right to access your personal data that is known to us.",
            "Right to rectification: you have the right to supplement, correct, have deleted or blocked your personal data whenever you wish.",
            "If you give us your consent to process your data, you have the right to revoke that consent and to have your personal data deleted.",
            "Right to transfer your data: you have the right to request all your personal data from the controller and transfer it in its entirety to another controller.",
            "Right to object: you may object to the processing of your data. We comply with this, unless there are justified grounds for processing.",
          ]}
        />
        <p>
          To exercise these rights, please contact us. Please refer to the contact details at the bottom of this Cookie
          Policy. If you have a complaint about how we handle your data, we would like to hear from you, but you also
          have the right to submit a complaint to the supervisory authority (the Information Commissioner&apos;s Office
          (ICO)).
        </p>
      </>
    ),
  },
  {
    id: "contact-details",
    title: "6. Contact details",
    content: (
      <>
        <p>
          For questions and/or comments about our Cookie Policy and this statement, please contact us by using the
          following contact details:
        </p>
        <div className="flex flex-col gap-1">
          <b className="text-ink">Rosecrest Group Ltd</b>
          <span>United Kingdom</span>
          <span>
            Website: <a href="https://rosecrestgroupltd.co.uk">https://rosecrestgroupltd.co.uk</a>
          </span>
          <span>
            Email: <a href="mailto:info@rosecrest.co.uk">info@rosecrest.co.uk</a>
          </span>
        </div>
        <p>
          This Cookie Policy was synchronised with{" "}
          <a href="https://cookiedatabase.org" target="_blank" rel="noopener noreferrer">
            cookiedatabase.org
          </a>{" "}
          on 9 January 2025.
        </p>
      </>
    ),
  },
];

/**
 * Cookie policy body. A server component: the consent switch (JourneyOptOut) and the
 * contents list are the only client parts.
 */
export default function CookiePolicyClient() {
  return (
    <PolicyLayout
      crumb="Cookie policy"
      title="Cookie policy"
      intro={
        <p>
          This Cookie Policy was last updated on 1 November 2024 and applies to citizens and legal permanent residents
          of the United Kingdom.
        </p>
      }
      sections={sections}
    />
  );
}
