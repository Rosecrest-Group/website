import Footer from "@/components/common/Footer";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import CreatePartyWall from "@/fragments/partywall/CreatePartyWall";
import PartywallDesc from "@/fragments/partywall/PartyWallDesc";
import PartyWallFAQ from "@/fragments/partywall/PartywallFAQ";
import PartyWallIncludes from "@/fragments/partywall/PartywallIncludes";
import SingleAppointedSurveyor from "@/fragments/partywall/SingleAppointed";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";

export const metadata = getPageMetadata("/services/party-wall");

const Page = () => {
  return (
    <div>
      <PageJsonLd path="/services/party-wall" />
      <JourneyHero>
        <h1 className="text-white text-4xl lg:text-5xl tracking-tight leading-16">
          Party Wall and Professional Advice
        </h1>
        <p
          className={`${sourceSans.className} mt-10 max-w-4xl mx-auto text-white text-xl lg:text-2xl leading-relaxed`}
        >
          A Party Wall Surveyor performs a specialist role in resolving disputes
          between neighbours under the Party Wall etc Act 1996.
        </p>
      </JourneyHero>
      <PartywallDesc />
      <PartyWallIncludes />
      <SingleAppointedSurveyor />
      <CreatePartyWall />
      <PartyWallFAQ />
      <Footer />
    </div>
  );
};

export default Page;
