"use client";

import { useMemo } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { useRequireProfile } from "@/lib/useProfile";
import { getSubjectSummaries } from "@/lib/syllabus";
import { BookOpen, ChevronRight, Layers } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function SyllabusPage() {
  const { profile, loading } = useRequireProfile();

  const subjects = useMemo(() => {
    if (!profile) return [];
    return getSubjectSummaries(profile.branchCode, profile.standing);
  }, [profile]);

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
          {profile.branchName}, {profile.standing}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-text-primary">Syllabus</h1>

        {subjects.length === 0 ? (
          <div className="glass mt-6 flex flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center">
            <BookOpen size={28} className="text-text-tertiary" />
            <p className="text-sm text-text-secondary">
              We don&apos;t have syllabus data for your branch and year yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            {subjects.map((s) => (
              <Link
                key={s.code}
                href={`/syllabus/${encodeURIComponent(s.code)}`}
                className="glass flex items-center gap-3 rounded-xl px-4 py-3 transition-colors active:bg-surface-hover"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15">
                  <BookOpen size={18} className="text-accent-soft" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{s.name}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-tertiary">
                    {s.category && <span>{s.category}</span>}
                    {s.category && <span aria-hidden>&middot;</span>}
                    <span className="flex items-center gap-1">
                      <Layers size={11} />
                      {s.unitCount} unit{s.unitCount === 1 ? "" : "s"}
                    </span>
                    {typeof s.credits === "number" && (
                      <>
                        <span aria-hidden>&middot;</span>
                        <span>{s.credits} credits</span>
                      </>
                    )}
                  </p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-text-tertiary" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
