"use client";

import { useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import CurrentClassCard from "@/components/agenda/CurrentClassCard";
import UpcomingClasses from "@/components/agenda/UpcomingClasses";
import TodoSection from "@/components/todo/TodoSection";
import { useRequireProfile } from "@/lib/useProfile";
import {
  getTimetable,
  resolveDayAgenda,
  splitAgendaByNow,
  todayDayKey,
} from "@/lib/timetable";
import { getGreeting } from "@/lib/greeting";
import { Loader2, TriangleAlert } from "lucide-react";

export default function TodayPage() {
  const { profile, loading } = useRequireProfile();

  const day = todayDayKey();
  const dateLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const timetable = useMemo(() => {
    if (!profile) return null;
    return getTimetable(profile.branchCode, profile.division);
  }, [profile]);

  const isWeekend = day === "Sat" || day === "Sun";

  const agenda = useMemo(() => {
    if (!timetable || isWeekend) return [];
    return resolveDayAgenda(timetable, day, profile?.batchLabel ?? null, profile?.mis ?? null);
  }, [timetable, day, profile, isWeekend]);

  const nowMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  const { current, upcoming } = useMemo(
    () => splitAgendaByNow(agenda, nowMinutes),
    [agenda, nowMinutes]
  );

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-accent-soft" />
      </div>
    );
  }

  const lowConfidence = timetable?.confidence.includes("LOW") || timetable?.confidence.includes("NOT VERIFIED");
  const greeting = getGreeting(profile.mis, profile.branchCode);

  return (
    <AppShell>
      <div className="px-5 pt-8">
        <p className="text-sm font-medium text-accent-soft">{greeting}</p>
        <p className="mt-2 text-sm text-text-secondary">
          {profile.branchName}, Division {profile.division}
          {profile.batchLabel ? ` · ${profile.batchLabel}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-text-primary">
          {dateLabel}
        </h1>

        {!timetable && (
          <div className="glass mt-6 rounded-2xl p-5">
            <p className="text-sm text-text-secondary">
              We don&apos;t have timetable data for your division yet.
            </p>
          </div>
        )}

        {timetable && lowConfidence && !isWeekend && (
          <div className="glass mt-5 flex items-start gap-2 rounded-xl border-amber-400/30 px-4 py-3">
            <TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber-400" />
            <p className="text-xs text-text-secondary">
              This division&apos;s data is still being verified. Some slots may
              be inaccurate.
            </p>
          </div>
        )}

        {timetable && (
          <>
            {isWeekend ? (
              <CurrentClassCard current={null} hasAnyClassesToday={false} />
            ) : (
              <>
                <CurrentClassCard current={current} hasAnyClassesToday={agenda.length > 0} />
                <UpcomingClasses upcoming={upcoming} />
              </>
            )}
          </>
        )}

        <TodoSection />
      </div>
    </AppShell>
  );
}
