import type {
  AdvisorTextSlot,
  CachedAdvisorText,
} from "@/app/types/advisor-text";

const STORAGE_KEY = "energie-quartier-advisor-texts";
const MAX_ENTRIES = 40;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function readAll(): CachedAdvisorText[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CachedAdvisorText[];
  } catch {
    return [];
  }
}

function writeAll(entries: CachedAdvisorText[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function getAdvisorCache(
  slot: AdvisorTextSlot,
  cacheKey: string,
): CachedAdvisorText | null {
  const entry = readAll().find(
    (e) => e.slot === slot && e.cacheKey === cacheKey,
  );
  if (!entry) return null;

  const age = Date.now() - new Date(entry.createdAt).getTime();
  if (age > MAX_AGE_MS) return null;

  return entry;
}

export function setAdvisorCache(entry: CachedAdvisorText): void {
  const filtered = readAll().filter(
    (e) => !(e.slot === entry.slot && e.cacheKey === entry.cacheKey),
  );
  writeAll([entry, ...filtered]);
}

export function clearAdvisorCache(
  slot: AdvisorTextSlot,
  cacheKey: string,
): void {
  writeAll(
    readAll().filter((e) => !(e.slot === slot && e.cacheKey === cacheKey)),
  );
}
