
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import Footer from "@/components/common/Footer";
import { getPageMetadata } from "@/lib/page-metadata";
import CookiePolicyClient from "./CookiePolicyClient";
import PageJsonLd from "@/components/common/PageJsonLd";

export const metadata = getPageMetadata("/cookie-policy");

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = () => {
  

  return (
    <div className="bg-[#FBF7F4]">
      <PageJsonLd path="/cookie-policy" />
      <JourneyHero>
        <h1 className="text-white text-4xl lg:text-5xl tracking-tight leading-tight font-bold">
          Cookie Policy
        </h1>
        <p className={`${sourceSans.className} mt-4 text-white/80 text-sm sm:text-xl mx-auto lg:w-3/5`}>
          This Cookie Policy was last updated on 1 November 2024 and applies to citizens and legal permanent residents of the United Kingdom.
        </p>
      </JourneyHero>

      <CookiePolicyClient />

      <Footer />
    </div>
  );
};

export default Page;