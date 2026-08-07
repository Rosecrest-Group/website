import { cn } from "@/lib/utils";

/** Mirrors the avatar + bubble layout of ThreadBubble so the thread doesn't reflow on load. */
const ROWS: Array<{ outbound: boolean; width: string; lines: number }> = [
  { outbound: false, width: "w-64", lines: 2 },
  { outbound: true, width: "w-72", lines: 3 },
  { outbound: false, width: "w-56", lines: 1 },
  { outbound: true, width: "w-80", lines: 2 },
  { outbound: false, width: "w-60", lines: 2 },
];

export default function MessageThreadSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} aria-hidden>
      <span className="sr-only">Loading conversation</span>
      {ROWS.map((row, index) => (
        <div
          key={index}
          className={cn("flex animate-pulse gap-2", row.outbound ? "flex-row-reverse" : "flex-row")}
        >
          <div className="size-8 shrink-0 rounded-full bg-(--color-tc-20)/60" />
          <div className={cn("flex flex-col gap-1.5", row.outbound ? "items-end" : "items-start")}>
            <div className="h-3 w-24 rounded-full bg-(--color-tc-20)/50" />
            <div
              className={cn(
                "space-y-2 rounded-2xl px-4 py-3",
                row.width,
                row.outbound ? "bg-(--color-tc-20)/50" : "bg-white"
              )}
            >
              {Array.from({ length: row.lines }).map((_, line) => (
                <div
                  key={line}
                  className={cn(
                    "h-2.5 rounded-full bg-(--color-tc-20)/60",
                    line === row.lines - 1 ? "w-2/3" : "w-full"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
