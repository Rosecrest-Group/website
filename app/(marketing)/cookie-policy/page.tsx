import PageJsonLd from "@/components/common/PageJsonLd";
import { getPageMetadata } from "@/lib/page-metadata";
import CookiePolicyClient from "./CookiePolicyClient";

export const metadata = getPageMetadata("/cookie-policy");

export default function CookiePolicyPage() {
  return (
    <>
      <PageJsonLd path="/cookie-policy" />
      <CookiePolicyClient />
    </>
  );
}
