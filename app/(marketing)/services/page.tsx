import Footer from "@/components/common/Footer";
import ServicesHero from "@/fragments/services/Hero";
import ServiceTabs from "@/fragments/services/Tabs";
import { getPageMetadata } from "@/lib/page-metadata";
import  { Suspense } from "react";

export const metadata = getPageMetadata("/services");

const Page = () => {
  return (
    <div>
      <ServicesHero />
      <Suspense fallback={null}>
        <ServiceTabs />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Page;
