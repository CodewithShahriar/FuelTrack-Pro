import type { Vehicle, FillUp, Station, CostEntry } from "./types";

export const seedVehicles: Vehicle[] = [
  {
    id: "v_apache",
    name: "Apache 4v",
    type: "bike",
    initialOdo: 21875.2,
    fuelUnit: "L",
    distanceUnit: "km",
    currency: "BDT ",
    fuelType: "Octane",
  },
];

export const seedFillUps: FillUp[] = [
  { id: "f_1", vehicleId: "v_apache", date: "2024-10-10T00:00:00.000Z", odo: 21875.2, litres: 10.4, pricePerLitre: 125, totalCost: 1300, fuelType: "Octane", fullTank: true },
  { id: "f_2", vehicleId: "v_apache", date: "2024-10-28T00:00:00.000Z", odo: 22330, litres: 7.33, pricePerLitre: 125, totalCost: 916.25, fuelType: "Octane", fullTank: false },
  { id: "f_3", vehicleId: "v_apache", date: "2024-10-31T00:00:00.000Z", odo: 22381.3, litres: 9.76, pricePerLitre: 125, totalCost: 1220, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_4", vehicleId: "v_apache", date: "2024-11-07T00:00:00.000Z", odo: 22585.9, litres: 4.93, pricePerLitre: 125, totalCost: 616.25, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_5", vehicleId: "v_apache", date: "2024-11-17T00:00:00.000Z", odo: 22999.8, litres: 10.58, pricePerLitre: 125, totalCost: 1322.5, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_6", vehicleId: "v_apache", date: "2024-11-26T00:00:00.000Z", odo: 23430.6, litres: 10.6, pricePerLitre: 125, totalCost: 1325, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_7", vehicleId: "v_apache", date: "2024-12-04T00:00:00.000Z", odo: 23833.3, litres: 8.904, pricePerLitre: 125, totalCost: 1113, fuelType: "Octane", fullTank: true },
  { id: "f_8", vehicleId: "v_apache", date: "2024-12-13T00:00:00.000Z", odo: 24012.1, litres: 5.096, pricePerLitre: 125, totalCost: 637, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_9", vehicleId: "v_apache", date: "2024-12-26T00:00:00.000Z", odo: 24475.6, litres: 10.8, pricePerLitre: 125, totalCost: 1350, fuelType: "Octane", fullTank: true, pictures: 2 },
  { id: "f_10", vehicleId: "v_apache", date: "2025-01-17T00:00:00.000Z", odo: 24845.5, litres: 9.744, pricePerLitre: 125, totalCost: 1218, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_11", vehicleId: "v_apache", date: "2025-01-25T00:00:00.000Z", odo: 25194.7, litres: 8.616, pricePerLitre: 125, totalCost: 1077, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_12", vehicleId: "v_apache", date: "2025-02-18T00:00:00.000Z", odo: 25544.3, litres: 9.69, pricePerLitre: 126, totalCost: 1221, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_13", vehicleId: "v_apache", date: "2025-03-12T00:00:00.000Z", odo: 25967.4, litres: 10.317, pricePerLitre: 126, totalCost: 1300, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_14", vehicleId: "v_apache", date: "2025-03-30T00:00:00.000Z", odo: 26304.4, litres: 9.77, pricePerLitre: 126, totalCost: 1231, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_15", vehicleId: "v_apache", date: "2025-04-12T00:00:00.000Z", odo: 26678.6, litres: 8.24, pricePerLitre: 126.1, totalCost: 1039.1, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_16", vehicleId: "v_apache", date: "2025-05-02T00:00:00.000Z", odo: 27074.1, litres: 9.01, pricePerLitre: 125, totalCost: 1126.25, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_17", vehicleId: "v_apache", date: "2025-06-03T00:00:00.000Z", odo: 27510, litres: 9.926, pricePerLitre: 122, totalCost: 1211, fuelType: "Octane", fullTank: true },
  { id: "f_18", vehicleId: "v_apache", date: "2025-07-01T00:00:00.000Z", odo: 27924.1, litres: 10.262, pricePerLitre: 122, totalCost: 1252, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_19", vehicleId: "v_apache", date: "2025-07-19T00:00:00.000Z", odo: 28331.5, litres: 10.09, pricePerLitre: 122, totalCost: 1230.98, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_20", vehicleId: "v_apache", date: "2025-08-20T00:00:00.000Z", odo: 28693.6, litres: 9.016, pricePerLitre: 122, totalCost: 1100, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_21", vehicleId: "v_apache", date: "2025-09-01T00:00:00.000Z", odo: 29049.6, litres: 8.197, pricePerLitre: 122, totalCost: 1000, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_22", vehicleId: "v_apache", date: "2025-09-21T00:00:00.000Z", odo: 29417.1, litres: 9.082, pricePerLitre: 122, totalCost: 1108, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_23", vehicleId: "v_apache", date: "2025-10-10T00:00:00.000Z", odo: 29751.4, litres: 8.115, pricePerLitre: 122, totalCost: 990, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_24", vehicleId: "v_apache", date: "2025-10-22T00:00:00.000Z", odo: 30094.5, litres: 7.598, pricePerLitre: 122, totalCost: 927, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_25", vehicleId: "v_apache", date: "2025-11-03T00:00:00.000Z", odo: 30525.1, litres: 9.83, pricePerLitre: 122, totalCost: 1199.26, fuelType: "Octane", fullTank: true },
  { id: "f_26", vehicleId: "v_apache", date: "2025-11-18T00:00:00.000Z", odo: 30965.2, litres: 9.279, pricePerLitre: 122, totalCost: 1132, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_27", vehicleId: "v_apache", date: "2025-12-03T00:00:00.000Z", odo: 31383.1, litres: 9.08, pricePerLitre: 124, totalCost: 1125.92, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_28", vehicleId: "v_apache", date: "2025-12-16T00:00:00.000Z", odo: 31764.1, litres: 9.84, pricePerLitre: 124, totalCost: 1220, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_29", vehicleId: "v_apache", date: "2025-12-31T00:00:00.000Z", odo: 32296, litres: 11.08, pricePerLitre: 124, totalCost: 1374, fuelType: "Octane", fullTank: true },
  { id: "f_30", vehicleId: "v_apache", date: "2026-01-25T00:00:00.000Z", odo: 32675.8, litres: 9.18, pricePerLitre: 122, totalCost: 1120, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_31", vehicleId: "v_apache", date: "2026-02-27T00:00:00.000Z", odo: 33021.1, litres: 8.34, pricePerLitre: 119.904, totalCost: 1000, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_32", vehicleId: "v_apache", date: "2026-03-26T00:00:00.000Z", odo: 33286.3, litres: 4.17, pricePerLitre: 120, totalCost: 500, fuelType: "Octane", fullTank: false },
  { id: "f_33", vehicleId: "v_apache", date: "2026-04-06T00:00:00.000Z", odo: 33565, litres: 1, pricePerLitre: 120, totalCost: 120, fuelType: "Octane", fullTank: false },
  { id: "f_34", vehicleId: "v_apache", date: "2026-04-07T00:00:00.000Z", odo: 33595, litres: 8.33, pricePerLitre: 120, totalCost: 999.6, fuelType: "Octane", fullTank: true },
  { id: "f_35", vehicleId: "v_apache", date: "2026-04-12T00:00:00.000Z", odo: 33779.8, litres: 4.17, pricePerLitre: 120, totalCost: 500, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_36", vehicleId: "v_apache", date: "2026-04-28T00:00:00.000Z", odo: 34181.5, litres: 9.21, pricePerLitre: 140, totalCost: 1290, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_37", vehicleId: "v_apache", date: "2026-05-15T00:00:00.000Z", odo: 34586.2, litres: 8.57, pricePerLitre: 140, totalCost: 1200, fuelType: "Octane", fullTank: true, pictures: 1 },
  { id: "f_38", vehicleId: "v_apache", date: "2026-05-26T00:00:00.000Z", odo: 35066.3, litres: 9.05, pricePerLitre: 140, totalCost: 1267, fuelType: "Octane", fullTank: true },
];

export const seedStations: Station[] = [];

export const seedCosts: CostEntry[] = [];
