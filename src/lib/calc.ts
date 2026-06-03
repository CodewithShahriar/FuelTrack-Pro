import type { FillUp, CostEntry } from "./types";

export function sortByDate<T extends { date: string }>(a: T[], asc = true) {
  return [...a].sort(
    (x, y) =>
      (asc ? 1 : -1) *
      (new Date(x.date).getTime() - new Date(y.date).getTime()),
  );
}

export function fillUpsForVehicle(all: FillUp[], vehicleId: string) {
  return sortByDate(all.filter((f) => f.vehicleId === vehicleId), true);
}

/**
 * Compute consumption km/L for each fill-up using distance since previous full tank.
 */
export function withConsumption(fillups: FillUp[]) {
  const sorted = sortByDate(fillups, true);
  let lastFullOdo: number | null = null;
  let litresSince = 0;
  return sorted.map((f) => {
    let consumption: number | null = null;
    let distance: number | null = null;
    if (lastFullOdo !== null) {
      distance = f.odo - lastFullOdo;
      litresSince += f.litres;
      if (f.fullTank && distance > 0 && litresSince > 0) {
        consumption = distance / litresSince;
      }
    }
    const out = { ...f, consumption, distance };
    if (f.fullTank) {
      lastFullOdo = f.odo;
      litresSince = 0;
    }
    return out;
  });
}

export type FillUpComputed = ReturnType<typeof withConsumption>[number];

export function inRange(dateISO: string, from: Date, to: Date) {
  const d = new Date(dateISO).getTime();
  return d >= from.getTime() && d <= to.getTime();
}

export function ranges() {
  const now = new Date();
  const startThisYear = new Date(now.getFullYear(), 0, 1);
  const startNextYear = new Date(now.getFullYear() + 1, 0, 1);
  const startPrevYear = new Date(now.getFullYear() - 1, 0, 1);
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return {
    thisYear: [startThisYear, startNextYear] as const,
    prevYear: [startPrevYear, startThisYear] as const,
    thisMonth: [startThisMonth, startNextMonth] as const,
    prevMonth: [startPrevMonth, startThisMonth] as const,
  };
}

export function groupByMonth<T extends { date: string }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const it of sortByDate(items, false)) {
    const d = new Date(it.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(it);
  }
  return groups;
}

export function fmtMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function fmtMoney(amount: number, currency = "BDT ") {
  return `${currency}${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function fmtNum(n: number | null | undefined, digits = 2) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function costsForVehicle(all: CostEntry[], vehicleId: string) {
  return sortByDate(all.filter((c) => c.vehicleId === vehicleId), false);
}
