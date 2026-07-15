"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function Accordion({ title, subtitle, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-text-primary">{title}</p>
          {subtitle && <p className="mt-0.5 text-[11px] text-text-tertiary">{subtitle}</p>}
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-text-tertiary transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className={`accordion-grid ${open ? "accordion-open" : ""}`}>
        <div className="accordion-inner">
          <div className="border-t border-border-subtle px-4 py-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
