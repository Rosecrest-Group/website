import PageJsonLd from "@/components/common/PageJsonLd";
import { getPageMetadata } from "@/lib/page-metadata";
import PrivacyPolicyClient from "./PrivacyPolicyClient";

export const metadata = getPageMetadata("/privacy-policy");

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageJsonLd path="/privacy-policy" />
      <PrivacyPolicyClient />
    </>
  );
}
