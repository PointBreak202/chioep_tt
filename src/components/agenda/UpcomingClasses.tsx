"use client";

import { useState } from "react";
import { MapPin, User, CalendarX } from "lucide-react";
import type { AgendaItem } from "@/lib/timetable";

interface Props {
  upcoming: AgendaItem[];
}

type ViewMode = "next" | "all";

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function UpcomingClasses({ upcoming }: Props) {
  const [mode, setMode] = useState<ViewMode>("next");

  const visible = mode === "next" ? upcoming.slice(0, 1) : upcoming;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">
          Upcoming
          <span className="ml-2 text-xs font-normal text-text-tertiary">
            ({mode === "next" ? "next class" : `${upcoming.length} remaining`})
          </span>
        </h2>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value === "all" ? "all" : "next")}
          className="rounded-lg border border-border-subtle bg-bg-elevated px-2 py-1 text-xs text-text-secondary outline-none"
        >
          <option value="next">Next Class</option>
          <option value="all">All Remaining Classes</option>
        </select>
      </div>

      {upcoming.length === 0 ? (
        <div className="glass mt-3 flex flex-col items-center gap-2 rounded-2xl px-6 py-8 text-center">
          <CalendarX size={22} className="text-text-tertiary" />
          <p className="text-sm text-text-secondary">No more classes today.</p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {visible.map((item) => (
            <div key={`${item.start}-${item.title}`} className="glass rounded-xl px-4 py-3">
              <p className="text-xs font-medium text-text-secondary">
                {formatTime(item.start)} &ndash; {formatTime(item.end)}
              </p>
              <p className="mt-1 text-[15px] font-semibold leading-snug text-text-primary">
                {item.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                {item.room && (
                  <p className="flex items-center gap-1.5 text-[13px] text-text-secondary">
                    <MapPin size={13} />
                    {item.room}
                  </p>
                )}
                {item.faculty && (
                  <p className="flex items-center gap-1.5 text-[13px] text-text-tertiary">
                    <User size={13} />
                    {item.faculty}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
