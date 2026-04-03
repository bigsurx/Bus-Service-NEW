"use client";

import {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import { DayPicker } from "react-day-picker";
import { format, parse } from "date-fns";
import { Calendar } from "lucide-react";
import "react-day-picker/style.css";
import "./date-picker.css";

export interface DatePickerHandle {
  open: () => void;
}

interface DatePickerProps {
  /** Current value as "YYYY-MM-DD" string, or "" for empty */
  value: string;
  onChange: (value: string) => void;
  /** Dates before this are disabled */
  minDate?: Date;
  placeholder?: string;
  className?: string;
  /** Called after user picks a date — use to auto-open the next picker */
  onAfterSelect?: () => void;
  /** Error state — shows red border on the trigger button */
  hasError?: boolean;
}

export const DatePicker = forwardRef<DatePickerHandle, DatePickerProps>(
  function DatePicker(
    { value, onChange, minDate, placeholder = "Select date", className, onAfterSelect, hasError },
    ref
  ) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
    const displayValue = selected ? format(selected, "MMM d, yyyy") : "";

    const measureAndOpen = useCallback(() => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        // Only flip up if there's truly no room below (< 120px)
        setDropUp(spaceBelow < 120);
      }
      setIsOpen(true);
    }, []);

    useImperativeHandle(ref, () => ({ open: measureAndOpen }));

    // Close on outside click
    useEffect(() => {
      if (!isOpen) return;
      function handleClick(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
      if (!isOpen) return;
      function handleKey(e: KeyboardEvent) {
        if (e.key === "Escape") setIsOpen(false);
      }
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen]);

    function handleSelect(date: Date | undefined) {
      if (!date) return;
      onChange(format(date, "yyyy-MM-dd"));
      setIsOpen(false);
      // Small delay so the dropdown closes before the next one opens
      if (onAfterSelect) setTimeout(onAfterSelect, 120);
    }

    const borderColor = hasError
      ? "border-red-400"
      : isOpen
        ? "border-accent"
        : "border-gray-200";

    return (
      <div ref={containerRef} className={`relative ${className ?? ""}`}>
        {/* Trigger button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : measureAndOpen())}
          className={`flex h-[42px] w-full items-center gap-2 rounded-lg border bg-white px-3 text-left text-sm transition-colors focus:outline-none ${borderColor}`}
        >
          <Calendar className="h-4 w-4 shrink-0 text-accent" />
          <span className={displayValue ? "text-gray-900" : "text-gray-400"}>
            {displayValue || placeholder}
          </span>
        </button>

        {/* Calendar dropdown */}
        {isOpen && (
          <>
            {/* Mobile: fixed overlay centered on screen */}
            <div
              className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/20 pt-20 md:hidden"
              onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
            >
              <div className="mx-4 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
                <DayPicker
                  className="rdp-custom"
                  mode="single"
                  numberOfMonths={1}
                  selected={selected}
                  onSelect={handleSelect}
                  disabled={minDate ? { before: minDate } : undefined}
                  defaultMonth={selected || minDate || new Date()}
                />
              </div>
            </div>
            {/* Desktop: absolute dropdown anchored right */}
            <div
              className={`absolute z-50 hidden rounded-xl border border-gray-200 bg-white p-4 shadow-2xl md:block ${
                dropUp ? "bottom-full mb-2" : "top-full mt-2"
              }`}
              style={{ right: 0, minWidth: "fit-content" }}
            >
              <DayPicker
                className="rdp-custom"
                mode="single"
                numberOfMonths={2}
                selected={selected}
                onSelect={handleSelect}
                disabled={minDate ? { before: minDate } : undefined}
                defaultMonth={selected || minDate || new Date()}
              />
            </div>
          </>
        )}
      </div>
    );
  }
);
