"use client";

import { useMemo, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import AgendaList from "@/components/agenda/AgendaList";
import DayTabs from "@/components/agenda/DayTabs";
import SubjectTodoModal from "@/components/todo/SubjectTodoModal";
import { useRequireProfile } from "@/lib/useProfile";
import {
  getTimetable,
  resolveDayAgenda,
  todayDayKey,
  type AgendaItem,
  type DayKey,
} from "@/lib/timetable";
import { Loader2 } from "lucide-react";

const VALID_WEEK_DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeekPage() {
  const { profile, loading } = useRequireProfile();
  const today = todayDayKey();
  const defaultDay = VALID_WEEK_DAYS.includes(today) ? today : "Mon";
  const [selectedDay, setSelectedDay] = useState<DayKey>(defaultDay);
  const [activeSubject, setActiveSubject] = useState<AgendaItem | null>(null);

  const timetable = useMemo(() => {
    if (!profile) return null;
    return getTimetable(profile.branchCode, profile.division);
  }, [profile]);

  const agenda = useMemo(() => {
    if (!timetable) return [];
    return resolveDayAgenda(timetable, selectedDay, profile?.batchLabel ?? null, profile?.mis ?? null);
  }, [timetable, selectedDay, profile]);

  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < 50) return;
    const currentIndex = VALID_WEEK_DAYS.indexOf(selectedDay);

    if (deltaX < 0 && currentIndex < VALID_WEEK_DAYS.length - 1) {
      setSelectedDay(VALID_WEEK_DAYS[currentIndex + 1]);
    } else if (deltaX > 0 && currentIndex > 0) {
      setSelectedDay(VALID_WEEK_DAYS[currentIndex - 1]);
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-accent-soft" />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="px-5 pt-8">
        <p className="text-sm text-text-secondary">
          {profile.branchName}, Division {profile.division}
          {profile.batchLabel ? ` · ${profile.batchLabel}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-text-primary">
          This Week
        </h1>

        <div className="mt-5">
          <DayTabs selected={selectedDay} onSelect={setSelectedDay} today={today} />
        </div>

        {!timetable ? (
          <div className="glass mt-6 rounded-2xl p-5">
            <p className="text-sm text-text-secondary">
              We don&apos;t have timetable data for your division yet.
            </p>
          </div>
        ) : (
          <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <AgendaList
              items={agenda}
              isToday={selectedDay === today}
              compact
              onItemClick={(item) => setActiveSubject(item)}
            />
          </div>
        )}
      </div>

      {activeSubject && activeSubject.subjectKey && (
        <SubjectTodoModal
          subjectKey={activeSubject.subjectKey}
          subjectTitle={activeSubject.title}
          onClose={() => setActiveSubject(null)}
        />
      )}
    </AppShell>
  );
}
