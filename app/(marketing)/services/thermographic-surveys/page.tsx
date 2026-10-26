import Footer from "@/components/common/Footer";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import ThermoDescription from "@/fragments/thermographic-surveys/ThermoDescription";
import ThermoIncludes from "@/fragments/thermographic-surveys/ThermoIncludes";
import ThermoPricing from "@/fragments/thermographic-surveys/ThermoPricing";
import ThermoDisclaimer from "@/fragments/thermographic-surveys/ThermoDisclaimer";
import ThermoMoreInfo from "@/fragments/thermographic-surveys/ThermoMoreInfo";
import ThermoFAQ from "@/fragments/thermographic-surveys/ThermoFAQ";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";
import PageJsonLd from "@/components/common/PageJsonLd";

export const metadata = getPageMetadata("/services/thermographic-surveys");

const Page = () => {
  return (
    <div>
      <PageJsonLd path="/services/thermographic-surveys" />
      <JourneyHero>
        <h1 className="text-white text-4xl lg:text-5xl tracking-tight leading-16 sm:w-4/5 mx-auto">
          Thermographic Building Surveys
        </h1>
        <p
          className={`${sourceSans.className} mt-10 max-w-3xl mx-auto text-white text-xl lg:text-2xl leading-relaxed`}
        >
          Surveyor-led thermal-imaging building surveys with professional
          interpretation and a written report.
        </p>
      </JourneyHero>
      <ThermoDescription />
      <ThermoIncludes />
      <ThermoPricing />
      <ThermoDisclaimer />
      <ThermoFAQ />
      <ThermoMoreInfo />
      <Footer />
    </div>
  );
};

export default Page;
