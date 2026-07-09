"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredProfile, type StoredProfile } from "./profile";

export function useRequireProfile() {
  const router = useRouter();
  const [profile] = useState<StoredProfile | null>(() =>
    typeof window === "undefined" ? null : getStoredProfile()
  );

  useEffect(() => {
    if (!profile) {
      router.replace("/");
    }
  }, [profile, router]);

  return { profile, loading: !profile };
}
