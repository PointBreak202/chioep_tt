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
  const [status, setStatus] = useState<{
    checked: boolean;
    existing: ReturnType<typeof getStoredProfile>;
  }>({ checked: false, existing: null });
  const [pendingProfile, setPendingProfile] = useState<ResolvedProfile | null>(
    null
  );

  useEffect(() => {
    // Reading localStorage must happen after mount to avoid a
    // server/client hydration mismatch (see root cause fix above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus({ checked: true, existing: getStoredProfile() });
  }, []);

  useEffect(() => {
    if (status.existing) {
      router.replace("/today");
    }
  }, [status.existing, router]);

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

  if (!status.checked || status.existing) {
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
