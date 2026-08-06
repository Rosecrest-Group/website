"use client";

import { useEffect, useId, useRef, useState } from "react";

export const WF_TAG_COLORS = ["blue", "violet", "emerald", "amber", "rose", "slate"] as const;
export type WorkflowTagColor = (typeof WF_TAG_COLORS)[number];

export type WorkflowTagSelectOption = {
  value: string;
  label: string;
  color?: WorkflowTagColor;
};

type Props = {
  options: WorkflowTagSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  ariaLabel: string;
  multiple?: boolean;
};

export default function WorkflowTagSelect({
  options,
  selected,
  onChange,
  placeholder = "Type to search…",
  ariaLabel,
  multiple = true,
}: Props) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const selectedSet = new Set(selected);
  const optionByValue = new Map(options.map((option) => [option.value, option]));
  const trimmedQuery = query.trim().toLowerCase();

  const availableOptions = options.filter((option) => {
    if (selectedSet.has(option.value)) return false;
    if (!trimmedQuery) return true;
    return (
      option.label.toLowerCase().includes(trimmedQuery) ||
      option.value.toLowerCase().includes(trimmedQuery)
    );
  });

  useEffect(() => {
    setHighlight(0);
  }, [availableOptions.length, query]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function addValue(value: string) {
    if (selectedSet.has(value)) return;
    onChange(multiple ? [...selected, value] : [value]);
    setQuery("");
    setOpen(!multiple ? false : true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function removeValue(value: string) {
    onChange(selected.filter((item) => item !== value));
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function selectHighlighted() {
    const option = availableOptions[highlight];
    if (!option) return;
    addValue(option.value);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlight((current) => Math.min(current + 1, Math.max(availableOptions.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (open && availableOptions.length > 0) {
        selectHighlighted();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setQuery("");
      return;
    }
    if (event.key === "Backspace" && !query && selected.length > 0) {
      removeValue(selected[selected.length - 1]);
    }
  }

  return (
    <div ref={containerRef} className="wf-tag-select">
      <div
        className="wf-tag-select-input"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selected.map((value) => {
          const option = optionByValue.get(value);
          const label = option?.label ?? value;
          const color = option?.color ?? "slate";
          return (
            <span key={value} className="wf-tag-chip" data-color={color}>
              <span className="wf-tag-chip-label">{label}</span>
              <button
                type="button"
                className="wf-tag-chip-remove"
                aria-label={`Remove ${label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  removeValue(value);
                }}
              >
                <i className="ti ti-x" />
              </button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          type="text"
          value={query}
          className="wf-tag-select-field"
          placeholder={selected.length === 0 ? placeholder : multiple ? "" : "Change level…"}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          autoComplete="off"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
        />
      </div>

      {open && availableOptions.length > 0 && (
        <ul id={listboxId} className="wf-tag-select-menu" role="listbox">
          {availableOptions.map((option, index) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={index === highlight}
                className={`wf-tag-select-option${index === highlight ? " active" : ""}`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlight(index)}
                onClick={() => addValue(option.value)}
              >
                <span className="wf-tag-select-option-chip" data-color={option.color ?? "slate"}>
                  {option.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
