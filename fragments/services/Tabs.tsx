"use client";
import ServiceCard from "@/components/landing/ServiceCard";
import {
  Home,
  ClipboardList,
  Droplets,
  Users,
  FileText,
  Search,
  Zap,
  Leaf,
  Wrench,
  Hammer,
  Sparkles,
  SprayCan,
  Paintbrush,
  Trash2,
  Grid3X3,
  Droplet,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Reveal } from "@/components/common/Reveal";

type Tab = "survey" | "trade";

const surveyServices = [
  {
    icon: ClipboardList,
    title: "Stock Condition Assessments",
    description:
      "Comprehensive inspections to assess property condition, lifecycle costs, and long-term asset planning.",
    href: "/services/stock-condition",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: Droplets,
    title: "Damp, Mould & Condensation",
    description:
      "Independent inspection and reporting to identify causes, risks, and appropriate remedial actions.",
    href: "/services/damp-mould",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: Users,
    title: "Party Wall and professional advice",
    description:
      "Independent party wall surveying and professional advice for residential and commercial projects.",
    href: "/services/party-wall",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: FileText,
    title: "CPR 35-compliant reports",
    description:
      "Court-compliant expert reports prepared in line with CPR 35 and professional standards.",
    href: "/services/cpr-35-reports",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: Search,
    title: "RICS Building Surveys (Level 1, 2 & 3)",
    description:
      "Detailed RICS-compliant surveys providing clear insight into property condition and risks.",
    href: "/homebuyer",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: Home,
    title: "Housing Disrepair Claims",
    description:
      "Independent inspections and reporting to support housing disrepair claims and legal proceedings.",
    href: "/services/housing-disrepair",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: Zap,
    title: "Energy Performance Certificates",
    description:
      "Accurate energy assessments and certification to support regulatory compliance and property efficiency.",
    href: "/services/epc",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: Leaf,
    title: "Environmental Reports",
    description:
      "Professional environmental risk assessments covering flood risk, contaminated land, radon, ground stability and more.",
    href: "/services/environmental-reports",
    iconBgColor: "bg-[#262A6F]",
  },
];

const tradeServices = [
  {
    icon: Wrench,
    title: "Handyman Services",
    description:
      "Reliable property maintenance and minor repairs carried out efficiently and professionally.",
    href: "/services/handyman",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: Hammer,
    title: "Carpentry Services",
    description:
      "Precision carpentry solutions for repairs, installations, and bespoke joinery works.",
    href: "/services/carpentry",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: Sparkles,
    title: "Carpet Cleaning",
    description:
      "Deep professional carpet cleaning for residential and commercial properties.",
    href: "/services/carpet-cleaning",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: SprayCan,
    title: "Deep Cleaning",
    description:
      "Comprehensive deep-cleaning services for end-of-tenancy, voids, and occupied properties.",
    href: "/services/deep-cleaning",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: Paintbrush,
    title: "Plastering Service",
    description:
      "High-quality plastering and surface finishing for repairs, refurbishments, and new works.",
    href: "/services/plastering",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: Trash2,
    title: "House Clearance",
    description:
      "Efficient, respectful property clearance services for voids, refurbishments, and relocations.",
    href: "/services/house-clearance",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: Grid3X3,
    title: "Tiling Service",
    description:
      "Professional wall and floor tiling for kitchens, bathrooms, and high-use areas.",
    href: "/services/tiling",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: Droplet,
    title: "Plumbing Service",
    description:
      "Responsive plumbing repairs, installations, and maintenance for residential and commercial properties.",
    href: "/services/plumbing",
    iconBgColor: "bg-[#262A6F]",
  },
  {
    icon: Paintbrush,
    title: "Painting & Decorating",
    description:
      "High-quality internal and external finishes delivered to professional standards.",
    href: "/services/painting-decorating",
    iconBgColor: "bg-[#262A6F]",
  },
];

const ServiceTabs = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get("tab");
  const activeTab: Tab =
    rawTab === "survey" || rawTab === "trade" ? rawTab : "survey";

  const setTab = useCallback(
    (tab: Tab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const activeServices =
    activeTab === "survey" ? surveyServices : tradeServices;

  return (
    <section className="relative -mt-64 lg:-mt-64 px-4 lg:px-8 pb-16 lg:pb-24 z-20">
      <div className="max-w-7xl mx-auto bg-white rounded-4xl p-8 overflow-hidden">

        {/* Tab selector */}
        <Reveal animation="fade-up" duration={500}>
          <div className="flex gap-6 lg:gap-12 mb-10 items-center justify-center z-80">
            {(["survey", "trade"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setTab(tab)}
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <span className="text-xl md:text-3xl font-semibold text-[#151515] transition-colors duration-200">
                  {tab === "survey" ? "Survey Services" : "Trade Services"}
                </span>
                <span
                  className={`block w-[110%] h-1.5 rounded-t-lg transition-colors duration-200 ${
                    activeTab === tab ? "bg-[#262A6F]" : "bg-gray-200"
                  }`}
                />
              </button>
            ))}
          </div>
        </Reveal>

        {/* Cards grid */}
        <Reveal animation="fade-up" duration={600} delay={100} threshold={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
            {activeServices.map((service, index) => {
              const isLastOdd =
                activeServices.length % 2 !== 0 &&
                index === activeServices.length - 1;
              return (
                <div
                  key={index}
                  className={isLastOdd ? "sm:col-span-2 sm:w-1/2 sm:mx-auto" : ""}
                >
                  <ServiceCard
                    icon={service.icon}
                    title={service.title}
                    description={service.description}
                    href={service.href}
                    iconBgColor={service.iconBgColor}
                  />
                </div>
              );
            })}
          </div>
        </Reveal>

      </div>
    </section>
  );
};

export default ServiceTabs;