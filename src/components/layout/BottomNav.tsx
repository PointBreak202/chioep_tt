"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutList, User, DoorOpen, BookOpen } from "lucide-react";

const TABS = [
  { href: "/today", label: "Today", icon: LayoutList },
  { href: "/week", label: "Week", icon: CalendarDays },
  { href: "/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/syllabus", label: "Syllabus", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 pt-2">
      <div className="glass-strong flex w-full max-w-sm items-center justify-around rounded-2xl px-2 py-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-colors"
            >
              {active && (
                <span className="absolute inset-0 rounded-xl bg-accent/15" />
              )}
              <Icon
                size={20}
                strokeWidth={active ? 2.4 : 1.8}
                className={`relative z-10 transition-colors ${
                  active ? "text-accent-soft" : "text-text-tertiary"
                }`}
              />
              <span
                className={`relative z-10 text-[11px] font-medium transition-colors ${
                  active ? "text-text-primary" : "text-text-tertiary"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
