import EnquiryModal from "@/components/common/EnquiryModal";
import GoogleTagManagerRoot from "@/components/analytics/GoogleTagManagerRoot";
import AttributionTracker from "@/components/analytics/AttributionTracker";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { siteFontClass } from "@/lib/fonts";

export default function MarketingSiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${siteFontClass} flex min-h-screen flex-col bg-white`}>
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
    </div>
  );
}
