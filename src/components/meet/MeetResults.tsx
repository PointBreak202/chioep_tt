"use client";

import { Sparkles, Clock, CalendarX, Loader2 } from "lucide-react";
import type { FreeSlot } from "@/lib/meet";
import { formatDuration } from "@/lib/meet";

interface Props {
  loading: boolean;
  todaySlots: FreeSlot[];
  tomorrowSlots: FreeSlot[];
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function SlotRow({ slot }: { slot: FreeSlot }) {
  return (
    <div className="glass flex items-center justify-between rounded-xl px-4 py-3">
      <p className="text-sm font-medium text-text-primary">
        {formatTime(slot.start)} &ndash; {formatTime(slot.end)}
      </p>
      <p className="text-xs text-text-tertiary">
        {formatDuration(slot.durationMinutes)}
      </p>
    </div>
  );
}

export default function MeetResults({ loading, todaySlots, tomorrowSlots }: Props) {
  if (loading) {
    return (
      <div className="glass mt-6 flex flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center">
        <Loader2 size={24} className="animate-spin text-accent-soft" />
        <p className="text-sm text-text-secondary">Comparing schedules&hellip;</p>
      </div>
    );
  }

  const nothingFound = todaySlots.length === 0 && tomorrowSlots.length === 0;

  if (nothingFound) {
    return (
      <div className="glass mt-6 flex flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center">
        <CalendarX size={28} className="text-text-tertiary" />
        <p className="text-sm text-text-secondary">
          No common free time longer than 30 minutes was found for the
          selected students.
        </p>
      </div>
    );
  }

  const [best, ...otherToday] = todaySlots;

  return (
    <div className="mt-6 flex flex-col gap-6" style={{ animation: "splashIn 0.4s ease-out" }}>
      {best ? (
        <div className="glow-accent glass relative overflow-hidden rounded-2xl border-accent-soft/40 px-5 py-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-30 blur-[60px]"
            style={{ background: "var(--accent)" }}
          />
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-soft">
            <Sparkles size={13} />
            Today&apos;s Best Slot
          </p>
          <p className="mt-2 text-2xl font-bold text-text-primary">
            {formatTime(best.start)} &ndash; {formatTime(best.end)}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-sm text-text-secondary">
            <Clock size={14} />
            Duration &middot; {formatDuration(best.durationMinutes)}
          </div>
          <p className="mt-3 text-sm font-medium text-live-now">
            Everyone is free.
          </p>
        </div>
      ) : (
        <div className="glass rounded-xl px-4 py-4 text-center">
          <p className="text-sm text-text-secondary">
            No common free slots today.
          </p>
        </div>
      )}

      {otherToday.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Other Available Slots &middot; Today
          </p>
          <div className="flex flex-col gap-2">
            {otherToday.map((slot, i) => (
              <SlotRow key={i} slot={slot} />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Tomorrow
        </p>
        {tomorrowSlots.length > 0 ? (
          <div className="flex flex-col gap-2">
            {tomorrowSlots.map((slot, i) => (
              <SlotRow key={i} slot={slot} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl px-4 py-4 text-center">
            <p className="text-sm text-text-secondary">
              No common free slots tomorrow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
