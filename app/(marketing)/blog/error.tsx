"use client";

import { useEffect } from "react";
import { sourceSans } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Blog error:", error);
  }, [error]);

  return (
    <div className="bg-[#FBF7F4] min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-sm border border-gray-100">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-[#101828] mb-2">
          Could not load blog posts
        </h2>
        <p className={`${sourceSans.className} text-sm text-[#4A5565] mb-6`}>
          There was a problem fetching the latest posts. Please check your connection and try again.
        </p>
        <Button
          onClick={reset}
          className="bg-[#262A6F] hover:bg-[#262A6F]/90 text-white rounded-full px-8"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}