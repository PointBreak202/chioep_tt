"use client";

import { X, User } from "lucide-react";
import type { StudentDirectoryEntry } from "@/lib/students";

interface Props {
  selected: StudentDirectoryEntry[];
  onRemove: (mis: string) => void;
}

export default function SelectedStudents({ selected, onRemove }: Props) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <div className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 border-accent-soft/40">
        <User size={13} className="text-accent-soft" />
        <span className="text-xs font-semibold text-text-primary">You</span>
      </div>

      {selected.map((s) => (
        <div
          key={s.mis}
          className="glass flex items-center gap-1.5 rounded-full py-1.5 pl-3 pr-2 transition-transform"
          style={{ animation: "splashIn 0.25s ease-out" }}
        >
          <span className="text-xs font-medium text-text-primary">
            {s.name.split(" ")[0]}
          </span>
          <button
            onClick={() => onRemove(s.mis)}
            className="rounded-full p-0.5 text-text-tertiary transition-colors active:text-danger"
            aria-label={`Remove ${s.name}`}
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
