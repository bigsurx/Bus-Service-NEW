"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value: string; // "HH:mm" e.g. "10:00"
  onChange: (value: string) => void;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const [hour, minute] = (value || "10:00").split(":").map(Number);

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

  // Scroll selected items into view when opening
  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      hourListRef.current
        ?.querySelector("[data-selected=true]")
        ?.scrollIntoView({ block: "center" });
      minuteListRef.current
        ?.querySelector("[data-selected=true]")
        ?.scrollIntoView({ block: "center" });
    }, 50);
  }, [isOpen]);

  const selectHour = useCallback(
    (h: number) => {
      onChange(`${pad(h)}:${pad(minute)}`);
    },
    [minute, onChange]
  );

  const selectMinute = useCallback(
    (m: number) => {
      onChange(`${pad(hour)}:${pad(m)}`);
      setIsOpen(false);
    },
    [hour, onChange]
  );

  const displayValue = `${pad(hour)}:${pad(minute)}`;

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-[42px] w-full items-center gap-1.5 rounded-lg border bg-white px-2.5 text-left text-sm transition-colors focus:outline-none ${
          isOpen ? "border-accent" : "border-gray-200"
        }`}
      >
        <Clock className="h-3.5 w-3.5 shrink-0 text-accent" />
        <span className="text-gray-900">{displayValue}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white p-2 shadow-2xl">
          <div className="flex gap-1">
            {/* Hours column */}
            <div
              ref={hourListRef}
              className="flex max-h-[220px] w-[52px] flex-col gap-0.5 overflow-y-auto scrollbar-none"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="sticky top-0 bg-white pb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Hr
              </div>
              {HOURS.map((h) => (
                <button
                  key={h}
                  data-selected={h === hour}
                  onClick={() => selectHour(h)}
                  className={`flex h-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                    h === hour
                      ? "border-accent bg-accent text-white font-semibold"
                      : "border-gray-100 bg-white text-gray-700 hover:border-accent hover:bg-orange-50"
                  }`}
                >
                  {pad(h)}
                </button>
              ))}
            </div>

            {/* Minutes column */}
            <div
              ref={minuteListRef}
              className="flex max-h-[220px] w-[52px] flex-col gap-0.5 overflow-y-auto scrollbar-none"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="sticky top-0 bg-white pb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Min
              </div>
              {MINUTES.map((m) => (
                <button
                  key={m}
                  data-selected={m === minute}
                  onClick={() => selectMinute(m)}
                  className={`flex h-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                    m === minute
                      ? "border-accent bg-accent text-white font-semibold"
                      : "border-gray-100 bg-white text-gray-700 hover:border-accent hover:bg-orange-50"
                  }`}
                >
                  {pad(m)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
