"use client";

import { useEffect, useState } from "react";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const padNumber = (value: number) => value.toString().padStart(2, "0");

const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(
    date.getDate()
  )}`;

const parseDateValue = (value: string) => {
  if (!value) {
    return null;
  }
  const [year, month, day] = value.split("-").map((part) => Number(part));
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
};

export type CalendarInputProps = {
  id: string;
  label: string;
  name: string;
  value: string;
  placeholder: string;
  minDate?: string;
  placement?: "up" | "down";
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
  onChange,
}: CalendarInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseDateValue(value);
  const minAllowedDate = parseDateValue(minDate || "");
  const [viewDate, setViewDate] = useState<Date>(
    selectedDate || minAllowedDate || new Date()
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setViewDate(selectedDate || minAllowedDate || new Date());
  }, [isOpen, selectedDate, minAllowedDate]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(`[data-calendar-root="${id}"]`)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id, isOpen]);

  const handleSelectDate = (date: Date) => {
    if (minAllowedDate && date < minAllowedDate) {
      return;
    }
    onChange(name, formatDateValue(date));
    setIsOpen(false);
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

  return (
    <div className="relative" data-calendar-root={id}>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-(--color-tc-40) mb-2"
      >
        {label}
      </label>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-3 rounded-xl border border-(--color-tc-20) bg-white focus:ring-(--color-primary) focus:ring-2 focus:ring-opacity-20 focus:border-transparent outline-none text-sm text-left text-(--color-tc-40) flex items-center justify-between"
      >
        <span className={value ? "text-(--color-tc-40)" : "text-(--color-tc-30)"}>
          {value || placeholder}
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

      {isOpen && (
        <div
          className={`absolute z-20 w-full rounded-xl border border-(--color-tc-20) bg-white shadow-lg p-3 ${
            placement === "up" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
                )
              }
              className="h-8 w-8 rounded-lg border border-(--color-tc-20) text-(--color-tc-40) hover:bg-slate-50 transition-colors flex items-center justify-center"
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
              className="h-8 w-8 rounded-lg border border-(--color-tc-20) text-(--color-tc-40) hover:bg-slate-50 transition-colors flex items-center justify-center"
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

          <div className="grid grid-cols-7 gap-1 text-xs text-(--color-tc-30) mb-2">
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
              const isDisabled =
                !!minAllowedDate && date < minAllowedDate;
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  disabled={isDisabled}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors text-sm ${
                    isSelected
                      ? "bg-(--color-primary) text-white"
                      : isDisabled
                      ? "text-(--color-tc-20) cursor-not-allowed"
                      : "text-(--color-tc-40) hover:bg-(--color-primary)/10"
                  } ${isToday && !isSelected ? "border border-(--color-primary)" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
