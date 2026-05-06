import Footer from "@/components/common/Footer";
import JsonLd from "@/components/common/JsonLd";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import CreatePartyWall from "@/fragments/partywall/CreatePartyWall";
import PartywallDesc from "@/fragments/partywall/PartyWallDesc";
import PartyWallFAQ from "@/fragments/partywall/PartywallFAQ";
import PartyWallIncludes from "@/fragments/partywall/PartywallIncludes";
import SingleAppointedSurveyor from "@/fragments/partywall/SingleAppointed";
import { getFAQsForRoute } from "@/lib/faqs";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";
import { buildFAQPage, buildService } from "@/lib/schema";

export const metadata = getPageMetadata("/services/party-wall");

const Page = () => {
  const faqs = getFAQsForRoute("/services/party-wall") ?? [];
  return (
    <div>
      <JsonLd
        id="party-wall"
        data={[
          buildService({
            name: "Party Wall Surveying",
            description:
              "Party Wall etc. Act 1996 notices, schedules of condition, and awards across London and the M25 corridor.",
            path: "/services/party-wall",
            serviceType: "Party Wall Surveyor",
          }),
          buildFAQPage(faqs),
        ]}
      />
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16">
          Party Wall and Professional Advice
        </p>
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
