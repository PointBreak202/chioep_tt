"use client";

import { useEffect, useState } from "react";
import { MapPin, User } from "lucide-react";
import type { AgendaItem } from "@/lib/timetable";
import { minutesUntil } from "@/lib/timetable";

interface Props {
  current: AgendaItem | null;
  hasAnyClassesToday: boolean;
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function CurrentClassCard({ current, hasAnyClassesToday }: Props) {
  const [nowMinutes, setNowMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNowMinutes(now.getHours() * 60 + now.getMinutes());
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!current) {
    return (
      <div className="glass mt-6 rounded-2xl px-5 py-6 text-center">
        <p className="text-sm text-text-secondary">
          {hasAnyClassesToday ? "No class currently" : "No classes today. Have fun!"}
        </p>
      </div>
    );
  }

  const remaining = minutesUntil(current.end, nowMinutes);

  return (
    <div className="glass glow-accent mt-6 rounded-2xl border-accent-soft/50 px-5 py-5">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-live-now/15 px-2 py-0.5 text-[10px] font-semibold text-live-now">
          NOW
        </span>
        <p className="text-xs font-medium text-text-secondary">
          {formatTime(current.start)} &ndash; {formatTime(current.end)}
        </p>
      </div>
      <p className="mt-2 text-xl font-semibold leading-snug text-text-primary">
        {current.title}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {current.room && (
          <p className="flex items-center gap-1.5 text-[13px] text-text-secondary">
            <MapPin size={13} />
            {current.room}
          </p>
        )}
        {current.faculty && (
          <p className="flex items-center gap-1.5 text-[13px] text-text-tertiary">
            <User size={13} />
            {current.faculty}
          </p>
        )}
      </div>
      <p className="mt-3 text-sm font-medium text-accent-soft">
        Ends in {remaining} minute{remaining === 1 ? "" : "s"}
      </p>
    </div>
  );
}
