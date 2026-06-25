import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
import Footer from "@/components/common/Footer";
import { getPageMetadata } from "@/lib/page-metadata";
import PrivacyPolicyClient from "./PrivacyPolicyClient";

export const metadata = getPageMetadata("/privacy-policy");

const Page = () => {
  return (
    <div className="bg-[#FBF7F4]">
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-tight font-bold">
          Privacy Policy
        </p>
        <p
          className={`${sourceSans.className} mt-6 mx-auto text-white/90 text-base lg:text-xl leading-relaxed max-w-2xl`}
        >
          We are committed to protecting your personal information and being
          transparent about how it is used.
        </p>
      </JourneyHero>

      <PrivacyPolicyClient />

      <Footer />
    </div>
  );
};

export default Page;
