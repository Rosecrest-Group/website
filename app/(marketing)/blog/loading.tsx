import JourneyHero from "@/fragments/journeys/JourneyHero";
import { sourceSans } from "@/lib/fonts";

export default function BlogLoading() {
  return (
    <div className="bg-[#FBF7F4] min-h-screen">
      {/* Hero skeleton */}
      <JourneyHero>
        <p className="text-white text-4xl lg:text-5xl tracking-tight leading-tight font-bold">
          News & Insights
        </p>
        <p
          className={`${sourceSans.className} mt-6 mx-auto text-white/90 text-base lg:text-xl leading-relaxed max-w-2xl`}
        >
          Property advice, industry updates and guidance from the Rosecrest
          team.
        </p>
      </JourneyHero>

      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100"
            >
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
