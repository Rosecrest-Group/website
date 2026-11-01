"use client";

import { useEffect } from "react";
import ErrorPanel from "@/components/site/articles/ErrorPanel";
import { ButtonLink, buttonClass } from "@/components/site/primitives";

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
    <ErrorPanel
      title="Could not load blog posts"
      text="There was a problem fetching the latest posts. Please check your connection and try again."
    >
      <button type="button" onClick={reset} className={`${buttonClass("primary")} cursor-pointer border-0`}>
        Try again
      </button>
      <ButtonLink href="/guides" variant="outline">
        Browse our guides
      </ButtonLink>
    </ErrorPanel>
  );
}
