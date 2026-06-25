import { getPageMetadata } from "@/lib/page-metadata";
import HomebuyerClient from "./HomebuyerClient";
import JsonLd from "@/components/common/JsonLd";
import { buildFAQPage, buildService, buildWebPage } from "@/lib/schema";
import { getFAQsForRoute } from "@/lib/faqs";

export const metadata = getPageMetadata("/homebuyer");

const Page = () => {
  const faqs = getFAQsForRoute("/homebuyer") ?? [];

  return (
    <>
      <JsonLd
        id="homebuyer"
        data={[
          buildWebPage(
            "/homebuyer",
            "Homebuyer Surveys",
            "RICS Level 1, 2 and 3 surveys for property buyers in London and the M25."
          ),
          buildService({
            name: "Homebuyer Surveys",
            description:
              "RICS-regulated Level 1, 2 and 3 property surveys for buyers across London and the M25, with clear defect reporting and traffic-light condition ratings.",
            path: "/homebuyer",
            serviceType: "Property Survey",
          }),
          buildFAQPage(faqs),
        ]}
      />
      <HomebuyerClient />
    </>
  );
};

export default Page;