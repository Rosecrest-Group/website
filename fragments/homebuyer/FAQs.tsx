import FAQ from "@/components/common/FAQ";
import { getFAQsForRoute } from "@/lib/faqs";

const HomebuyerFAQ = () => {
  const questions = getFAQsForRoute("/homebuyer") ?? [];

  return (
    <FAQ
      questions={questions}
      subtitle="Here are answers to the most common questions about our property surveys, valuations, and reports."
    />
  );
};

export default HomebuyerFAQ;