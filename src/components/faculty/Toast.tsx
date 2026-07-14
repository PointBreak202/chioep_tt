"use client";

import { Check } from "lucide-react";

interface Props {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: Props) {
  return (
    <div
      className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transition-opacity duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={visible ? { animation: "toastIn 0.25s ease-out" } : undefined}
    >
      <div className="glass-strong flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-text-primary">
        <Check size={14} className="text-live-now" />
        {message}
      </div>
    </div>
  );
}
