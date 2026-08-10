import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { manrope } from "@/lib/fonts";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd data={[buildOrganization(), buildWebSite()]} id="sitewide" />
      </head>
      <body
        suppressHydrationWarning
        className={`${manrope.className} ${manrope.variable} relative no-scrollbar scroll-smooth`}
      >
        <NextTopLoader color="#6d28d9" height={3} showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
