"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";
import ActionDropdown, { type DropdownAction } from "./ActionDropdown";
import Pagination from "./Pagination";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
  align?: "left" | "right";
};

export type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  actions?: DropdownAction[];
  onActionClick?: (actionId: string, row: T, index: number) => void;
  onRowClick?: (row: T, index: number) => void;
  onRowMouseEnter?: (row: T, index: number) => void;
  getRowKey?: (row: T, index: number) => string | number;
  headerClassName?: string;
  rowClassName?: (row: T, index: number) => string;
  hideHeader?: boolean;
  compact?: boolean;
  /** Mullr DataTable panel title (toolbar left) */
  title?: string;
  /** Controlled search shown in Mullr pill search field */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Extra controls in the toolbar (filters, sort, etc.) */
  toolbarExtra?: ReactNode;
  emptyMessage?: string;
  /** Total entries for footer (defaults to data.length) */
  totalCount?: number;
  /** 1-based page for Mullr footer pagination */
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  /** Keep rows visible but dimmed while refetching (stale-while-revalidate) */
  loading?: boolean;
  className?: string;
};

function TableSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative flex min-w-0 flex-1 items-center sm:max-w-xs">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-line bg-surface py-2 pl-4 pr-11 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-light"
      />
      <span className="pointer-events-none absolute right-1 flex size-8 items-center justify-center rounded-full bg-brand text-white">
        <Search className="size-3.5" strokeWidth={1.75} />
      </span>
    </div>
  );
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  actions,
  onActionClick,
  onRowClick,
  onRowMouseEnter,
  getRowKey,
  headerClassName,
  rowClassName,
  hideHeader = false,
  compact = false,
  title,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  toolbarExtra,
  emptyMessage = "No results",
  totalCount,
  page,
  pageSize,
  onPageChange,
  loading = false,
  className,
}: TableProps<T>) {
  const getCellValue = (row: T, key: keyof T | string): unknown => {
    if (typeof key === "string" && key.includes(".")) {
      return key.split(".").reduce<unknown>((obj, k) => {
        return (obj as Record<string, unknown>)?.[k];
      }, row as Record<string, unknown>);
    }
    return row[key as keyof T];
  };

  const showToolbar =
    Boolean(title) || onSearchChange != null || toolbarExtra != null;
  const total = totalCount ?? data.length;
  const currentPage = page ?? 1;
  const size = pageSize ?? (data.length || 1);
  const totalPages =
    onPageChange != null ? Math.max(1, Math.ceil(total / size)) : 1;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * size + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(currentPage * size, total);
  const showFooter = showToolbar || onPageChange != null;
  const colSpan = columns.length + (actions && actions.length > 0 ? 1 : 0);

  return (
    <section
      aria-busy={loading || undefined}
      className={cn(
        "overflow-hidden rounded-xl border border-line bg-surface",
        className,
      )}
    >
      {showToolbar ? (
        <div className="flex flex-col gap-3 border-b border-line px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
          {title ? (
            <h2 className="text-base font-medium text-ink">{title}</h2>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap items-center gap-2">
            {onSearchChange != null ? (
              <TableSearch
                value={search ?? ""}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
              />
            ) : null}
            {toolbarExtra}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "overflow-x-auto transition-opacity duration-150",
          loading && "pointer-events-none opacity-50",
        )}
      >
        <table
          className={cn(
            "w-full border-collapse",
            compact ? "min-w-0" : "min-w-[640px]",
          )}
        >
          {!hideHeader && (
            <thead>
              <tr className={cn("border-b border-line", headerClassName)}>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    scope="col"
                    style={{ width: col.width }}
                    className={cn(
                      "px-3 py-3 text-xs font-normal text-ink-subtle sm:px-5",
                      col.align === "right" ? "text-right" : "text-left",
                      col.headerClassName,
                    )}
                  >
                    {col.header}
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th
                    scope="col"
                    className="px-3 py-3 text-center text-xs font-normal text-ink-subtle sm:px-5"
                  >
                    Action
                  </th>
                )}
              </tr>
            </thead>
          )}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-3 py-8 text-center text-sm text-ink-subtle sm:px-5 sm:py-12"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const key = getRowKey ? getRowKey(row, rowIndex) : rowIndex;
                const customRowClass = rowClassName
                  ? rowClassName(row, rowIndex)
                  : "";

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row, rowIndex)}
                    onMouseEnter={() => onRowMouseEnter?.(row, rowIndex)}
                    className={cn(
                      "border-b border-line last:border-b-0 transition-colors hover:bg-sidebar/60",
                      onRowClick && "cursor-pointer",
                      customRowClass,
                    )}
                  >
                    {columns.map((col) => {
                      const value = getCellValue(row, col.key);
                      const content = col.render
                        ? col.render(value, row, rowIndex)
                        : value == null || value === ""
                          ? "—"
                          : String(value);

                      return (
                        <td
                          key={String(col.key)}
                          style={{ width: col.width }}
                          className={cn(
                            "px-3 py-3 text-sm text-ink sm:px-5 sm:py-4",
                            col.align === "right" && "text-right",
                            col.className,
                          )}
                        >
                          {content}
                        </td>
                      );
                    })}
                    {actions && actions.length > 0 && (
                      <td
                        className="relative px-3 py-3 text-center sm:px-5 sm:py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ActionDropdown
                          actions={actions}
                          onActionClick={(actionId) =>
                            onActionClick?.(actionId, row, rowIndex)
                          }
                        />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showFooter ? (
        <div className="flex flex-col gap-3 border-t border-line px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <p className="text-sm text-ink-subtle">
            {total === 0
              ? "Showing 0 entries"
              : `Showing ${rangeStart} to ${rangeEnd} of ${total} entries`}
          </p>
          {onPageChange != null ? (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              label="Table pagination"
              disabled={loading}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
