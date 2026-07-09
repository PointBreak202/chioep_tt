"use client";

import { MapPin, User, Utensils, AlertTriangle, CalendarX } from "lucide-react";
import type { AgendaItem } from "@/lib/timetable";

interface Props {
  items: AgendaItem[];
  isToday: boolean;
  compact?: boolean;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

const KIND_STYLES: Record<AgendaItem["kind"], { dot: string; icon: React.ReactNode | null }> = {
  lab: { dot: "bg-accent-soft", icon: null },
  class: { dot: "bg-text-secondary", icon: null },
  lunch: { dot: "bg-live-now", icon: <Utensils size={14} /> },
  "free-period": { dot: "bg-text-tertiary", icon: null },
  unverified: { dot: "bg-amber-400", icon: <AlertTriangle size={14} /> },
};

export default function AgendaList({ items, isToday, compact = false }: Props) {
  if (items.length === 0) {
    return (
      <div className="glass mt-6 flex flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center">
        <CalendarX size={28} className="text-text-tertiary" />
        <p className="text-sm text-text-secondary">No classes scheduled.</p>
      </div>
    );
  }

  const nowMinutes = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

  return (
    <div className={compact ? "mt-4 flex flex-col" : "mt-6 flex flex-col"}>
      {items.map((item, i) => {
        const startM = timeToMinutes(item.start);
        const endM = timeToMinutes(item.end);
        const isLive = isToday && nowMinutes >= startM && nowMinutes < endM;
        const style = KIND_STYLES[item.kind];

        return (
          <div
            key={i}
            className={`relative flex gap-3 ${compact ? "pb-3 last:pb-0" : "pb-6 last:pb-0"}`}
          >
            {i !== items.length - 1 && (
              <span
                className={`absolute left-[7px] top-4 h-full w-px bg-border-subtle`}
              />
            )}
            <div className="flex flex-col items-center pt-1.5">
              <span
                className={`h-3.5 w-3.5 rounded-full ${style.dot} ${
                  isLive ? "glow-accent ring-2 ring-accent-soft/40" : ""
                }`}
              />
            </div>

            <div
              className={`glass flex-1 rounded-xl ${compact ? "px-3 py-2" : "px-4 py-3"} ${
                isLive ? "border-accent-soft/50" : ""
              } ${item.kind === "unverified" ? "border-amber-400/30" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-text-secondary">
                  {formatTime(item.start)} &ndash; {formatTime(item.end)}
                </p>
                {isLive && (
                  <span className="rounded-full bg-live-now/15 px-2 py-0.5 text-[10px] font-semibold text-live-now">
                    NOW
                  </span>
                )}
              </div>
              <p
                className={`font-semibold text-text-primary ${
                  compact ? "mt-0.5 text-sm" : "mt-1 text-sm"
                }`}
              >
                {item.title}
              </p>
              {item.room && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
                  <MapPin size={12} />
                  {item.room}
                </p>
              )}
              {!compact && item.faculty && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-text-tertiary">
                  <User size={12} />
                  {item.faculty}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
