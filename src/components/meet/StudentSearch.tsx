"use client";

import { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { searchStudents, type StudentDirectoryEntry } from "@/lib/students";

interface Props {
  excludeMis: string[];
  onSelect: (student: StudentDirectoryEntry) => void;
  disabled: boolean;
}

export default function StudentSearch({ excludeMis, onSelect, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(
    () => searchStudents(query, excludeMis),
    [query, excludeMis]
  );

  const showDropdown = focused && query.trim().length > 0;

  function handleSelect(student: StudentDirectoryEntry) {
    onSelect(student);
    setQuery("");
  }

  return (
    <div className="relative">
      <div className="glass flex items-center gap-2 rounded-xl px-4 py-3">
        <Search size={16} className="shrink-0 text-text-tertiary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={
            disabled ? "Maximum 10 students added" : "Search name or MIS number"
          }
          disabled={disabled}
          className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary disabled:cursor-not-allowed"
        />
      </div>

      <div
        className={`accordion-grid absolute z-20 mt-2 w-full ${
          showDropdown ? "accordion-open" : ""
        }`}
      >
        <div className="accordion-inner">
          <div className="glass-strong flex flex-col overflow-hidden rounded-xl">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-xs text-text-tertiary">
                No students found.
              </p>
            ) : (
              results.map((s) => (
                <button
                  key={s.mis}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(s)}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors active:bg-accent/10"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {s.name}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {s.branchCode} · Div {s.division}
                      {s.batchLabel ? ` · ${s.batchLabel}` : ""}
                    </p>
                  </div>
                  <UserPlus size={15} className="shrink-0 text-accent-soft" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
