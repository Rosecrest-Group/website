import { CheckCircle } from "lucide-react";
import { sourceSans } from "@/lib/fonts";
import { Reveal, Stagger } from "@/components/common/Reveal";

const services = [
  "Initial eligibility and suitability discussions.",
  "Pathway and competency mapping.",
  "Structured professional-development planning.",
  "Regular progress and competency reviews.",
  "Review of experience records, CPD and supporting evidence.",
  "Developmental feedback on candidate-prepared submissions.",
  "Guidance on case-study selection and structure.",
  "Ethics and professional-practice preparation.",
  "Mock assessment interviews.",
  "Official RICS counsellor support, where Rosecrest has formally accepted the appointment.",
];

const MentoringServices = () => {
  return (
    <section className="bg-white py-16 lg:py-24 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Reveal animation="fade-up" duration={600}>
          <h2 className="text-3xl lg:text-5xl font-bold text-[#101828] text-center mb-4 leading-tight">
            Services may include
          </h2>
          <p
            className={`${sourceSans.className} text-[#4A5565] text-base lg:text-lg text-center max-w-3xl mx-auto mb-12 lg:mb-16 leading-relaxed`}
          >
            Support is tailored to each candidate&apos;s pathway, experience and
            development needs.
          </p>
        </Reveal>

        <Stagger
          animation="fade-up"
          staggerMs={60}
          duration={400}
          className="space-y-4"
        >
          {services.map((item) => (
            <div
              key={item}
              className="flex gap-3 items-start rounded-2xl border border-[#F3F4F6] bg-[#FBF7F4]/60 px-5 py-4"
            >
              <CheckCircle className="w-5 h-5 text-[#262A6F] shrink-0 mt-0.5" />
              <p
                className={`${sourceSans.className} text-base text-[#4A5565] leading-relaxed`}
              >
                {item}
              </p>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
};

export default MentoringServices;
