import JourneyHero from "@/fragments/journeys/JourneyHero";

export default function BlogPostLoading() {
  return (
    <div className="bg-[#FBF7F4] min-h-screen">
      <JourneyHero>
        <p>Blog</p>
      </JourneyHero>
      <article className="max-w-3xl mx-auto px-4 py-16">
        {/* Back link skeleton */}
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-8" />

        {/* Featured image skeleton */}
        <div className="h-64 lg:h-96 w-full rounded-2xl bg-gray-200 animate-pulse mb-8" />

        {/* Date skeleton */}
        <div className="h-3 w-28 bg-gray-200 rounded animate-pulse mb-3" />

        {/* Title skeleton */}
        <div className="space-y-3 mb-10">
          <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`h-4 bg-gray-100 rounded animate-pulse ${i % 3 === 2 ? "w-2/3" : "w-full"}`}
            />
          ))}
        </div>
      </article>
    </div>
  );
}
