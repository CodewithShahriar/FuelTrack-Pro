import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileShell, Card } from "@/components/MobileShell";
import {
  useFillUps,
  useHydrated,
  useSelectedVehicle,
  useStations,
} from "@/lib/storage";
import { Lock, Camera } from "lucide-react";

export const Route = createFileRoute("/fillups/add")({
  head: () => ({ meta: [{ title: "Add Fill-up — FuelTrack Pro" }] }),
  component: AddFillUpPage,
});

function AddFillUpPage() {
  const hydrated = useHydrated();
  const { vehicle, vehicles, setId } = useSelectedVehicle();
  const [fillups, setFillups] = useFillUps();
  const [stations] = useStations();
  const nav = useNavigate();

  const lastOdo = useMemo(() => {
    if (!vehicle) return 0;
    const mine = fillups.filter((f) => f.vehicleId === vehicle.id);
    if (!mine.length) return vehicle.initialOdo;
    return mine.reduce((acc, f) => Math.max(acc, f.odo), 0);
  }, [fillups, vehicle]);

  const [mode, setMode] = useState<"odo" | "trip">("odo");
  const [odo, setOdo] = useState("");
  const [trip, setTrip] = useState("");
  const [litres, setLitres] = useState("");
  const [fuelType, setFuelType] = useState("Octane");
  const [price, setPrice] = useState("");
  const [total, setTotal] = useState("");
  const [touchedTotal, setTouchedTotal] = useState(false);
  const now = new Date();
  const [date, setDate] = useState(now.toISOString().slice(0, 10));
  const [time, setTime] = useState(now.toTimeString().slice(0, 5));
  const [fullTank, setFullTank] = useState(true);
  const [tankLevel, setTankLevel] = useState(false);
  const [hasStation, setHasStation] = useState(true);
  const [stationId, setStationId] = useState(stations[0]?.id ?? "");
  const [favourite, setFavourite] = useState(false);
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(false);
  const [missed, setMissed] = useState(false);

  // auto-calc total
  useEffect(() => {
    if (!touchedTotal) {
      const l = parseFloat(litres);
      const p = parseFloat(price);
      if (!isNaN(l) && !isNaN(p)) setTotal((l * p).toFixed(2));
    }
  }, [litres, price, touchedTotal]);

  if (!hydrated || !vehicle) return <MobileShell title="Add fill-up" back={() => nav({ to: "/fillups" })}><div /></MobileShell>;

  const computedOdo =
    mode === "odo" ? parseFloat(odo) : lastOdo + (parseFloat(trip) || 0);
  const canSave =
    !isNaN(computedOdo) &&
    computedOdo > 0 &&
    parseFloat(litres) > 0 &&
    parseFloat(price) > 0 &&
    parseFloat(total) > 0;

  const consumption =
    lastOdo > 0 && computedOdo > lastOdo && parseFloat(litres) > 0
      ? (computedOdo - lastOdo) / parseFloat(litres)
      : null;

  const station = stations.find((s) => s.id === stationId);

  function save() {
    if (!canSave || !vehicle) return;
    const id = `f_${Date.now()}`;
    const dt = new Date(`${date}T${time}:00`).toISOString();
    setFillups((prev) => [
      ...prev,
      {
        id,
        vehicleId: vehicle.id,
        date: dt,
        odo: computedOdo,
        litres: parseFloat(litres),
        pricePerLitre: parseFloat(price),
        totalCost: parseFloat(total),
        fuelType,
        fullTank,
        tankLevel: tankLevel ? 50 : undefined,
        stationId: hasStation ? stationId : undefined,
        stationName: hasStation ? station?.name : undefined,
        notes: notes || undefined,
        discount,
        missedPrevious: missed,
      },
    ]);
    nav({ to: "/fillups" });
  }

  return (
    <MobileShell
      title="Add fill-up"
      back={() => nav({ to: "/fillups" })}
      right={
        <button
          onClick={save}
          disabled={!canSave}
          className="px-4 py-1.5 rounded-full font-semibold text-sm bg-primary text-primary-foreground disabled:opacity-40"
        >
          Save
        </button>
      }
    >
      <div className="space-y-4">
        <Card>
          <Label>Vehicle</Label>
          <select
            value={vehicle.id}
            onChange={(e) => setId(e.target.value)}
            className="w-full bg-transparent text-base font-semibold outline-none"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Card>

        <Card className="space-y-3">
          <div className="flex bg-muted rounded-xl p-1">
            <SegBtn active={mode === "odo"} onClick={() => setMode("odo")}>
              Odo counter
            </SegBtn>
            <SegBtn active={mode === "trip"} onClick={() => setMode("trip")}>
              Trip meter
            </SegBtn>
          </div>
          {mode === "odo" ? (
            <Field
              label={`Odo counter (last: ${lastOdo} ${vehicle.distanceUnit})`}
              value={odo}
              onChange={setOdo}
              type="number"
              placeholder={`${lastOdo}`}
              required
            />
          ) : (
            <Field
              label={`Trip meter (${vehicle.distanceUnit})`}
              value={trip}
              onChange={setTrip}
              type="number"
              placeholder="e.g. 250"
              required
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field
              label={`Litres (${vehicle.fuelUnit})`}
              value={litres}
              onChange={setLitres}
              type="number"
              required
            />
            <Field
              label="Fuel type"
              value={fuelType}
              onChange={setFuelType}
              isSelect
              options={["Octane", "Petrol", "Diesel", "CNG", "LPG"]}
            />
            <Field
              label={`Price/${vehicle.fuelUnit}`}
              value={price}
              onChange={setPrice}
              type="number"
              required
            />
            <Field
              label="Total cost"
              value={total}
              onChange={(v: string) => {
                setTouchedTotal(true);
                setTotal(v);
              }}
              type="number"
              required
            />
            <Field label="Date" value={date} onChange={setDate} type="date" />
            <Field label="Time" value={time} onChange={setTime} type="time" />
          </div>

          {consumption !== null && (
            <div className="text-xs text-primary font-medium">
              Estimated consumption: {consumption.toFixed(2)} {vehicle.distanceUnit}/{vehicle.fuelUnit}
            </div>
          )}
        </Card>

        <Card className="space-y-1">
          <Toggle label="Full tank" value={fullTank} onChange={setFullTank} />
          <Toggle label="Tank level info" value={tankLevel} onChange={setTankLevel} />
          <Toggle label="Petrol station" value={hasStation} onChange={setHasStation} />
          {hasStation && (
            <div className="pt-2">
              <Label>Selected petrol station</Label>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full bg-transparent border border-input rounded-xl px-3 py-2.5 text-sm font-medium"
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <Toggle label="Add to favourites" value={favourite} onChange={setFavourite} />
            </div>
          )}
        </Card>

        <Card className="opacity-70">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4" /> Weather
              </div>
              <div className="text-xs text-muted-foreground">Locked — Pro feature</div>
            </div>
            <span className="text-[10px] uppercase tracking-wider bg-primary-soft text-primary px-2 py-1 rounded-full font-semibold">
              Pro
            </span>
          </div>
        </Card>

        <Card>
          <Label>Pictures</Label>
          <button className="mt-2 w-full border-2 border-dashed border-border rounded-xl py-6 text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Camera className="h-5 w-5" />
            Add picture
          </button>
        </Card>

        <Card>
          <Label>Notes</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Anything to remember…"
            className="w-full bg-transparent outline-none text-sm mt-1 resize-none"
          />
        </Card>

        <Card className="space-y-1">
          <Toggle label="Discount applied" value={discount} onChange={setDiscount} />
          <Toggle
            label="Missed previous fill-up"
            value={missed}
            onChange={setMissed}
          />
        </Card>

        <button
          onClick={save}
          disabled={!canSave}
          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base disabled:opacity-40 shadow-soft"
        >
          Save fill-up
        </button>
      </div>
    </MobileShell>
  );
}

function Label({ children }: { children: any }) {
  return <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{children}</div>;
}

function SegBtn({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
        active ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  isSelect,
  options,
}: any) {
  return (
    <div>
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {isSelect ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border border-input rounded-xl px-3 py-2.5 text-sm font-medium"
        >
          {options.map((o: string) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          inputMode={type === "number" ? "decimal" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border border-input rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
        />
      )}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between py-2.5"
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
          value ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow-soft transition-transform ${
            value ? "translate-x-5" : ""
          }`}
        />
      </span>
    </button>
  );
}
