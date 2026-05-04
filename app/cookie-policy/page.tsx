
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import Footer from "@/components/common/Footer";
import { getPageMetadata } from "@/lib/page-metadata";
import CookiePolicyClient from "./CookiePolicyClient";

export const metadata = getPageMetadata("/cookie-policy");

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = () => {
  

  return (
    <div className="bg-[#FBF7F4]">
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-tight font-bold">
          Cookie Policy
        </p>
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