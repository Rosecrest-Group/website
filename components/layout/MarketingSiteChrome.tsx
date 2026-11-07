import EnquiryModal from "@/components/common/EnquiryModal";
import GoogleTagManagerRoot from "@/components/analytics/GoogleTagManagerRoot";
import AttributionTracker from "@/components/analytics/AttributionTracker";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { siteFontClass } from "@/lib/fonts";
import dynamic from "next/dynamic";

// Set for the staging branch in netlify.toml. Without it the build leaves this code out.
const ReviewComments =
  process.env.NEXT_PUBLIC_REVIEW_COMMENTS === "1"
    ? dynamic(() => import("@/components/review/ReviewComments"))
    : null;

export default function MarketingSiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-review-root className={`${siteFontClass} flex min-h-screen flex-col bg-white`}>
      <GoogleTagManagerRoot />
      <AttributionTracker />
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-KWX4BX6S"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
      <SiteHeader />
      <main className="grow">{children}</main>
      <SiteFooter />
      <EnquiryModal />
      {ReviewComments ? <ReviewComments /> : null}
    </div>
  );
}
