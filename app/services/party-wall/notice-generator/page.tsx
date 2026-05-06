import Footer from "@/components/common/Footer";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";
// import { FileText, Mail, Shield, AlertCircle } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";

// ─── Update this URL once WordPress is on its subdomain ──────────────────────
const GENERATOR_URL =
  "https://cms.rosecrestgroupltd.co.uk/party-wall-notice-generator/?embedded=1";

// const features = [
//   {
//     icon: FileText,
//     title: "Legally compliant",
//     description:
//       "Notices generated in accordance with the Party Wall etc. Act 1996.",
//   },
//   {
//     icon: Mail,
//     title: "Delivered by email",
//     description:
//       "Your completed notice is emailed to you immediately on submission.",
//   },
//   {
//     icon: Shield,
//     title: "Free to generate",
//     description:
//       "Creating and receiving the generated notice is completely free. Professional fees only apply if you appoint us as your surveyor.",
//   },
//   {
//     icon: AlertCircle,
//     title: "Not legal advice",
//     description:
//       "This tool generates a notice document only. It is not legal or technical advice.",
//   },
// ];

import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/services/party-wall/notice-generator");

const PartyWallGeneratorPage = () => {
  return (
    <div>
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-tight font-bold">
          Party Wall Notice Generator
        </p>
        <p className={`${sourceSans.className} mt-4 mx-auto text-white/90 text-base lg:text-xl leading-relaxed max-w-2xl`}>
          Complete the form below to generate your Party Wall notice. We
          prepare the document from the information you supply and email it
          to you on submission.
        </p>
      </JourneyHero>

      {/* Iframe embed */}
      <section className="bg-white py-12 lg:py-16 px-4">
        <div className="max-w-9xl mx-auto">
          <Reveal animation="fade-up" duration={600}>
            <div className="bg-[#FBF7F4] rounded-3xl p-4 lg:p-8 border border-gray-100">
              <iframe
                src={GENERATOR_URL}
                title="Party Wall Notice Generator"
                className="w-full rounded-2xl border-0 min-h-600 md:min-h-450"
                loading="lazy"
              />
            </div>
          </Reveal>

          {/* Fallback if iframe is blocked */}
          <Reveal animation="fade-up" duration={500} delay={100}>
            <p className={`${sourceSans.className} text-center text-sm text-[#6A7282] mt-6`}>
              Having trouble loading the form?{" "}
              <a
                href={GENERATOR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#262A6F] font-medium hover:underline"
              >
                Open it in a new tab →
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartyWallGeneratorPage;