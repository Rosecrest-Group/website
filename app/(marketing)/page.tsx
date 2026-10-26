import Footer from "@/components/common/Footer";
import Brands from "@/fragments/landing/Brands";
import Hero from "@/fragments/landing/Hero";
import NotSureSection from "@/fragments/landing/NotSure";
import Services from "@/fragments/landing/Services";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";

export const metadata = getPageMetadata("/");

export default function Home() {
  return (
    <div className="">
      <PageJsonLd path="/" />
      <Hero />
      <Services />
      <Brands />
      <NotSureSection />
      <Footer />
    </div>
  );
}
