"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, type ReactNode } from "react";
import ActionDropdown, { type DropdownAction } from "./ActionDropdown";
import Pagination from "./Pagination";
import SelectField from "./SelectField";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
  align?: "left" | "right";
  onSort?: () => void;
  sortDirection?: "asc" | "desc" | null;
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
  /** Fit the panel on desktop: columns share width and truncate instead of overflowing */
  fixedLayout?: boolean;
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
  /** Page-size choices shown next to pagination */
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  /** Row checkboxes plus a header select-all for the current page */
  selectable?: boolean;
  /** Which edge the checkbox column sits on */
  selectionSide?: "left" | "right";
  selectedKeys?: Array<string | number>;
  onSelectionChange?: (keys: Array<string | number>) => void;
  /** Keep rows visible but dimmed while refetching (stale-while-revalidate) */
  loading?: boolean;
  className?: string;
};

function TableCheckbox({
  checked,
  indeterminate = false,
  disabled = false,
  ariaLabel,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  onChange: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [checked, indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.checked)}
      onClick={(event) => event.stopPropagation()}
      className="size-4 cursor-pointer rounded border-line text-brand accent-brand focus:ring-2 focus:ring-brand-muted disabled:cursor-not-allowed"
    />
  );
}

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
  fixedLayout = false,
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
  pageSizeOptions,
  onPageSizeChange,
  selectable = false,
  selectionSide = "left",
  selectedKeys,
  onSelectionChange,
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
  const showPageSize = Boolean(pageSizeOptions?.length && onPageSizeChange);
  const showFooter = showToolbar || onPageChange != null || showPageSize;
  const colSpan =
    columns.length +
    (actions && actions.length > 0 ? 1 : 0) +
    (selectable ? 1 : 0);
  const selected = new Set((selectedKeys ?? []).map((key) => String(key)));
  const pageKeys = data.map((row, index) =>
    String(getRowKey ? getRowKey(row, index) : index),
  );
  const selectedOnPage = pageKeys.filter((key) => selected.has(key));
  const allPageSelected = pageKeys.length > 0 && selectedOnPage.length === pageKeys.length;
  const somePageSelected = selectedOnPage.length > 0 && !allPageSelected;

  function setSelected(next: Set<string>) {
    onSelectionChange?.(Array.from(next));
  }

  function toggleRow(key: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(key);
    else next.delete(key);
    setSelected(next);
  }

  function togglePage(checked: boolean) {
    const next = new Set(selected);
    for (const key of pageKeys) {
      if (checked) next.add(key);
      else next.delete(key);
    }
    setSelected(next);
  }

  const selectionOnRight = selectable && selectionSide === "right";
  const selectionHeader = selectable ? (
    <th
      scope="col"
      className={cn("w-10 px-3 py-3 sm:px-5", selectionOnRight ? "text-right" : "text-left")}
    >
      <TableCheckbox
        checked={allPageSelected}
        indeterminate={somePageSelected}
        disabled={data.length === 0}
        ariaLabel="Select all rows on this page"
        onChange={togglePage}
      />
    </th>
  ) : null;

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
          "min-w-0 transition-opacity duration-150",
          fixedLayout ? "overflow-x-auto lg:overflow-x-hidden" : "overflow-x-auto",
          loading && "pointer-events-none opacity-50",
        )}
      >
        <table
          className={cn(
            "w-full border-collapse",
            compact && "min-w-0",
            compact && fixedLayout && "table-fixed",
            !compact && !fixedLayout && "min-w-[640px]",
            !compact && fixedLayout && "min-w-[640px] lg:min-w-0 lg:table-fixed",
          )}
        >
          {!hideHeader && (
            <thead>
              <tr className={cn("border-b border-line", headerClassName)}>
                {selectionOnRight ? null : selectionHeader}
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
                    {col.onSort ? (
                      <button
                        type="button"
                        onClick={col.onSort}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-sm text-left motion-reduce:transition-none transition-colors duration-150 ease-out",
                          col.sortDirection ? "text-ink" : "hover:text-ink",
                        )}
                      >
                        {col.header}
                        <span aria-hidden className="text-[10px]">
                          {col.sortDirection === "asc" ? "↑" : col.sortDirection === "desc" ? "↓" : "↕"}
                        </span>
                      </button>
                    ) : (
                      col.header
                    )}
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
                {selectionOnRight ? selectionHeader : null}
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
                const keyStr = String(key);
                const isSelected = selected.has(keyStr);
                const customRowClass = rowClassName
                  ? rowClassName(row, rowIndex)
                  : "";

                return (
                  <tr
                    key={key}
                    aria-selected={selectable ? isSelected : undefined}
                    onClick={() => onRowClick?.(row, rowIndex)}
                    onMouseEnter={() => onRowMouseEnter?.(row, rowIndex)}
                    className={cn(
                      "border-b border-line last:border-b-0 transition-colors duration-150 ease-out motion-reduce:transition-none",
                      onRowClick && "cursor-pointer",
                      isSelected
                        ? "bg-brand-muted hover:bg-brand-muted"
                        : "hover:bg-sidebar/60",
                      customRowClass,
                    )}
                  >
                    {selectable && !selectionOnRight ? (
                      <td
                        className="w-10 px-3 py-3 sm:px-5 sm:py-4"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <TableCheckbox
                          checked={isSelected}
                          ariaLabel="Select row"
                          onChange={(checked) => toggleRow(keyStr, checked)}
                        />
                      </td>
                    ) : null}
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
                    {selectionOnRight ? (
                      <td
                        className="w-10 px-3 py-3 text-right sm:px-5 sm:py-4"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <TableCheckbox
                          checked={isSelected}
                          ariaLabel="Select row"
                          onChange={(checked) => toggleRow(keyStr, checked)}
                        />
                      </td>
                    ) : null}
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
          {showPageSize || onPageChange != null ? (
            <div className="flex flex-wrap items-center gap-3">
              {showPageSize && pageSizeOptions && onPageSizeChange ? (
                <SelectField
                  variant="filter"
                  aria-label="Rows per page"
                  value={String(size)}
                  disabled={loading}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (!Number.isFinite(next) || next === size) return;
                    onPageSizeChange(next);
                    onPageChange?.(1);
                  }}
                  className="w-auto min-w-18"
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectField>
              ) : null}
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
        </div>
      ) : null}
    </section>
  );
}
