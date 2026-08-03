import { sourceSans } from "@/lib/fonts";
import { Reveal } from "@/components/common/Reveal";
import { ShieldAlert } from "lucide-react";

const DISCLAIMER =
  "Counsellor approval is an independent professional judgment and cannot be guaranteed or purchased. All assessment documents must be the candidate's own original work. Rosecrest Group Ltd provides developmental guidance and feedback but does not write or generate assessment submissions on behalf of candidates. Assessment and membership decisions remain entirely with RICS.";

const MentoringDisclaimer = () => {
  return (
    <section className="bg-white py-12 lg:py-16 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Reveal animation="fade-up" duration={600}>
          <div className="rounded-2xl border border-[#F3F4F6] bg-[#FBF7F4] p-6 lg:p-8">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#262A6F] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-[#101828] mb-3">
                  Important information
                </h2>
                <p
                  className={`${sourceSans.className} text-sm lg:text-base text-[#4A5565] leading-relaxed`}
                >
                  {DISCLAIMER}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default MentoringDisclaimer;
