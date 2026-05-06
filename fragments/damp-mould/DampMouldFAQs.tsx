import FAQ from "@/components/common/FAQ";
import { getFAQsForRoute } from "@/lib/faqs";

const DampMouldFAQ = () => {
  const questions = getFAQsForRoute("/services/damp-mould") ?? [];

  return (
    <FAQ
      questions={questions}
      subtitle="Here are answers to the most common questions about our damp, mould and condensation inspection service."
    />
  );
};

export default DampMouldFAQ;