const USER_KEY = "monitrack_user";
const CURRENCY_KEY = "monitrack_currency";
const CATEGORIES_KEY = "monitrack_categories";

function readStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Failed to parse localStorage key ${key}`, error);
    return null;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getUserName(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USER_KEY);
}

export function setUserName(name: string): void {
  if (typeof window === "undefined") return;
  const trimmed = name.trim();
  if (!trimmed) {
    window.localStorage.removeItem(USER_KEY);
    return;
  }
  window.localStorage.setItem(USER_KEY, trimmed);
}

export function getCurrency(): string {
  if (typeof window === "undefined") return "IDR";
  return window.localStorage.getItem(CURRENCY_KEY) ?? "IDR";
}

export function setCurrency(code: string): void {
  if (typeof window === "undefined") return;
  const normalized = code.trim().toUpperCase() || "IDR";
  window.localStorage.setItem(CURRENCY_KEY, normalized);
}

export function getKnownCategories(): string[] {
  const categories = readStorage<string[]>(CATEGORIES_KEY);
  if (!categories) {
    return [];
  }
  return Array.from(new Set(categories)).filter(Boolean);
}

export function addKnownCategory(cat: string): void {
  if (typeof window === "undefined") return;
  const current = getKnownCategories();
  if (!cat.trim()) return;
  if (!current.includes(cat)) {
    writeStorage(CATEGORIES_KEY, [...current, cat]);
  }
}

export function resetKnownCategories(): void {
  if (typeof window === "undefined") return;
  writeStorage(CATEGORIES_KEY, []);
}
