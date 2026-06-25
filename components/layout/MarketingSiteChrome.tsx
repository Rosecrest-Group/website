import Navbar from "@/components/common/Navbar";
import EnquiryModal from "@/components/common/EnquiryModal";
import GoogleTagManagerRoot from "@/components/analytics/GoogleTagManagerRoot";

export default function MarketingSiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GoogleTagManagerRoot />
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-KWX4BX6S"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
      <Navbar />
      <div className="grow">{children}</div>
      <EnquiryModal />
    </>
  );
}
