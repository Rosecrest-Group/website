import Footer from "@/components/common/Footer";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import PartyWallNoticeForm from "@/fragments/partywall/PartyWallNoticeForm";
import { sourceSans } from "@/lib/fonts";
import { Reveal } from "@/components/common/Reveal";
import { getPageMetadata } from "@/lib/page-metadata";

export const metadata = getPageMetadata("/services/party-wall/notice-generator");

const PartyWallGeneratorPage = () => {
  return (
    <div>
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-tight font-bold">
          Party Wall Notice Generator
        </p>
        <p className={`${sourceSans.className} mt-4 mx-auto text-white/90 text-base lg:text-xl leading-relaxed max-w-2xl`}>
          Complete the form below to generate your Party Wall notice. We
          prepare the document from the information you supply and email it
          to you on submission.
        </p>
      </JourneyHero>

      <section className="bg-white py-12 lg:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Reveal animation="fade-up" duration={600}>
            <div className="bg-[#FBF7F4] rounded-3xl p-6 lg:p-10 border border-gray-100">
              <PartyWallNoticeForm />
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartyWallGeneratorPage;
