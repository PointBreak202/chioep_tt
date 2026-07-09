import type { ResolvedProfile } from "./mis";

const STORAGE_KEY = "coep-tt-profile";

export interface StoredProfile extends ResolvedProfile {
  batchLabel: string | null;
}

export function getStoredProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

export function setStoredProfile(profile: StoredProfile): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearStoredProfile(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
