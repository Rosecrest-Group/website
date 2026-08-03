import { CheckCircle, FileText, Camera, Search, ClipboardList } from "lucide-react";
import { sourceSans } from "@/lib/fonts";
import { Reveal, Stagger } from "@/components/common/Reveal";

const includes = [
  {
    icon: Search,
    title: "On-site inspection",
    description:
      "A non-invasive thermographic survey of the instructed areas, carried out under suitable environmental conditions.",
  },
  {
    icon: Camera,
    title: "Thermal and conventional images",
    description:
      "Relevant thermal images paired with corresponding conventional photographs for clear comparison.",
  },
  {
    icon: ClipboardList,
    title: "Professional interpretation",
    description:
      "Surveyor-led explanation of identified surface-temperature anomalies in context.",
  },
  {
    icon: FileText,
    title: "Written report",
    description:
      "A written report with recommendations for any necessary further investigation.",
  },
];

const ThermoIncludes = () => {
  return (
    <section className="bg-white py-16 lg:py-24 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Reveal animation="fade-up" duration={600}>
          <h2 className="text-3xl lg:text-5xl font-bold text-[#101828] text-center mb-4 leading-tight">
            What&apos;s included
          </h2>
          <p
            className={`${sourceSans.className} text-[#4A5565] text-base lg:text-lg text-center max-w-3xl mx-auto mb-12 lg:mb-16 leading-relaxed`}
          >
            Each survey price includes the inspection and a written report
            containing relevant thermal images, corresponding photographs, an
            explanation of identified anomalies, and recommendations for any
            necessary further investigation.
          </p>
        </Reveal>

        <Stagger
          animation="fade-up"
          staggerMs={80}
          duration={450}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {includes.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative border border-[#F3F4F6] rounded-2xl p-8 overflow-hidden bg-[#FBF7F4]/40"
              >
                <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-gray-200/60 pointer-events-none opacity-30" />
                <div className="relative w-16 h-16 rounded-2xl bg-[#262A6F] flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="relative text-2xl font-bold text-[#101828] mb-3">
                  {item.title}
                </h3>
                <p
                  className={`${sourceSans.className} relative text-base text-[#4A5565] leading-relaxed`}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </Stagger>

        <Reveal animation="fade-up" duration={500} delay={200}>
          <div className="mt-10 flex gap-3 items-start rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 max-w-4xl mx-auto">
            <CheckCircle className="w-5 h-5 text-[#262A6F] shrink-0 mt-0.5" />
            <p
              className={`${sourceSans.className} text-sm lg:text-base text-[#4A5565] leading-relaxed`}
            >
              A professional, surveyor-led and evidence-based service — focused
              on interpretation and practical recommendations, not a basic
              camera scan.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ThermoIncludes;
