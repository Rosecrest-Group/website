"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 4) {
        // Near the start
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near the end
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="h-10 w-10 rounded-xl bg-white border border-(--color-pc-10) flex items-center justify-center text-(--color-primary) hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14 7l-5 5m0 0l5 5"/>
        </svg>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2 bg-[#fafafa] p-2 rounded-xl">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-slate-500">
                ...
              </span>
            );
          }
          
          const pageNum = page as number;
          const isActive = pageNum === currentPage;
          
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                isActive
                  ? "bg-transparent border border-(--color-pc-10) text-slate-600"
                  : "bg-transparent text-slate-600 hover:bg-white/50"
              }`}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="h-10 w-10 rounded-xl bg-white border border-(--color-pc-10) flex items-center justify-center text-(--color-primary) hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10 17l5-5m0 0l-5-5"/>
        </svg>
      </button>

      {/* Go to Page */}
      <div className="flex items-center gap-2 ml-4">
        <span className="text-sm text-slate-600">Go to page:</span>
        <select
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="h-10 px-3 rounded-xl bg-white border border-(--color-tc-20) text-sm text-slate-700 outline-none focus:ring-2 focus:ring-(--color-primary)/20"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onPageChange(currentPage)}
          className="h-10 px-4 rounded-xl bg-(--color-primary) text-white text-sm font-medium hover:bg-(--color-pc-60) transition-colors"
        >
          GO
        </button>
      </div>
    </div>
  );
}
