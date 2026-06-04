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

function CalculatorPage() {
  const { vehicle, vehicles, setId } = useSelectedVehicle();
  const [fillups] = useFillUps();
  const nav = useNavigate();
  const [type, setType] = useState<CalcType>("trip");
  const [distance, setDistance] = useState("");
  const [fuelAmount, setFuelAmount] = useState("");
  const [price, setPrice] = useState("");
  const [consumption, setConsumption] = useState("");
  const [result, setResult] = useState<null | { cost?: number; fuel?: number; distance?: number; consumption?: number }>(null);

  const defaults = useMemo(() => {
    if (!vehicle) return { consumption: "", price: "" };
    const mine = withConsumption(fillUpsForVehicle(fillups, vehicle.id));
    const last = mine[mine.length - 1];
    const values = mine.map((f) => f.consumption).filter((v): v is number => !!v);
    const avg = values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null;
    return {
      consumption: avg ? avg.toFixed(2) : "",
      price: last?.pricePerLitre ? String(last.pricePerLitre) : "",
    };
  }, [fillups, vehicle]);

  useEffect(() => {
    setConsumption(defaults.consumption);
    setPrice(defaults.price);
    setResult(null);
  }, [defaults.consumption, defaults.price, vehicle?.id]);

  function calc() {
    const d = parseFloat(distance);
    const fuelInput = parseFloat(fuelAmount);
    const p = parseFloat(price);
    const c = parseFloat(consumption);
    if (type === "trip") {
      if (d <= 0 || p <= 0 || c <= 0) return setResult(null);
      const fuel = d / c;
      setResult({ fuel, cost: fuel * p });
    } else if (type === "distance") {
      if (fuelInput <= 0 || c <= 0) return setResult(null);
      setResult({ distance: fuelInput * c });
    } else if (type === "consumption") {
      if (d <= 0 || fuelInput <= 0) return setResult(null);
      setResult({ consumption: d / fuelInput });
    } else {
      if (d <= 0 || c <= 0) return setResult(null);
      const fuel = d / c;
      setResult({ fuel, cost: p ? fuel * p : undefined });
    }
  }

  useEffect(() => {
    calc();
  }, [distance, fuelAmount, price, consumption, type]);

  if (!vehicle) return <MobileShell title="Calculator" back={() => nav({ to: "/more" })}><Card>No vehicle selected</Card></MobileShell>;

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

        <div className="grid grid-cols-2 gap-2">
          <ModeButton
            active={type === "trip"}
            icon={Calculator}
            label="Trip cost"
            sub="Fuel + money"
            onClick={() => {
              setType("trip");
              setResult(null);
            }}
          />
          <ModeButton
            active={type === "fuel"}
            icon={Fuel}
            label="Required fuel"
            sub="Litres needed"
            onClick={() => {
              setType("fuel");
              setResult(null);
            }}
          />
          <ModeButton
            active={type === "distance"}
            icon={RouteIcon}
            label="Distance"
            sub="Range from fuel"
            onClick={() => {
              setType("distance");
              setResult(null);
            }}
          />
          <ModeButton
            active={type === "consumption"}
            icon={Gauge}
            label="Consumption"
            sub="km per litre"
            onClick={() => {
              setType("consumption");
              setResult(null);
            }}
          />
        </div>

        <Card className="space-y-3">
          {conf.fields.includes("distance") && (
            <NumberField label={`Distance (${vehicle.distanceUnit})`} value={distance} onChange={setDistance} />
          )}
          {conf.fields.includes("fuel") && (
            <NumberField label={`Fuel (${vehicle.fuelUnit})`} value={fuelAmount} onChange={setFuelAmount} />
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
