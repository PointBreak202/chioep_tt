"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-6">
      <div className="glow-accent mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/15">
        <TriangleAlert size={28} className="text-danger" />
      </div>
      <h1 className="text-center text-xl font-semibold text-text-primary">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-xs text-center text-sm text-text-secondary">
        That&apos;s on us, not you. Try again, and if it keeps happening, let
        us know.
      </p>
      <button
        onClick={reset}
        className="mt-6 flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white"
      >
        <RotateCcw size={16} />
        Try again
      </button>
    </div>
  );
}
