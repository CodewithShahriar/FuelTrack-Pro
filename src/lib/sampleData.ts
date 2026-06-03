import type { Vehicle, FillUp, Station, CostEntry } from "./types";

export const seedVehicles: Vehicle[] = [
  {
    id: "v_apache",
    name: "Apache 4v",
    type: "bike",
    initialOdo: 32000,
    fuelUnit: "L",
    distanceUnit: "km",
    currency: "৳",
    fuelType: "Octane",
  },
];

const today = new Date();
function daysAgo(n: number) {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const seedFillUps: FillUp[] = [
  { id: "f1", vehicleId: "v_apache", date: daysAgo(120), odo: 32450, litres: 4.2, pricePerLitre: 135, totalCost: 567, fuelType: "Octane", fullTank: true, stationName: "Padma Filling Station" },
  { id: "f2", vehicleId: "v_apache", date: daysAgo(95), odo: 32630, litres: 4.5, pricePerLitre: 135, totalCost: 607.5, fuelType: "Octane", fullTank: true, stationName: "Meghna Petrol Pump" },
  { id: "f3", vehicleId: "v_apache", date: daysAgo(70), odo: 32820, litres: 4.6, pricePerLitre: 140, totalCost: 644, fuelType: "Octane", fullTank: true, stationName: "Padma Filling Station" },
  { id: "f4", vehicleId: "v_apache", date: daysAgo(45), odo: 33010, litres: 4.7, pricePerLitre: 140, totalCost: 658, fuelType: "Octane", fullTank: true, stationName: "Jamuna Oil" },
  { id: "f5", vehicleId: "v_apache", date: daysAgo(30), odo: 33240, litres: 5.5, pricePerLitre: 140, totalCost: 770, fuelType: "Octane", fullTank: true, stationName: "Padma Filling Station" },
  { id: "f6", vehicleId: "v_apache", date: daysAgo(18), odo: 33490, litres: 6.0, pricePerLitre: 140, totalCost: 840, fuelType: "Octane", fullTank: true, stationName: "Meghna Petrol Pump" },
  { id: "f7", vehicleId: "v_apache", date: daysAgo(8), odo: 33780, litres: 6.9, pricePerLitre: 140, totalCost: 966, fuelType: "Octane", fullTank: true, stationName: "Padma Filling Station", pictures: 1 },
  { id: "f8", vehicleId: "v_apache", date: daysAgo(2), odo: 35066.3, litres: 6.2, pricePerLitre: 140, totalCost: 868, fuelType: "Octane", fullTank: true, stationName: "Jamuna Oil" },
];

export const seedStations: Station[] = [
  { id: "s1", name: "Padma Filling Station", distanceKm: 0.8, latestPrice: 140, tags: ["Nearby", "Top rated"], favourite: true },
  { id: "s2", name: "Meghna Petrol Pump", distanceKm: 1.4, latestPrice: 139, tags: ["Best price"] },
  { id: "s3", name: "Jamuna Oil", distanceKm: 2.1, latestPrice: 141, tags: ["Nearby"] },
  { id: "s4", name: "City Fuel Hub", distanceKm: 3.5, latestPrice: 140, tags: [] },
  { id: "s5", name: "Highway Energy", distanceKm: 5.0, latestPrice: 138, tags: ["Best price"] },
];

export const seedCosts: CostEntry[] = [
  { id: "c1", vehicleId: "v_apache", date: daysAgo(60), type: "service", amount: 1500, odo: 32900, note: "Engine oil change" },
  { id: "c2", vehicleId: "v_apache", date: daysAgo(20), type: "wash", amount: 200, odo: 33500, note: "Detailed wash" },
  { id: "c3", vehicleId: "v_apache", date: daysAgo(5), type: "repair", amount: 850, odo: 34900, note: "Brake pad replace" },
];
