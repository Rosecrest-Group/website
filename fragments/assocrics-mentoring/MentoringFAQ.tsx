import FAQ from "@/components/common/FAQ";
import { getFAQsForRoute } from "@/lib/faqs";

const MentoringFAQ = () => {
  const questions = getFAQsForRoute("/services/assocrics-mentoring") ?? [];

  return (
    <FAQ
      questions={questions}
      subtitle="Clear answers about our AssocRICS mentoring and counsellor support."
    />
  );
};

export default MentoringFAQ;
