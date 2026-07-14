"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-base transition-opacity duration-500 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[100px]"
        style={{ background: "var(--accent)" }}
      />
      <div
        className="relative flex flex-col items-center gap-4"
        style={{ animation: "splashIn 0.6s ease-out" }}
      >
        <div className="glow-accent flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
          <GraduationCap size={32} className="text-white" />
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold tracking-tight text-text-primary">
            COEP <span className="text-accent-soft">TT</span>
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            Your schedule, always at hand
          </p>
        </div>
      </div>
    </div>
  );
}
