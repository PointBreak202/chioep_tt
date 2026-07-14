"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useRequireProfile } from "@/lib/useProfile";
import { getRoomStatuses } from "@/lib/rooms";
import { todayDayKey } from "@/lib/timetable";
import { Loader2, MapPin, TriangleAlert, Circle } from "lucide-react";

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function RoomsPage() {
  const { profile, loading } = useRequireProfile();
  const [nowMinutes, setNowMinutes] = useState<number | null>(null);
  const day = todayDayKey();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setNowMinutes(now.getHours() * 60 + now.getMinutes());
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const isWeekend = day === "Sat" || day === "Sun";

  const statuses = useMemo(() => {
    if (nowMinutes === null || isWeekend) return [];
    return getRoomStatuses(day, nowMinutes);
  }, [day, nowMinutes, isWeekend]);

  if (loading || !profile || nowMinutes === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-accent-soft" />
      </div>
    );
  }

  const freeRooms = statuses.filter((r) => r.free);
  const busyRooms = statuses.filter((r) => !r.free);

  return (
    <AppShell>
      <div className="px-5 pt-8">
        <p className="text-sm text-text-secondary">Right now</p>
        <h1 className="mt-1 text-2xl font-semibold text-text-primary">
          Free Rooms
        </h1>

        <div className="glass mt-5 flex items-start gap-2 rounded-xl px-4 py-3">
          <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber-400" />
          <p className="text-xs text-text-secondary">
            Based only on SY CSE (Div 1&ndash;4) and AIML (Div 1) schedules.
            Rooms may still be in use by other branches or years we don&apos;t
            have data for.
          </p>
        </div>

        {isWeekend ? (
          <div className="glass mt-6 flex flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center">
            <MapPin size={28} className="text-text-tertiary" />
            <p className="text-sm text-text-secondary">
              No classes today, so room status isn&apos;t meaningful right now.
            </p>
          </div>
        ) : (
          <>
            {freeRooms.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  Free ({freeRooms.length})
                </p>
                <div className="flex flex-col gap-2">
                  {freeRooms.map((r) => (
                    <div
                      key={r.code}
                      className="glass flex items-center gap-3 rounded-xl px-4 py-3"
                    >
                      <Circle size={8} className="shrink-0 fill-live-now text-live-now" />
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {r.code}
                        </p>
                        <p className="text-xs text-text-secondary">{r.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {busyRooms.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  In use ({busyRooms.length})
                </p>
                <div className="flex flex-col gap-2">
                  {busyRooms.map((r) => (
                    <div
                      key={r.code}
                      className="glass flex items-center gap-3 rounded-xl px-4 py-3 opacity-60"
                    >
                      <Circle size={8} className="shrink-0 fill-danger text-danger" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-primary">
                          {r.code}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {r.occupiedBy}
                        </p>
                      </div>
                      <p className="text-xs text-text-tertiary">
                        until {r.until && formatTime(r.until)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
