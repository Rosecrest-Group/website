import Footer from "@/components/common/Footer";
import JsonLd from "@/components/common/JsonLd";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import ThermoDescription from "@/fragments/thermographic-surveys/ThermoDescription";
import ThermoIncludes from "@/fragments/thermographic-surveys/ThermoIncludes";
import ThermoPricing from "@/fragments/thermographic-surveys/ThermoPricing";
import ThermoDisclaimer from "@/fragments/thermographic-surveys/ThermoDisclaimer";
import ThermoMoreInfo from "@/fragments/thermographic-surveys/ThermoMoreInfo";
import ThermoFAQ from "@/fragments/thermographic-surveys/ThermoFAQ";
import { getFAQsForRoute } from "@/lib/faqs";
import { sourceSans } from "@/lib/fonts";
import { getPageMetadata } from "@/lib/page-metadata";
import { buildFAQPage, buildService } from "@/lib/schema";

export const metadata = getPageMetadata("/services/thermographic-surveys");

const Page = () => {
  const faqs = getFAQsForRoute("/services/thermographic-surveys") ?? [];

  return (
    <div>
      <JsonLd
        id="thermographic-surveys"
        data={[
          buildService({
            name: "Thermographic Building Surveys",
            description:
              "Non-invasive thermographic surveys using infrared imaging to identify surface-temperature patterns that may be associated with heat loss, insulation issues, moisture and water ingress.",
            path: "/services/thermographic-surveys",
            serviceType: "Thermographic Survey",
          }),
          buildFAQPage(faqs),
        ]}
      />
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-16 sm:w-4/5 mx-auto">
          Thermographic Building Surveys
        </p>
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
