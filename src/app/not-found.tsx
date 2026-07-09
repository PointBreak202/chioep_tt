import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-6">
      <div className="glow-accent mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15">
        <Compass size={28} className="text-accent-soft" />
      </div>
      <h1 className="text-center text-xl font-semibold text-text-primary">
        Page not found
      </h1>
      <p className="mt-2 max-w-xs text-center text-sm text-text-secondary">
        That page doesn&apos;t exist. Let&apos;s get you back to your
        schedule.
      </p>
      <Link
        href="/today"
        className="mt-6 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white"
      >
        Go to Today
      </Link>
    </div>
  );
}
