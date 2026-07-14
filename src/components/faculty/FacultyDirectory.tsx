"use client";

import { useState } from "react";
import { ChevronDown, BookUser } from "lucide-react";
import { getFacultyDirectory } from "@/lib/faculty";
import FacultyAdvisorCard from "./FacultyAdvisorCard";
import FacultyCard from "./FacultyCard";
import Toast from "./Toast";

export default function FacultyDirectory() {
  const [open, setOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const faculty = getFacultyDirectory();
  const advisors = faculty.filter((f) => f.advisor);
  const others = faculty.filter((f) => !f.advisor);

  function handleCopyEmail(email: string) {
    navigator.clipboard.writeText(email).then(() => {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 1800);
    });
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="glass flex w-full items-center justify-between rounded-xl px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <BookUser size={16} className="text-accent-soft" />
          Faculty Directory
        </span>
        <span className="flex items-center gap-1 text-xs text-text-tertiary">
          {open ? "Hide" : "Show"} Faculty Directory
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <div className={`accordion-grid ${open ? "accordion-open" : ""}`}>
        <div className="accordion-inner">
          <div className="mt-3 flex flex-col gap-4">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-soft">
                <span aria-hidden>⭐</span> Faculty Advisors
              </p>
              <div className="flex flex-col gap-2">
                {advisors.map((f) => (
                  <FacultyAdvisorCard
                    key={f.id}
                    faculty={f}
                    onCopyEmail={handleCopyEmail}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                All Faculty
              </p>
              <div className="flex flex-col gap-2">
                {others.map((f) => (
                  <FacultyCard
                    key={f.id}
                    faculty={f}
                    onCopyEmail={handleCopyEmail}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast message="Email copied" visible={toastVisible} />
    </div>
  );
}
