"use client";

import { useEffect } from "react";
import ErrorPanel from "@/components/site/articles/ErrorPanel";
import { ButtonLink, buttonClass } from "@/components/site/primitives";

export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Blog post error:", error);
  }, [error]);

  return (
    <ErrorPanel
      title="Could not load this post"
      text="There was a problem loading this article. Please check your connection and try again."
    >
      <button type="button" onClick={reset} className={`${buttonClass("primary")} cursor-pointer border-0`}>
        Try again
      </button>
      <ButtonLink href="/blog" variant="outline">
        Back to blog
      </ButtonLink>
    </ErrorPanel>
  );
}
