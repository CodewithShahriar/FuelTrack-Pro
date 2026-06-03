import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell, Card } from "@/components/MobileShell";
import { useCosts, useHydrated, useSelectedVehicle } from "@/lib/storage";
import {
  costsForVehicle,
  fmtMoney,
  inRange,
  ranges,
} from "@/lib/calc";
import {
  Plus,
  Wrench,
  Shield,
  Car,
  Truck,
  Sparkles,
  ParkingCircle,
  Receipt,
  Hammer,
  X,
} from "lucide-react";
import type { CostType } from "@/lib/types";

export const Route = createFileRoute("/costs")({
  head: () => ({ meta: [{ title: "Costs & Maintenance — FuelTrack Pro" }] }),
  component: CostsPage,
});

const TYPES: { key: CostType; label: string; icon: any }[] = [
  { key: "service", label: "Service", icon: Wrench },
  { key: "repair", label: "Repair", icon: Hammer },
  { key: "insurance", label: "Insurance", icon: Shield },
  { key: "parking", label: "Parking", icon: ParkingCircle },
  { key: "toll", label: "Toll", icon: Receipt },
  { key: "wash", label: "Wash", icon: Sparkles },
  { key: "other", label: "Other", icon: Car },
];

function CostsPage() {
  const hydrated = useHydrated();
  const { vehicle } = useSelectedVehicle();
  const [allCosts, setCosts] = useCosts();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  if (!hydrated || !vehicle) return <MobileShell title="Costs"><div /></MobileShell>;

  const list = costsForVehicle(allCosts, vehicle.id);
  const r = ranges();
  const sum = (a: typeof list) => a.reduce((acc, c) => acc + c.amount, 0);
  const monthTotal = sum(list.filter((c) => inRange(c.date, r.thisMonth[0], r.thisMonth[1])));
  const yearTotal = sum(list.filter((c) => inRange(c.date, r.thisYear[0], r.thisYear[1])));

  return (
    <MobileShell
      title="Costs"
      right={
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-primary text-primary-foreground p-2"
          aria-label="Add cost"
        >
          <Plus className="h-5 w-5" />
        </button>
      }
    >
      <div className="space-y-4">
        <Card>
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="pr-3">
              <div className="text-xs text-muted-foreground">This month</div>
              <div className="text-xl font-bold">{fmtMoney(monthTotal, vehicle.currency)}</div>
            </div>
            <div className="pl-3">
              <div className="text-xs text-muted-foreground">This year</div>
              <div className="text-xl font-bold">{fmtMoney(yearTotal, vehicle.currency)}</div>
            </div>
          </div>
        </Card>

        {list.length === 0 ? (
          <Card className="text-center text-muted-foreground py-10">No expenses yet</Card>
        ) : (
          <div className="space-y-3">
            {list.map((c) => {
              const t = TYPES.find((x) => x.key === c.type)!;
              const Icon = t.icon;
              return (
                <Card key={c.id} className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{t.label}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {new Date(c.date).toLocaleDateString()}
                      {c.odo ? ` · ${c.odo} ${vehicle.distanceUnit}` : ""}
                      {c.note ? ` · ${c.note}` : ""}
                    </div>
                  </div>
                  <div className="font-bold text-primary">
                    {fmtMoney(c.amount, vehicle.currency)}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {open && (
        <AddCostSheet
          onClose={() => setOpen(false)}
          onSave={(c) => {
            setCosts((prev) => [
              ...prev,
              { ...c, id: `c_${Date.now()}`, vehicleId: vehicle.id },
            ]);
            setOpen(false);
          }}
          currency={vehicle.currency}
        />
      )}
    </MobileShell>
  );
}

function AddCostSheet({
  onClose,
  onSave,
  currency,
}: {
  onClose: () => void;
  onSave: (c: any) => void;
  currency: string;
}) {
  const [type, setType] = useState<CostType>("service");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [odo, setOdo] = useState("");
  const [note, setNote] = useState("");
  const can = parseFloat(amount) > 0;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto bg-background rounded-t-3xl p-4 pb-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Add expense</h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {TYPES.map((t) => {
            const Icon = t.icon;
            const active = type === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          <Input label={`Amount (${currency})`} value={amount} onChange={setAmount} type="number" />
          <Input label="Date" value={date} onChange={setDate} type="date" />
          <Input label="Odometer" value={odo} onChange={setOdo} type="number" />
          <Input label="Note" value={note} onChange={setNote} />
        </div>
        <button
          disabled={!can}
          onClick={() =>
            onSave({
              type,
              amount: parseFloat(amount),
              date: new Date(date).toISOString(),
              odo: odo ? parseFloat(odo) : undefined,
              note: note || undefined,
            })
          }
          className="mt-5 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-40"
        >
          Save expense
        </button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-card border border-input rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
