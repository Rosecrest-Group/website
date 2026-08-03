import FAQ from "@/components/common/FAQ";
import { getFAQsForRoute } from "@/lib/faqs";

const ThermoFAQ = () => {
  const questions = getFAQsForRoute("/services/thermographic-surveys") ?? [];

  return (
    <FAQ
      questions={questions}
      subtitle="Clear answers about our thermographic and thermal-imaging building surveys."
    />
  );
};

export default ThermoFAQ;
