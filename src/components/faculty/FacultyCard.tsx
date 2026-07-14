"use client";

import { useState } from "react";
import { ChevronDown, User, MapPin, Mail, Copy } from "lucide-react";
import type { Faculty } from "@/lib/faculty";

interface Props {
  faculty: Faculty;
  onCopyEmail: (email: string) => void;
}

export default function FacultyCard({ faculty, onCopyEmail }: Props) {
  const [open, setOpen] = useState(false);
  const hasDetails = faculty.subjects.length > 0 || faculty.cabin || faculty.email;

  return (
    <div className="glass overflow-hidden rounded-xl transition-transform active:scale-[0.99]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <User size={15} className="text-text-tertiary" />
          {faculty.name}
        </span>
        {hasDetails && (
          <ChevronDown
            size={16}
            className={`shrink-0 text-text-tertiary transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {hasDetails && (
        <div className={`accordion-grid ${open ? "accordion-open" : ""}`}>
          <div className="accordion-inner">
            <div className="flex flex-col gap-3 px-4 pb-4 pt-1">
              {faculty.subjects.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                    Subjects
                  </p>
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {faculty.subjects.map((s) => (
                      <li key={s} className="text-xs text-text-secondary">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {faculty.cabin && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                    Cabin
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin size={12} />
                    {faculty.cabin}
                  </p>
                </div>
              )}

              {faculty.email && (
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Mail size={12} />
                    {faculty.email}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyEmail(faculty.email);
                    }}
                    className="rounded-md p-1.5 text-text-tertiary transition-colors active:text-accent-soft"
                    aria-label="Copy email"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
