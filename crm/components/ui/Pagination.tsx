"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
  className?: string;
};

function PaginationButton({
  children,
  ariaLabel,
  active = false,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  ariaLabel: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
        active
          ? "bg-brand text-white"
          : "border border-brand text-brand hover:bg-brand-muted",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {children}
    </button>
  );
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "…")[] {
  const maxVisible = 7;
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "…")[] = [1];
  if (currentPage <= 4) {
    for (let i = 2; i <= 5; i++) pages.push(i);
    pages.push("…", totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push("…");
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push("…", currentPage - 1, currentPage, currentPage + 1, "…", totalPages);
  }
  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  label = "Pagination",
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={label} className={cn("flex items-center gap-1.5", className)}>
      <PaginationButton
        ariaLabel="Previous page"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="size-4" strokeWidth={1.75} />
      </PaginationButton>

      {getPageNumbers(currentPage, totalPages).map((page, index) =>
        page === "…" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-ink-faint">
            …
          </span>
        ) : (
          <PaginationButton
            key={page}
            ariaLabel={`Page ${page}`}
            active={page === currentPage}
            onClick={() => onPageChange(page)}
          >
            {page}
          </PaginationButton>
        ),
      )}

      <PaginationButton
        ariaLabel="Next page"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="size-4" strokeWidth={1.75} />
      </PaginationButton>
    </nav>
  );
}
