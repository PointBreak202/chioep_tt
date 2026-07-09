"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import MisEntryForm from "@/components/onboarding/MisEntryForm";
import ManualBatchPicker from "@/components/onboarding/ManualBatchPicker";
import { getStoredProfile, setStoredProfile } from "@/lib/profile";
import type { ResolvedProfile } from "@/lib/mis";

export default function RootPage() {
  const router = useRouter();
  const [existing] = useState(() =>
    typeof window === "undefined" ? null : getStoredProfile()
  );
  const [pendingProfile, setPendingProfile] = useState<ResolvedProfile | null>(
    null
  );

  useEffect(() => {
    if (existing) {
      router.replace("/today");
    }
  }, [existing, router]);

  function handleResolved(profile: ResolvedProfile) {
    if (profile.needsManualBatch) {
      setPendingProfile(profile);
      return;
    }
    setStoredProfile({ ...profile });
    router.replace("/today");
  }

  function handleBatchConfirmed(batchLabel: string) {
    if (!pendingProfile) return;
    setStoredProfile({ ...pendingProfile, batchLabel, needsManualBatch: false });
    router.replace("/today");
  }

  if (existing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-accent-soft" />
      </div>
    );
  }

  if (pendingProfile) {
    return (
      <ManualBatchPicker
        profile={pendingProfile}
        onConfirmed={handleBatchConfirmed}
      />
    );
  }

  return <MisEntryForm onResolved={handleResolved} />;
}
