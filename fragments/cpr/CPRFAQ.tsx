import FAQ from "@/components/common/FAQ";
import { getFAQsForRoute } from "@/lib/faqs";

const CPRFAQ = () => {
  const questions = getFAQsForRoute("/services/cpr-35-reports") ?? [];

  return (
    <FAQ
      questions={questions}
      subtitle="Here are answers to the most common questions about our CPR-35 expert witness reports."
    />
  );
};

export default CPRFAQ;