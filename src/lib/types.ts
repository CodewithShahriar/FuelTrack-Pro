export type VehicleType = "car" | "bike" | "truck";

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  initialOdo: number;
  fuelUnit: string; // "L"
  distanceUnit: string; // "km"
  currency: string; // "BDT "
  fuelType?: string;
}

export interface FillUp {
  id: string;
  vehicleId: string;
  date: string; // ISO
  odo: number;
  litres: number;
  pricePerLitre: number;
  totalCost: number;
  fuelType: string;
  fullTank: boolean;
  tankLevel?: number;
  stationId?: string;
  stationName?: string;
  notes?: string;
  discount?: boolean;
  missedPrevious?: boolean;
  pictures?: number;
}

export type CostType =
  | "service"
  | "repair"
  | "insurance"
  | "parking"
  | "toll"
  | "wash"
  | "other";

export interface CostEntry {
  id: string;
  vehicleId: string;
  date: string;
  type: CostType;
  amount: number;
  odo?: number;
  note?: string;
}

export interface Station {
  id: string;
  name: string;
  distanceKm: number;
  latestPrice: number;
  tags: string[];
  favourite?: boolean;
}
