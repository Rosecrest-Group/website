import Footer from "@/components/common/Footer";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import LandlordsDesc from "@/fragments/landlord/Description";
import LandlordMoreInfo from "@/fragments/landlord/MoreInfo";
import LandlordsServices from "@/fragments/landlord/Services";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";

export const metadata = getPageMetadata("/landlord");

const Page = () => {
  return (
    <div>
      <JourneyHero>
        <div className="text-center">
          <p className="text-white text-3xl lg:text-5xl tracking-tight leading-16 sm:w-[64%] mx-auto">
            Housing Disrepair and Awaab&apos;s Law Advice for Landlords &
            Property Owners
          </p>
          <p
            className={`${sourceSans.className} mt-4 mx-auto text-white text-base lg:text-xl leading-relaxed max-w-3xl`}
          >
            Independent inspections and clear reporting to help landlords manage
            housing disrepair claims, compliance obligations and property
            condition disputes.
          </p>
        </div>
      </JourneyHero>
      <LandlordsDesc />
      <LandlordsServices />
      <LandlordMoreInfo />
      <Footer />
    </div>
  );
};

export default Page;
