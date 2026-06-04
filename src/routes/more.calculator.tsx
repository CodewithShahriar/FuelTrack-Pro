import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileShell, Card } from "@/components/MobileShell";
import { useFillUps, useSelectedVehicle } from "@/lib/storage";
import { fillUpsForVehicle, fmtMoney, fmtNum, withConsumption } from "@/lib/calc";
import { Calculator, Fuel, Gauge, Route as RouteIcon } from "lucide-react";

export const Route = createFileRoute("/more/calculator")({
  head: () => ({ meta: [{ title: "Calculator — FuelTrack Pro" }] }),
  component: CalculatorPage,
});

type CalcType = "trip" | "distance" | "consumption" | "fuel";
type CalcResult = {
  cost?: number;
  fuel?: number;
  distance?: number;
  consumption?: number;
  costPerKm?: number;
  rangeCost?: number;
};

function CalculatorPage() {
  const { vehicle, vehicles, setId } = useSelectedVehicle();
  const [fillups] = useFillUps();
  const nav = useNavigate();
  const [type, setType] = useState<CalcType>("trip");
  const [distance, setDistance] = useState("");
  const [fuelAmount, setFuelAmount] = useState("");
  const [price, setPrice] = useState("");
  const [consumption, setConsumption] = useState("");

  const defaults = useMemo(() => {
    if (!vehicle) return { consumption: "", price: "" };
    const mine = withConsumption(fillUpsForVehicle(fillups, vehicle.id));
    const last = mine[mine.length - 1];
    const values = mine.map((f) => f.consumption).filter((v): v is number => !!v);
    const avg = values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null;
    return {
      consumption: avg ? avg.toFixed(2) : "35",
      price: last?.pricePerLitre ? String(last.pricePerLitre) : "",
    };
  }, [fillups, vehicle]);

  useEffect(() => {
    setConsumption(defaults.consumption);
    setPrice(defaults.price);
  }, [defaults.consumption, defaults.price, vehicle?.id]);

  const numbers = useMemo(() => ({
    distance: positiveNumber(distance),
    fuel: positiveNumber(fuelAmount),
    price: positiveNumber(price),
    consumption: positiveNumber(consumption),
  }), [distance, fuelAmount, price, consumption]);

  const result = useMemo<CalcResult | null>(() => {
    const d = numbers.distance;
    const fuelInput = numbers.fuel;
    const p = numbers.price;
    const c = numbers.consumption;

    if (type === "trip" && d && p && c) {
      const fuel = d / c;
      return { fuel, cost: fuel * p, costPerKm: p / c };
    }

    if (type === "fuel" && d && c) {
      const fuel = d / c;
      return { fuel, cost: p ? fuel * p : undefined };
    }

    if (type === "distance" && fuelInput && c) {
      const range = fuelInput * c;
      return { distance: range, rangeCost: p ? fuelInput * p : undefined };
    }

    if (type === "consumption" && d && fuelInput) {
      return { consumption: d / fuelInput };
    }

    return null;
  }, [numbers, type]);

  if (!vehicle) return <MobileShell title="Calculator" back={() => nav({ to: "/more" })}><Card>No vehicle selected</Card></MobileShell>;

  const conf = {
    trip: { fields: ["distance", "price", "consumption"], desc: "Estimate trip fuel and total cost." },
    distance: { fields: ["fuel", "consumption", "price"], desc: "Estimate how far your available fuel can go." },
    consumption: { fields: ["distance", "fuel"], desc: "Calculate mileage from distance and fuel used." },
    fuel: { fields: ["distance", "consumption", "price"], desc: "Estimate required fuel for a route." },
  }[type];

  const missing = missingFields(type, numbers);

  return (
    <MobileShell title="Calculator" back={() => nav({ to: "/more" })}>
      <div className="space-y-4">
        <Card>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Vehicle</div>
          <select value={vehicle.id} onChange={(e) => setId(e.target.value)} className="w-full bg-transparent font-semibold outline-none">
            {vehicles.map((v) => (<option key={v.id} value={v.id}>{v.name}</option>))}
          </select>
        </Card>

        <Card>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Calculator option
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CalcType)}
            className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="trip">Trip cost</option>
            <option value="fuel">Required fuel</option>
            <option value="distance">Distance from fuel</option>
            <option value="consumption">Consumption</option>
          </select>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <ModeButton
            active={type === "trip"}
            icon={Calculator}
            label="Trip cost"
            sub="Fuel + money"
            onClick={() => setType("trip")}
          />
          <ModeButton
            active={type === "fuel"}
            icon={Fuel}
            label="Required fuel"
            sub="Litres needed"
            onClick={() => setType("fuel")}
          />
          <ModeButton
            active={type === "distance"}
            icon={RouteIcon}
            label="Distance"
            sub="Range from fuel"
            onClick={() => setType("distance")}
          />
          <ModeButton
            active={type === "consumption"}
            icon={Gauge}
            label="Consumption"
            sub="km per litre"
            onClick={() => setType("consumption")}
          />
        </div>

        <Card className="space-y-3">
          <div>
            <div className="text-sm font-semibold">{conf.desc}</div>
            {defaults.consumption && (
              <div className="text-xs text-muted-foreground mt-1">
                Average consumption prefilled from your fuel logs.
              </div>
            )}
          </div>
          {conf.fields.includes("distance") && (
            <NumberField label={`Distance (${vehicle.distanceUnit})`} value={distance} onChange={setDistance} placeholder="e.g. 120" />
          )}
          {conf.fields.includes("fuel") && (
            <NumberField label={`Fuel (${vehicle.fuelUnit})`} value={fuelAmount} onChange={setFuelAmount} placeholder="e.g. 5" />
          )}
          {conf.fields.includes("price") && (
            <NumberField label={`Price/${vehicle.fuelUnit} (${vehicle.currency})`} value={price} onChange={setPrice} placeholder="e.g. 140" />
          )}
          {conf.fields.includes("consumption") && (
            <NumberField label={`Consumption (${vehicle.distanceUnit}/${vehicle.fuelUnit})`} value={consumption} onChange={setConsumption} placeholder="e.g. 38" />
          )}
        </Card>

        {!result && (
          <Card className="border border-dashed border-border text-sm text-muted-foreground">
            Enter {missing.join(", ")} to see the result.
          </Card>
        )}

        {result && (
          <Card>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Result</div>
            <div className="grid grid-cols-2 gap-3">
              {result.cost !== undefined && (
                <div>
                  <div className="text-xs text-muted-foreground">Trip cost</div>
                  <div className="text-2xl font-bold text-primary">{fmtMoney(result.cost, vehicle.currency)}</div>
                </div>
              )}
              {result.fuel !== undefined && (
                <div>
                  <div className="text-xs text-muted-foreground">Required fuel</div>
                  <div className="text-2xl font-bold">{fmtNum(result.fuel, 2)} {vehicle.fuelUnit}</div>
                </div>
              )}
              {result.distance !== undefined && (
                <div>
                  <div className="text-xs text-muted-foreground">Distance</div>
                  <div className="text-2xl font-bold">{fmtNum(result.distance, 1)} {vehicle.distanceUnit}</div>
                </div>
              )}
              {result.consumption !== undefined && (
                <div>
                  <div className="text-xs text-muted-foreground">Consumption</div>
                  <div className="text-2xl font-bold">{fmtNum(result.consumption, 2)} {vehicle.distanceUnit}/{vehicle.fuelUnit}</div>
                </div>
              )}
              {result.costPerKm !== undefined && (
                <div>
                  <div className="text-xs text-muted-foreground">Cost / {vehicle.distanceUnit}</div>
                  <div className="text-2xl font-bold">{fmtMoney(result.costPerKm, vehicle.currency)}</div>
                </div>
              )}
              {result.rangeCost !== undefined && (
                <div>
                  <div className="text-xs text-muted-foreground">Fuel value</div>
                  <div className="text-2xl font-bold text-primary">{fmtMoney(result.rangeCost, vehicle.currency)}</div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </MobileShell>
  );
}

function positiveNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function missingFields(type: CalcType, numbers: {
  distance: number | null;
  fuel: number | null;
  price: number | null;
  consumption: number | null;
}) {
  if (type === "trip") {
    return [
      !numbers.distance && "distance",
      !numbers.consumption && "consumption",
      !numbers.price && "price",
    ].filter(Boolean) as string[];
  }
  if (type === "fuel") {
    return [
      !numbers.distance && "distance",
      !numbers.consumption && "consumption",
    ].filter(Boolean) as string[];
  }
  if (type === "distance") {
    return [
      !numbers.fuel && "fuel",
      !numbers.consumption && "consumption",
    ].filter(Boolean) as string[];
  }
  return [
    !numbers.distance && "distance",
    !numbers.fuel && "fuel",
  ].filter(Boolean) as string[];
}

function ModeButton({
  active,
  icon: Icon,
  label,
  sub,
  onClick,
}: {
  active: boolean;
  icon: any;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[88px] rounded-2xl border p-3 text-left shadow-card transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border/70 bg-card text-foreground"
      }`}
    >
      <Icon className={`h-5 w-5 ${active ? "" : "text-primary"}`} />
      <div className="mt-2 text-sm font-bold leading-tight">{label}</div>
      <div className={`text-xs ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {sub}
      </div>
    </button>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border border-input rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
