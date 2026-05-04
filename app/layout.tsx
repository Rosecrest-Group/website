import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import { manrope } from "@/lib/fonts";
import EnquiryModal from "@/components/common/EnquiryModal";
import Script from "next/script";
import { siteConfig } from "@/lib/page-metadata";
import JsonLd from "@/components/common/JsonLd";
import { buildOrganization, buildWebSite } from "@/lib/schema";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Expert Property Surveys and Building Consultancy | Rosecrest",
    template: "%s",
  },
  description:
    "Professional property inspection and surveying services across London and the M25",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KWX4BX6S');`}
        </Script>

        {/* Sitewide structured data — appears on every page */}
        <JsonLd data={[buildOrganization(), buildWebSite()]} id="sitewide" />
      </head>
      <body className={`${manrope.className} relative no-scrollbar scroll-smooth`}>
        {/* Google Tag Manager noscript */}
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
      </body>
    </html>
  );
}