import FAQ from "@/components/common/FAQ";
import { getFAQsForRoute } from "@/lib/faqs";

const EPCFAQ = () => {
  const questions = getFAQsForRoute("/services/epc") ?? [];

  return (
    <FAQ
      questions={questions}
      subtitle="Here are answers to the most common questions about Energy Performance Certificates."
    />
  );
};

export default EPCFAQ;