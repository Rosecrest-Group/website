import Footer from "@/components/common/Footer";
import ServicesHero from "@/fragments/services/Hero";
import ServiceTabs, { ServiceTabsFallback } from "@/fragments/services/Tabs";
import { getPageMetadata } from "@/lib/page-metadata";
import  { Suspense } from "react";
import PageJsonLd from "@/components/common/PageJsonLd";

export const metadata = getPageMetadata("/services");

const Page = () => {
  return (
    <div>
      <PageJsonLd path="/services" />
      <ServicesHero />
      <Suspense fallback={<ServiceTabsFallback />}>
        <ServiceTabs />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Page;
