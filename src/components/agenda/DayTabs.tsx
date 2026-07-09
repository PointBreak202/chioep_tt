"use client";

import type { DayKey } from "@/lib/timetable";

const DAYS: { key: DayKey; label: string }[] = [
  { key: "Mon", label: "Mon" },
  { key: "Tue", label: "Tue" },
  { key: "Wed", label: "Wed" },
  { key: "Thu", label: "Thu" },
  { key: "Fri", label: "Fri" },
  { key: "Sat", label: "Sat" },
];

interface Props {
  selected: DayKey;
  onSelect: (day: DayKey) => void;
  today: DayKey;
}

export default function DayTabs({ selected, onSelect, today }: Props) {
  return (
    <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
      {DAYS.map(({ key, label }) => {
        const isSelected = key === selected;
        const isToday = key === today;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`relative shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              isSelected
                ? "bg-accent text-white"
                : "glass text-text-secondary"
            }`}
          >
            {label}
            {isToday && !isSelected && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-live-now" />
            )}
          </button>
        );
      })}
    </div>
  );
}
