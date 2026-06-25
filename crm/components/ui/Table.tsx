"use client";

import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import ActionDropdown, { type DropdownAction } from "./ActionDropdown";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
};

export type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  actions?: DropdownAction[];
  onActionClick?: (actionId: string, row: T, index: number) => void;
  onRowClick?: (row: T, index: number) => void;
  getRowKey?: (row: T, index: number) => string | number;
  headerClassName?: string;
  rowClassName?: (row: T, index: number) => string;
  hideHeader?: boolean;
  compact?: boolean;
};

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  actions,
  onActionClick,
  onRowClick,
  getRowKey,
  headerClassName = "bg-(--color-primary) text-white",
  rowClassName,
  hideHeader = false,
  compact = false,
}: TableProps<T>) {
  const getCellValue = (row: T, key: keyof T | string): unknown => {
    if (typeof key === "string" && key.includes(".")) {
      return key.split(".").reduce<unknown>((obj, k) => {
        return (obj as Record<string, unknown>)?.[k];
      }, row as Record<string, unknown>);
    }
    return row[key as keyof T];
  };

  return (
    <div className={cn("overflow-x-auto", !hideHeader && "rounded-2xl")}>
      <ShadcnTable className={compact ? "min-w-0 w-full" : "min-w-[800px]"}>
        {!hideHeader && (
          <TableHeader>
            <TableRow
              className={cn(
                "h-[80px] border-0 hover:bg-(--color-primary)",
                headerClassName,
              )}
            >
              {columns.map((col, colIndex) => (
                <TableHead
                  key={String(col.key)}
                  style={{ width: col.width }}
                  className={cn(
                    "h-[80px] px-4 py-3 text-left text-[16px] font-semibold text-inherit",
                    colIndex === 0 && "rounded-tl-xl pl-6 md:pl-12",
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
              {actions && actions.length > 0 && (
                <TableHead className="h-[80px] rounded-tr-xl py-3 pl-4 pr-6 text-center text-[16px] font-semibold whitespace-nowrap md:pr-12">
                  Action
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
        )}
        <TableBody className="bg-white">
          {data.map((row, rowIndex) => {
            const isLast = rowIndex === data.length - 1;
            const key = getRowKey ? getRowKey(row, rowIndex) : rowIndex;
            const customRowClass = rowClassName ? rowClassName(row, rowIndex) : "";

            return (
              <TableRow
                key={key}
                onClick={() => onRowClick?.(row, rowIndex)}
                className={cn(
                  compact ? "border-(--color-tc-20)/70" : "border-(--color-tc-20)",
                  isLast && "border-0",
                  onRowClick && "cursor-pointer hover:bg-(--color-nc-10)/60",
                  !compact && onRowClick && "hover:bg-slate-50",
                  customRowClass,
                )}
              >
                {columns.map((col, colIndex) => {
                  const value = getCellValue(row, col.key);
                  const content = col.render
                    ? col.render(value, row, rowIndex)
                    : String(value ?? "");

                  return (
                    <TableCell
                      key={String(col.key)}
                      style={{ width: col.width }}
                      className={cn(
                        compact
                          ? "px-4 py-3 text-sm text-(--color-tc-40)"
                          : "px-4 py-4 text-[16px] font-medium text-(--color-tc-40)",
                        colIndex === 0 && (compact ? "pl-5" : "pl-6 md:pl-12"),
                        col.className,
                      )}
                    >
                      {content}
                    </TableCell>
                  );
                })}
                {actions && actions.length > 0 && (
                  <TableCell
                    className="relative py-4 pl-4 pr-6 text-center whitespace-nowrap md:pr-12"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionDropdown
                      actions={actions}
                      onActionClick={(actionId) => onActionClick?.(actionId, row, rowIndex)}
                    />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </ShadcnTable>
    </div>
  );
}
