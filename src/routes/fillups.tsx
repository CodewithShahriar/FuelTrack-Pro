import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { MobileShell, Card } from "@/components/MobileShell";
import { MileageValue } from "@/components/MileageValue";
import {
  useFillUps,
  useSelectedVehicle,
} from "@/lib/storage";
import {
  fillUpsForVehicle,
  withConsumption,
  groupByMonth,
  fmtMoney,
  fmtNum,
  fmtMonth,
} from "@/lib/calc";
import { Plus, Search, Camera, MapPin, X } from "lucide-react";

export const Route = createFileRoute("/fillups")({
  head: () => ({
    meta: [
      { title: "Fill-ups — FuelTrack Pro" },
      { name: "description", content: "View and manage all fuel fill-up entries for your vehicles." },
    ],
  }),
  component: FillUpsPage,
});

function FillUpsPage() {
  const { vehicle } = useSelectedVehicle();
  const [all] = useFillUps();
  const [q, setQ] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const nav = useNavigate();

  const computed = useMemo(() => {
    if (!vehicle) return [];
    const list = withConsumption(fillUpsForVehicle(all, vehicle.id));
    const filtered = q
      ? list.filter(
          (f) =>
            (f.stationName ?? "").toLowerCase().includes(q.toLowerCase()) ||
            (f.notes ?? "").toLowerCase().includes(q.toLowerCase()),
        )
      : list;
    return filtered;
  }, [all, vehicle, q]);

  if (!vehicle) return <MobileShell title="Fill-ups"><Card>No vehicle selected</Card></MobileShell>;

  const groups = groupByMonth(computed);

  return (
    <MobileShell
      title="Fill-ups"
      right={
        <>
          <button
            onClick={() => setShowSearch((s) => !s)}
            className="p-2 rounded-full hover:bg-muted"
            aria-label="Search"
          >
            {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
          <button
            onClick={() => nav({ to: "/fillups/add" })}
            className="rounded-full bg-primary text-primary-foreground p-2"
            aria-label="Add fill-up"
          >
            <Plus className="h-5 w-5" />
          </button>
        </>
      }
    >
      {showSearch && (
        <div className="mb-3">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search station or notes"
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {computed.length === 0 ? (
        <Card className="text-center text-muted-foreground py-10">
          <div>No fill-ups yet</div>
          <Link
            to="/fillups/add"
            className="inline-block mt-3 text-primary font-medium"
          >
            Add your first fill-up
          </Link>
        </Card>
      ) : (
        <div className="space-y-5">
          {Array.from(groups.entries()).map(([key, items]) => (
            <div key={key}>
              <div className="text-xs uppercase tracking-wider text-muted-foreground px-1 mb-2">
                {fmtMonth(key)}
              </div>
              <div className="space-y-3">
                {items.map((f) => (
                  <Card key={f.id}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">
                          {new Date(f.date).toLocaleDateString(undefined, {
                            day: "2-digit",
                            month: "short",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {f.stationName ?? "Unknown station"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {fmtMoney(f.totalCost, vehicle.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {fmtNum(f.litres, 2)} {vehicle.fuelUnit} · {fmtMoney(f.pricePerLitre, vehicle.currency)}/L
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-border">
                      <Mini label="Odo" value={fmtNum(f.odo, 1)} />
                      <Mini label="Dist" value={f.distance ? fmtNum(f.distance, 1) : "—"} />
                      <Mini
                        label="Cons"
                        value={<MileageValue value={f.consumption} digits={1} />}
                      />
                      <Mini
                        label="₹/km"
                        value={
                          f.distance && f.distance > 0
                            ? fmtNum(f.totalCost / f.distance, 2)
                            : "—"
                        }
                      />
                    </div>
                    {!!f.pictures && (
                      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                        <Camera className="h-3 w-3" /> {f.pictures} picture
                        {f.pictures > 1 ? "s" : ""}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </MobileShell>
  );
}

function Mini({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
