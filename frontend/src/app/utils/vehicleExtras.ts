import { loadFromStorage, saveToStorage } from "./storage";

export type VehicleExtra = {
  id: string;
  name: string;
  desc: string;
  price: number;
  disabled?: boolean;
  createdAt?: string;
};

export const VEHICLE_EXTRAS_KEY = "renta_vehicle_extras";

export const DEFAULT_VEHICLE_EXTRAS: VehicleExtra[] = [
  { id: "gps", name: "GPS Premium", desc: "Navegación offline y actualizaciones en tiempo real", price: 8 },
  { id: "child", name: "Silla infantil", desc: "Homologada, grupo 0-36 kg", price: 12 },
  { id: "insurance", name: "Seguro Full Cover", desc: "Sin franquicia, cobertura total", price: 25 },
  { id: "driver", name: "Conductor adicional", desc: "Añade un segundo conductor", price: 15 },
];

export const loadVehicleExtras = () => {
  const savedExtras = loadFromStorage<VehicleExtra[]>(VEHICLE_EXTRAS_KEY, []);
  if (!savedExtras.length) return DEFAULT_VEHICLE_EXTRAS;

  const merged = new Map<string, VehicleExtra>();
  DEFAULT_VEHICLE_EXTRAS.forEach((extra) => merged.set(extra.id, extra));
  savedExtras.forEach((extra) => merged.set(extra.id, extra));
  return Array.from(merged.values());
};

export const saveVehicleExtras = (extras: VehicleExtra[]) => {
  saveToStorage(VEHICLE_EXTRAS_KEY, extras);
};

export const makeExtraId = (name: string) => {
  const base = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base || "extra"}-${Date.now()}`;
};
