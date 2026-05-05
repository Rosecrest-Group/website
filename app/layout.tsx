import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import { manrope } from "@/lib/fonts";
import EnquiryModal from "@/components/common/EnquiryModal";
import GoogleTagManagerRoot from "@/components/analytics/GoogleTagManagerRoot";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Expert Property Surveys and Building Consultancy | Rosecrest",
  description:
    "Professional property inspection and surveying services across London and the M25",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hideSiteChrome =
    (await headers()).get("x-rosecrest-hide-site-chrome") === "1";

  return (
    <html lang="en">
      <head />
      <body className={`${manrope.className} relative no-scrollbar scroll-smooth`}>
        <GoogleTagManagerRoot />
        {/* Google Tag Manager noscript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KWX4BX6S"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {!hideSiteChrome && <Navbar />}
        {hideSiteChrome ? (
          children
        ) : (
          <div className="grow">{children}</div>
        )}
        {!hideSiteChrome && <EnquiryModal />}
      </body>
    </html>
  );
}