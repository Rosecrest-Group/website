"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_TIME = "09:00";
const POPOVER_GAP = 8;
const MINUTE_STEP = 5;

const padNumber = (value: number) => value.toString().padStart(2, "0");

type DayPeriod = "AM" | "PM";

const to12Hour = (timeStr: string) => {
  const [hour24, minute] = timeStr.split(":").map(Number);
  const period: DayPeriod = hour24 >= 12 ? "PM" : "AM";
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour, minute: minute || 0, period };
};

const from12Hour = (hour: number, minute: number, period: DayPeriod) => {
  let hour24 = hour % 12;
  if (period === "PM") hour24 += 12;
  return `${padNumber(hour24)}:${padNumber(minute)}`;
};

const formatTime12 = (timeStr: string) => {
  const { hour, minute, period } = to12Hour(timeStr);
  return `${hour}:${padNumber(minute)} ${period}`;
};

const minuteOptions = (currentMinute: number) => {
  const options = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP);
  if (!options.includes(currentMinute)) options.push(currentMinute);
  return options.sort((a, b) => a - b);
};

const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(
    date.getDate()
  )}`;

const splitDateTime = (value: string) => {
  if (!value) return { dateStr: "", timeStr: DEFAULT_TIME };
  const [dateStr, timeStr] = value.split("T");
  return { dateStr, timeStr: timeStr?.slice(0, 5) || DEFAULT_TIME };
};

const parseDateValue = (value: string) => {
  const dateStr = splitDateTime(value).dateStr;
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map((part) => Number(part));
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatDisplayValue = (value: string, includeTime: boolean) => {
  const selectedDate = parseDateValue(value);
  if (!selectedDate) return "";
  const dateLabel = selectedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (!includeTime) return dateLabel;
  return `${dateLabel}, ${formatTime12(splitDateTime(value).timeStr)}`;
};

type PopoverPosition = {
  top: number;
  left: number;
  width: number;
  openUp: boolean;
};

export type CalendarInputProps = {
  id: string;
  label: string;
  name: string;
  value: string;
  placeholder: string;
  minDate?: string;
  placement?: "up" | "down";
  includeTime?: boolean;
  onChange: (name: string, value: string) => void;
};

export default function CalendarInput({
  id,
  label,
  name,
  value,
  placeholder,
  minDate,
  placement = "down",
  includeTime = false,
  onChange,
}: CalendarInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { timeStr } = splitDateTime(value);
  const selectedDate = parseDateValue(value);
  const minAllowedDate = parseDateValue(minDate || "");
  const [viewDate, setViewDate] = useState<Date>(
    selectedDate || minAllowedDate || new Date()
  );

  function updatePosition() {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const estimatedHeight = includeTime ? 400 : 300;
    const spaceBelow = window.innerHeight - rect.bottom - POPOVER_GAP;
    const spaceAbove = rect.top - POPOVER_GAP;
    const preferUp = placement === "up";
    const openUp = preferUp
      ? spaceAbove >= estimatedHeight || spaceAbove > spaceBelow
      : spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
    const width = rect.width;
    const left = Math.min(
      Math.max(POPOVER_GAP, rect.left),
      window.innerWidth - width - POPOVER_GAP
    );
    setPosition({
      top: openUp ? rect.top - POPOVER_GAP : rect.bottom + POPOVER_GAP,
      left,
      width,
      openUp,
    });
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setViewDate(selectedDate || minAllowedDate || new Date());
  }, [isOpen, selectedDate, minAllowedDate]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }
    updatePosition();
  }, [isOpen, includeTime, placement]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    };
    const handleReposition = () => updatePosition();
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, includeTime, placement]);

  const emitValue = (date: Date, time = timeStr) => {
    const dateStr = formatDateValue(date);
    onChange(name, includeTime ? `${dateStr}T${time}` : dateStr);
  };

  const handleSelectDate = (date: Date) => {
    if (minAllowedDate && date < minAllowedDate) {
      return;
    }
    emitValue(date);
    if (!includeTime) {
      setIsOpen(false);
    }
  };

  const handleTimePartsChange = (hour: number, minute: number, period: DayPeriod) => {
    emitValue(selectedDate || new Date(), from12Hour(hour, minute, period));
  };

  const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();
  const startDayIndex = startOfMonth.getDay();
  const calendarDays: Array<Date | null> = Array.from({
    length: startDayIndex,
  }).map(() => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    calendarDays.push(
      new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    );
  }

  const isSameDay = (a: Date | null, b: Date | null) =>
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const today = new Date();
  const displayValue = formatDisplayValue(value, includeTime);
  const timeParts = to12Hour(timeStr);
  const timeSelectClass =
    "rounded-lg border border-(--color-tc-20) bg-white px-2 py-1.5 text-sm text-(--color-tc-40) outline-none focus:ring-2 focus:ring-(--color-primary)/20";

  const calendarPanel = (
    <div
      ref={panelRef}
      className="crm-theme rounded-xl border border-(--color-tc-20) bg-white p-3 shadow-lg"
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setViewDate(
              new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-(--color-tc-20) text-(--color-tc-40) transition-colors hover:bg-slate-50"
          aria-label="Previous month"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-(--color-tc-40)">
          {viewDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          type="button"
          onClick={() =>
            setViewDate(
              new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-(--color-tc-20) text-(--color-tc-40) transition-colors hover:bg-slate-50"
          aria-label="Next month"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-xs text-(--color-tc-30)">
        {weekdayLabels.map((day) => (
          <span key={day} className="text-center">
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <span key={`empty-${index}`} />;
          }
          const isDisabled = !!minAllowedDate && date < minAllowedDate;
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handleSelectDate(date)}
              disabled={isDisabled}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors",
                isSelected
                  ? "bg-(--color-primary) text-white"
                  : isDisabled
                    ? "cursor-not-allowed text-(--color-tc-20)"
                    : "text-(--color-tc-40) hover:bg-(--color-primary)/10",
                isToday && !isSelected && "border border-(--color-primary)"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {includeTime && (
          <div className="mt-3 border-t border-(--color-tc-20) pt-3">
            <p className="mb-2 text-sm font-medium text-(--color-tc-40)">Time</p>
            <div className="flex items-center gap-2">
              <select
                id={`${id}-hour`}
                aria-label="Hour"
                value={timeParts.hour}
                onChange={(e) =>
                  handleTimePartsChange(Number(e.target.value), timeParts.minute, timeParts.period)
                }
                className={cn(timeSelectClass, "min-w-0 flex-1")}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className="text-sm font-medium text-(--color-tc-30)">:</span>
              <select
                id={`${id}-minute`}
                aria-label="Minute"
                value={timeParts.minute}
                onChange={(e) =>
                  handleTimePartsChange(timeParts.hour, Number(e.target.value), timeParts.period)
                }
                className={cn(timeSelectClass, "min-w-0 flex-1")}
              >
                {minuteOptions(timeParts.minute).map((m) => (
                  <option key={m} value={m}>
                    {padNumber(m)}
                  </option>
                ))}
              </select>
              <div className="flex shrink-0 overflow-hidden rounded-lg border border-(--color-tc-20)">
                {(["AM", "PM"] as const).map((nextPeriod) => (
                  <button
                    key={nextPeriod}
                    type="button"
                    onClick={() =>
                      handleTimePartsChange(timeParts.hour, timeParts.minute, nextPeriod)
                    }
                    className={cn(
                      "px-2.5 py-1.5 text-sm font-medium transition-colors",
                      timeParts.period === nextPeriod
                        ? "bg-(--color-primary) text-white"
                        : "bg-white text-(--color-tc-40) hover:bg-(--color-primary)/10"
                    )}
                  >
                    {nextPeriod}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-(--color-primary) hover:bg-(--color-primary)/10"
              >
                Done
              </button>
            </div>
          </div>
      )}
    </div>
  );

  return (
    <div ref={rootRef} className="relative" data-calendar-root={id}>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-(--color-tc-40)"
      >
        {label}
      </label>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-(--color-tc-20) bg-white px-4 py-3 text-left text-sm text-(--color-tc-40) outline-none focus:border-transparent focus:ring-2 focus:ring-(--color-primary) focus:ring-opacity-20"
      >
        <span className={displayValue ? "text-(--color-tc-40)" : "text-(--color-tc-30)"}>
          {displayValue || placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-(--color-tc-30)"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {isOpen && position && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed z-300"
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
                transform: position.openUp ? "translateY(-100%)" : undefined,
              }}
            >
              {calendarPanel}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
