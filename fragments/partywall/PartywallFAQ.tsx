import FAQ from "@/components/common/FAQ";
import { getFAQsForRoute } from "@/lib/faqs";

const PartyWallFAQ = () => {
  const questions = getFAQsForRoute("/services/party-wall") ?? [];

  return (
    <FAQ
      questions={questions}
      subtitle="Here are answers to the most common questions about Party Wall and boundary services."
    />
  );
};

export default PartyWallFAQ;