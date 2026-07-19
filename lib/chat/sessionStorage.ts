import type { UIMessage } from "ai";
import { MODES, type Mode } from "@/lib/prompts";

const ACTIVE_MODE_KEY = "benvenuto:chat:activeMode";

function storageKey(mode: Mode): string {
  return `benvenuto:chat:${mode}`;
}

function isMode(value: string): value is Mode {
  return MODES.some((m) => m.id === value);
}

export function loadStoredMessages(mode: Mode): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(storageKey(mode));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UIMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredMessages(mode: Mode, messages: UIMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(storageKey(mode), JSON.stringify(messages));
  } catch {
    // sessionStorage voi olla täynnä tai estetty (esim. yksityinen selaus) — hiljainen ohitus riittää
  }
}

export function clearStoredMessages(mode: Mode): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(storageKey(mode));
  } catch {
    // ohitetaan
  }
}

// `app/(app)/page.tsx` unmounttautuu kokonaan sisarreittien välisessä navigoinnissa, joten myös sen
// `activeMode`-React-tila resetoituisi oletusarvoonsa ilman tätä — jotta paluu samaan tilaan `/`:iin
// näyttää oikean (viimeksi aktiivisen) tilan eikä oletustilaa, viimeksi valittu tila persistoidaan
// tässä erikseen. Tämä EI muuta `activeMode`-tilan tai `key`-remount-mekanismin toimintaa, ainoastaan
// sen alkuarvon.
export function loadActiveMode(fallback: Mode): Mode {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(ACTIVE_MODE_KEY);
    if (raw !== null && isMode(raw)) return raw;
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveActiveMode(mode: Mode): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ACTIVE_MODE_KEY, mode);
  } catch {
    // ohitetaan
  }
}
