"use client";

import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useRequireProfile } from "@/lib/useProfile";
import { clearStoredProfile } from "@/lib/profile";
import { Loader2, LogOut, GraduationCap } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading } = useRequireProfile();

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-accent-soft" />
      </div>
    );
  }

  function handleReset() {
    clearStoredProfile();
    router.replace("/");
  }

  return (
    <AppShell>
      <div className="px-5 pt-8">
        <h1 className="text-2xl font-semibold text-text-primary">Profile</h1>

        <div className="glass mt-6 flex items-center gap-4 rounded-2xl p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15">
            <GraduationCap size={22} className="text-accent-soft" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {profile.branchName}
            </p>
            <p className="text-xs text-text-secondary">
              MIS {profile.mis} &middot; Division {profile.division}
            </p>
          </div>
        </div>

        <div className="glass mt-4 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-text-tertiary">
            Batch
          </p>
          <p className="mt-1 text-sm text-text-primary">
            {profile.batchLabel ?? "Not set"}
          </p>
        </div>

        <button
          onClick={handleReset}
          className="glass mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-danger"
        >
          <LogOut size={16} />
          Change MIS number
        </button>
      </div>
    </AppShell>
  );
}
