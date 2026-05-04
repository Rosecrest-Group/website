import { sourceSans } from "@/lib/fonts";
import JourneyHero from "@/fragments/journeys/JourneyHero";
import Footer from "@/components/common/Footer";
import AreasWeCoverClient from "./AreasWeCoverClient";
import { getPageMetadata } from "@/lib/page-metadata";


export const metadata = getPageMetadata("/areas-we-cover");
// ─── Component ───────────────────────────────────────────────────────────────
export default function AreasWeCoverPage() {
  return (
    <div className="bg-[#FBF7F4] min-h-screen">
      <JourneyHero height="">
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-tight font-bold">
          Areas We Cover
        </p>
        <p
          className={`${sourceSans.className} mt-6 mx-auto text-white/90 text-base lg:text-xl leading-relaxed max-w-2xl`}
        >
          Rosecrest delivers property inspection, compliance and consultancy
          services across London and areas within the M25.
        </p>
      </JourneyHero>

      <AreasWeCoverClient />

      <Footer />
    </div>
  );
}
