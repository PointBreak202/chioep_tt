"use client";

import { useState } from "react";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { resolveMis, MIS_ERROR_MESSAGES, type ResolvedProfile } from "@/lib/mis";

interface Props {
  onResolved: (profile: ResolvedProfile) => void;
}

export default function MisEntryForm({ onResolved }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const result = resolveMis(value);
      setLoading(false);
      if (!result.ok) {
        setError(MIS_ERROR_MESSAGES[result.reason]);
        return;
      }
      onResolved(result.profile);
    }, 300);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="glow-accent mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15">
        <GraduationCap size={30} className="text-accent-soft" />
      </div>

      <h1 className="text-center text-2xl font-semibold text-text-primary">
        Find your timetable
      </h1>
      <p className="mt-2 max-w-xs text-center text-sm text-text-secondary">
        Enter your MIS number and we&apos;ll pull up your branch, division and
        batch automatically.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 w-full max-w-xs">
        <input
          type="text"
          inputMode="numeric"
          maxLength={9}
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
          placeholder="e.g. 612515244"
          className="glass w-full rounded-xl px-4 py-3.5 text-center text-lg font-medium tracking-wide text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-soft/50"
        />

        {error && (
          <p className="mt-3 text-center text-sm text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={value.length !== 9 || loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Find my timetable
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-text-tertiary">
        Currently supports CSE and AIML, second year.
      </p>
    </div>
  );
}
