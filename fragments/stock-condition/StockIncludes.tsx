import Link from "next/link";
import {
  ClipboardCheck,
  ShieldCheck,
  CalendarClock,
  TrendingUp,
  SmilePlus,
  BarChart3,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { sourceSans } from "@/lib/fonts";

const items = [
  {
    icon: ClipboardCheck,
    title: "Comprehensive Property Assessments",
    description:
      "We conduct thorough evaluations of your housing stock, examining critical elements such as roofs, windows, heating systems and insulation. Our surveys help you identify potential issues early, ensuring your properties remain safe and habitable.",
  },
  {
    icon: ShieldCheck,
    title: "Regulatory Compliance Assurance",
    description:
      "Stay ahead of regulatory requirements, including health and safety standards, building regulations and energy efficiency regulations. Our surveys ensure your properties meet all necessary legal standards, providing you with peace of mind. Need help with compliance on energy efficiency? Learn about our Energy Performance Certificates (EPC).",
  },
  {
    icon: CalendarClock,
    title: "Proactive Maintenance Planning",
    description:
      "Utilising data from our surveys, you can efficiently plan and prioritise maintenance and refurbishment projects. We help you allocate your budget effectively, preventing minor issues from escalating into costly problems.",
  },
  {
    icon: TrendingUp,
    title: "Enhanced Housing Quality",
    description:
      "Take advantage of our insights to improve living conditions for your tenants. Whether upgrading facilities or enhancing energy efficiency, our surveys provide the information you need to implement meaningful changes. Our housing disrepair surveys are a great way to ensure properties meet tenant needs.",
  },
  {
    icon: SmilePlus,
    title: "Increased Tenant Satisfaction",
    description:
      "A well-maintained property fosters happier tenants. Our surveys enable you to create safe, secure and comfortable environments that enhance tenant well-being and satisfaction. Explore how we support tenants further with our residential services.",
  },
  {
    icon: BarChart3,
    title: "Strategic Asset Management",
    description:
      "Our surveys provide valuable data to inform decisions about the future of your housing stock. Whether planning renovations, sales or redevelopment, we offer the insights needed to manage your assets strategically.",
  },
  {
    icon: Leaf,
    title: "Environmental Responsibility",
    description:
      "Sustainability is vital in today's world. Our surveys assess the energy performance of your properties, assisting you in meeting government targets for reducing carbon emissions and improving energy efficiency.",
  },
];

export default function StockIncludes({
  title = "Our Stock Condition Surveys Service Includes;",
}: {
  title?: string;
}) {
  return (
    <section className="py-16 lg:py-24 px-4 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <h2 className="text-3xl lg:text-5xl font-bold text-[#101828] text-center mb-12 lg:mb-16 max-w-4xl mx-auto leading-tight">
          {title}
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className={[
                  "relative border border-[#F3F4F6] rounded-2xl p-8 overflow-hidden",
                ].join(" ")}
              >
                {/* Watermark circle top-right */}
                <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-gray-200/60 bg-linear-to-tr from-[#2B7FFF1A] to-[#00000000] pointer-events-none opacity-30" />

                {/* Icon */}
                <div className="relative w-16 h-16 rounded-2xl bg-[#262A6F] flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="relative text-2xl font-bold text-[#101828] mb-3">
                  {item.title}:
                </h3>

                {/* Description */}
                <p className={`${sourceSans.className} relative text-base text-[#4A5565] leading-relaxed`}>
                  {item.description}
                </p>
              </div>
            );
          })}

          {/* CTA card */}
          <div className="relative bg-[#262A6F] rounded-2xl p-8 overflow-hidden flex flex-col justify-between min-h-55">
            <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Need Guidance?
              </h3>
              <p className={`${sourceSans.className} text-[#D1D5DC]`}>
                Speak to our team to discuss your specific requirements
              </p>
            </div>

            <Link
              href="/contact"
              className={`${sourceSans.className} text-[#DBB38E] inline-flex items-center gap-2 text-sm font-medium mt-8 hover:gap-3 transition-all duration-200`}
            >
              Get in Touch <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
