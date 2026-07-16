"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import StudentSearch from "@/components/meet/StudentSearch";
import SelectedStudents from "@/components/meet/SelectedStudents";
import MeetResults from "@/components/meet/MeetResults";
import { useRequireProfile } from "@/lib/useProfile";
import { findCommonFreeSlots, getTomorrowDayKey, type FreeSlot } from "@/lib/meet";
import { todayDayKey } from "@/lib/timetable";
import type { StudentDirectoryEntry } from "@/lib/students";
import { Loader2, Users2 } from "lucide-react";

const MAX_STUDENTS = 10;

export default function MeetPage() {
  const { profile, loading } = useRequireProfile();
  const [selected, setSelected] = useState<StudentDirectoryEntry[]>([]);
  const [comparing, setComparing] = useState(false);
  const [results, setResults] = useState<{
    today: FreeSlot[];
    tomorrow: FreeSlot[];
  } | null>(null);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-accent-soft" />
      </div>
    );
  }

  const excludeMis = [profile.mis, ...selected.map((s) => s.mis)];
  const atLimit = selected.length >= MAX_STUDENTS;

  function handleAdd(student: StudentDirectoryEntry) {
    setSelected((prev) =>
      prev.some((s) => s.mis === student.mis) ? prev : [...prev, student]
    );
    setResults(null);
  }

  function handleRemove(mis: string) {
    setSelected((prev) => prev.filter((s) => s.mis !== mis));
    setResults(null);
  }

  function handleCompare() {
    setComparing(true);
    setResults(null);

    setTimeout(() => {
      const today = todayDayKey();
      const tomorrow = getTomorrowDayKey(today);

      const you = {
        mis: profile!.mis,
        branchCode: profile!.branchCode,
        division: profile!.division,
        batchLabel: profile!.batchLabel,
      };
      const everyone = [you, ...selected.map((s) => ({
        mis: s.mis,
        branchCode: s.branchCode,
        division: s.division,
        batchLabel: s.batchLabel,
      }))];

      setResults({
        today: findCommonFreeSlots(everyone, today),
        tomorrow: findCommonFreeSlots(everyone, tomorrow),
      });
      setComparing(false);
    }, 450);
  }

  return (
    <AppShell>
      <div className="px-5 pt-8">
        <p className="text-sm text-text-secondary">Find common free time</p>
        <h1 className="mt-1 text-2xl font-semibold text-text-primary">Meet</h1>

        <div className="mt-5">
          <StudentSearch
            excludeMis={excludeMis}
            onSelect={handleAdd}
            disabled={atLimit}
          />
        </div>

        <SelectedStudents selected={selected} onRemove={handleRemove} />

        <button
          onClick={handleCompare}
          disabled={selected.length === 0 || comparing}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          <Users2 size={16} />
          Find Common Free Time
        </button>

        {(comparing || results) && (
          <MeetResults
            loading={comparing}
            todaySlots={results?.today ?? []}
            tomorrowSlots={results?.tomorrow ?? []}
          />
        )}
      </div>
    </AppShell>
  );
}
