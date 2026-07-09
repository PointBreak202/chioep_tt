"use client";

import { useState } from "react";
import { Users, ArrowRight } from "lucide-react";
import type { ResolvedProfile } from "@/lib/mis";
import misMapping from "@/data/mis-mapping.json";

interface Props {
  profile: ResolvedProfile;
  onConfirmed: (batchLabel: string) => void;
}

export default function ManualBatchPicker({ profile, onConfirmed }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const key = `${profile.branchCode}-${profile.division}`;
  const options =
    (misMapping.manualBatchOptions as Record<string, string[]>)[key] ?? [];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="glow-accent mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15">
        <Users size={28} className="text-accent-soft" />
      </div>

      <h1 className="text-center text-2xl font-semibold text-text-primary">
        Which batch are you in?
      </h1>
      <p className="mt-2 max-w-xs text-center text-sm text-text-secondary">
        We couldn&apos;t auto-detect your lab batch for {profile.branchName},
        Division {profile.division}. Pick it below.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
        {options.map((label) => (
          <button
            key={label}
            onClick={() => setSelected(label)}
            className={`glass rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              selected === label
                ? "border-accent-soft/60 bg-accent/15 text-text-primary"
                : "text-text-secondary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        disabled={!selected}
        onClick={() => selected && onConfirmed(selected)}
        className="mt-6 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
      >
        Confirm
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
