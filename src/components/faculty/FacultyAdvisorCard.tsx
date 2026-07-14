"use client";

import { Star, MapPin, Mail, Copy } from "lucide-react";
import type { Faculty } from "@/lib/faculty";

interface Props {
  faculty: Faculty;
  onCopyEmail: (email: string) => void;
}

export default function FacultyAdvisorCard({ faculty, onCopyEmail }: Props) {
  return (
    <div className="glass relative overflow-hidden rounded-xl border-accent-soft/30 px-4 py-3">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-accent"
      />
      <div className="flex items-center gap-2">
        <Star size={13} className="shrink-0 fill-accent-soft text-accent-soft" />
        <p className="text-sm font-semibold text-text-primary">{faculty.name}</p>
      </div>
      {faculty.advisorFor && (
        <p className="mt-0.5 pl-[21px] text-xs text-accent-soft">
          {faculty.advisorFor}
        </p>
      )}

      {(faculty.cabin || faculty.email) && (
        <div className="mt-2 flex flex-col gap-1.5 pl-[21px]">
          {faculty.cabin && (
            <p className="flex items-center gap-1.5 text-xs text-text-secondary">
              <MapPin size={12} />
              {faculty.cabin}
            </p>
          )}
          {faculty.email && (
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Mail size={12} />
                {faculty.email}
              </p>
              <button
                onClick={() => onCopyEmail(faculty.email)}
                className="rounded-md p-1.5 text-text-tertiary transition-colors active:text-accent-soft"
                aria-label="Copy email"
              >
                <Copy size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
