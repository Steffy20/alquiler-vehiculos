export type StorageKey =
  | "renta_userName"
  | "renta_userEmail"
  | "renta_userPhone"
  | "renta_isAdmin"
  | "renta_userRole"
  | "renta_vehicles"
  | "renta_vehicle_inventory"
  | "renta_reservations"
  | "renta_activity_log"
  | "renta_users";

export function loadFromStorage<T>(key: StorageKey, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: StorageKey, value: T): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures in private mode / quota exceeded.
  }
}

export function removeFromStorage(key: StorageKey): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}
