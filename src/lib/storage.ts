import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import type { Vehicle, FillUp, CostEntry, Station } from "./types";
import { seedVehicles, seedFillUps, seedStations, seedCosts } from "./sampleData";

const KEYS = {
  vehicles: "ft_vehicles",
  fillups: "ft_fillups",
  costs: "ft_costs",
  stations: "ft_stations",
  selectedVehicle: "ft_selected_vehicle",
  seeded: "ft_seeded_v1",
};

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new CustomEvent("ft-storage", { detail: key }));
}

export function ensureSeed() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(KEYS.seeded)) {
    writeJSON(KEYS.vehicles, seedVehicles);
    writeJSON(KEYS.fillups, seedFillUps);
    writeJSON(KEYS.stations, seedStations);
    writeJSON(KEYS.costs, seedCosts);
    writeJSON(KEYS.selectedVehicle, seedVehicles[0].id);
    localStorage.setItem(KEYS.seeded, "1");
  }
}

function subscribe(cb: () => void) {
  const handler = () => cb();
  window.addEventListener("ft-storage", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("ft-storage", handler);
    window.removeEventListener("storage", handler);
  };
}

function useLS<T>(key: string, fallback: T) {
  const get = useCallback(() => readJSON<T>(key, fallback), [key]);
  const value = useSyncExternalStore(
    subscribe,
    get,
    () => fallback,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readJSON<T>(key, fallback);
      const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      writeJSON(key, v);
    },
    [key],
  );
  return [value, set] as const;
}

export const useVehicles = () => useLS<Vehicle[]>(KEYS.vehicles, []);
export const useFillUps = () => useLS<FillUp[]>(KEYS.fillups, []);
export const useCosts = () => useLS<CostEntry[]>(KEYS.costs, []);
export const useStations = () => useLS<Station[]>(KEYS.stations, []);
export const useSelectedVehicleId = () =>
  useLS<string>(KEYS.selectedVehicle, "");

export function useSelectedVehicle() {
  const [vehicles] = useVehicles();
  const [id, setId] = useSelectedVehicleId();
  const vehicle = vehicles.find((v) => v.id === id) ?? vehicles[0];
  return { vehicle, setId, vehicles };
}

export function exportAll() {
  const data = {
    vehicles: readJSON(KEYS.vehicles, []),
    fillups: readJSON(KEYS.fillups, []),
    costs: readJSON(KEYS.costs, []),
    stations: readJSON(KEYS.stations, []),
  };
  return JSON.stringify(data, null, 2);
}

export function importAll(json: string) {
  const data = JSON.parse(json);
  if (data.vehicles) writeJSON(KEYS.vehicles, data.vehicles);
  if (data.fillups) writeJSON(KEYS.fillups, data.fillups);
  if (data.costs) writeJSON(KEYS.costs, data.costs);
  if (data.stations) writeJSON(KEYS.stations, data.stations);
}

export function resetAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  ensureSeed();
}

// Hydration helper for components
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => {
    ensureSeed();
    setH(true);
  }, []);
  return h;
}
