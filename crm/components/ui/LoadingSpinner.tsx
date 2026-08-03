export default function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div
        className="size-8 animate-spin rounded-full border-2 border-brand-muted border-t-brand"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
