import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell, Card } from "@/components/MobileShell";
import { useHydrated, useVehicles, useSelectedVehicleId } from "@/lib/storage";
import { Bike, Car, Truck, Plus, Trash2, Check } from "lucide-react";
import type { Vehicle, VehicleType } from "@/lib/types";

export const Route = createFileRoute("/more/vehicles")({
  head: () => ({ meta: [{ title: "Vehicles — FuelTrack Pro" }] }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const hydrated = useHydrated();
  const [vehicles, setVehicles] = useVehicles();
  const [selectedId, setSelectedId] = useSelectedVehicleId();
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  if (!hydrated) return <MobileShell title="Vehicles" back={() => nav({ to: "/more" })}><div /></MobileShell>;

  function save(v: Vehicle) {
    setVehicles((prev) => {
      const exists = prev.some((x) => x.id === v.id);
      return exists ? prev.map((x) => (x.id === v.id ? v : x)) : [...prev, v];
    });
    if (!vehicles.some((x) => x.id === v.id)) setSelectedId(v.id);
    setOpen(false);
    setEditing(null);
  }

  function del(id: string) {
    if (!confirm("Delete this vehicle?")) return;
    setVehicles((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <MobileShell
      title="Vehicles"
      back={() => nav({ to: "/more" })}
      right={
        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="rounded-full bg-primary text-primary-foreground p-2"
          aria-label="Add"
        >
          <Plus className="h-5 w-5" />
        </button>
      }
    >
      <div className="space-y-3">
        {vehicles.map((v) => {
          const Icon = v.type === "bike" ? Bike : v.type === "truck" ? Truck : Car;
          const selected = v.id === selectedId;
          return (
            <Card key={v.id} className="flex items-center gap-3">
              <button
                onClick={() => setSelectedId(v.id)}
                className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
                  selected ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"
                }`}
              >
                {selected ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </button>
              <button className="flex-1 text-left" onClick={() => { setEditing(v); setOpen(true); }}>
                <div className="font-semibold">{v.name}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {v.type} · Odo {v.initialOdo} {v.distanceUnit} · {v.currency}/{v.fuelUnit}
                </div>
              </button>
              <button onClick={() => del(v.id)} className="p-2 text-muted-foreground">
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          );
        })}
      </div>

      {open && (
        <VehicleSheet
          initial={editing}
          onClose={() => { setOpen(false); setEditing(null); }}
          onSave={save}
        />
      )}
    </MobileShell>
  );
}

function VehicleSheet({
  initial,
  onClose,
  onSave,
}: {
  initial: Vehicle | null;
  onClose: () => void;
  onSave: (v: Vehicle) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<VehicleType>(initial?.type ?? "car");
  const [odo, setOdo] = useState(String(initial?.initialOdo ?? 0));
  const [fuelUnit, setFuelUnit] = useState(initial?.fuelUnit ?? "L");
  const [distanceUnit, setDistanceUnit] = useState(initial?.distanceUnit ?? "km");
  const [currency, setCurrency] = useState(initial?.currency ?? "৳");

  const can = name.trim().length > 0;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <div className="w-full max-w-md mx-auto bg-background rounded-t-3xl p-4 pb-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{initial ? "Edit vehicle" : "New vehicle"}</h2>
        <div className="space-y-3">
          <F label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className={inp} /></F>
          <F label="Type">
            <div className="grid grid-cols-3 gap-2">
              {(["car", "bike", "truck"] as VehicleType[]).map((t) => (
                <button key={t} onClick={() => setType(t)} className={`py-2 rounded-xl text-sm font-medium capitalize ${type === t ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{t}</button>
              ))}
            </div>
          </F>
          <F label="Initial odometer"><input type="number" value={odo} onChange={(e) => setOdo(e.target.value)} className={inp} /></F>
          <div className="grid grid-cols-3 gap-2">
            <F label="Fuel unit"><input value={fuelUnit} onChange={(e) => setFuelUnit(e.target.value)} className={inp} /></F>
            <F label="Distance"><input value={distanceUnit} onChange={(e) => setDistanceUnit(e.target.value)} className={inp} /></F>
            <F label="Currency"><input value={currency} onChange={(e) => setCurrency(e.target.value)} className={inp} /></F>
          </div>
        </div>
        <button
          disabled={!can}
          onClick={() => onSave({
            id: initial?.id ?? `v_${Date.now()}`,
            name: name.trim(),
            type,
            initialOdo: parseFloat(odo) || 0,
            fuelUnit, distanceUnit, currency,
          })}
          className="mt-5 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  );
}

const inp = "w-full bg-card border border-input rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-ring";
function F({ label, children }: any) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      {children}
    </div>
  );
}
