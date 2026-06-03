import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell, Card } from "@/components/MobileShell";
import { useHydrated, useSelectedVehicle } from "@/lib/storage";
import { fmtMoney, fmtNum } from "@/lib/calc";

export const Route = createFileRoute("/more/calculator")({
  head: () => ({ meta: [{ title: "Calculator — FuelTrack Pro" }] }),
  component: CalculatorPage,
});

type CalcType = "trip" | "distance" | "consumption" | "fuel";

function CalculatorPage() {
  const hydrated = useHydrated();
  const { vehicle, vehicles, setId } = useSelectedVehicle();
  const nav = useNavigate();
  const [type, setType] = useState<CalcType>("trip");
  const [distance, setDistance] = useState("");
  const [price, setPrice] = useState("");
  const [consumption, setConsumption] = useState("");
  const [result, setResult] = useState<null | { cost?: number; fuel?: number; distance?: number; consumption?: number }>(null);

  if (!hydrated || !vehicle) return <MobileShell title="Calculator" back={() => nav({ to: "/more" })}><div /></MobileShell>;

  function calc() {
    const d = parseFloat(distance);
    const p = parseFloat(price);
    const c = parseFloat(consumption);
    if (type === "trip") {
      if (!d || !p || !c) return;
      const fuel = d / c;
      setResult({ fuel, cost: fuel * p });
    } else if (type === "distance") {
      // distance = fuel * consumption -> need fuel (litres) typed in `distance` field actually:
      // simpler: distance = litres * consumption, ask for litres reusing distance field as litres
      if (!d || !c) return;
      setResult({ distance: d * c });
    } else if (type === "consumption") {
      if (!d) return;
      const litres = parseFloat(price); // reuse price field as litres
      if (!litres) return;
      setResult({ consumption: d / litres });
    } else {
      if (!d || !c) return;
      const fuel = d / c;
      setResult({ fuel, cost: parseFloat(price) ? fuel * parseFloat(price) : undefined });
    }
  }

  const conf = {
    trip: { fields: ["distance", "price", "consumption"], desc: "Estimate trip cost" },
    distance: { fields: ["fuel", "consumption"], desc: "How far can you go" },
    consumption: { fields: ["distance", "fuel"], desc: "Calculate consumption" },
    fuel: { fields: ["distance", "consumption", "price"], desc: "Fuel needed for trip" },
  }[type];

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
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Calculator type</div>
          <select value={type} onChange={(e) => { setType(e.target.value as CalcType); setResult(null); }} className="w-full bg-transparent font-semibold outline-none">
            <option value="trip">Trip cost</option>
            <option value="distance">Distance</option>
            <option value="consumption">Consumption</option>
            <option value="fuel">Required fuel</option>
          </select>
          <div className="text-xs text-muted-foreground mt-1">{conf.desc}</div>
        </Card>

        <Card className="space-y-3">
          {conf.fields.includes("distance") && (
            <NumberField label={`Distance (${vehicle.distanceUnit})`} value={distance} onChange={setDistance} />
          )}
          {conf.fields.includes("fuel") && (
            <NumberField label={`Fuel (${vehicle.fuelUnit})`} value={type === "consumption" ? price : distance} onChange={type === "consumption" ? setPrice : setDistance} />
          )}
          {conf.fields.includes("price") && (
            <NumberField label={`Price/${vehicle.fuelUnit} (${vehicle.currency})`} value={price} onChange={setPrice} />
          )}
          {conf.fields.includes("consumption") && (
            <NumberField label={`Consumption (${vehicle.distanceUnit}/${vehicle.fuelUnit})`} value={consumption} onChange={setConsumption} />
          )}
        </Card>

        <button onClick={calc} className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold">
          Calculate
        </button>

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
            </div>
          </Card>
        )}
      </div>
    </MobileShell>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-input rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
