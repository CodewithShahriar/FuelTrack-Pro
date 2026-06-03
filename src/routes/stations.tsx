import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, Card } from "@/components/MobileShell";
import { useHydrated, useSelectedVehicle, useStations } from "@/lib/storage";
import { fmtMoney } from "@/lib/calc";
import { MapPin, Star, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/stations")({
  head: () => ({ meta: [{ title: "Petrol Stations — FuelTrack Pro" }] }),
  component: StationsPage,
});

function StationsPage() {
  const hydrated = useHydrated();
  const { vehicle } = useSelectedVehicle();
  const [stations, setStations] = useStations();
  const [q, setQ] = useState("");

  if (!hydrated || !vehicle) return <MobileShell title="Stations"><div /></MobileShell>;

  const list = stations
    .filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <MobileShell title="Petrol stations" subtitle="Nearby">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stations"
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-card border border-input text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-3">
          {list.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold truncate">{s.name}</div>
                    <button
                      onClick={() =>
                        setStations((prev) =>
                          prev.map((x) =>
                            x.id === s.id ? { ...x, favourite: !x.favourite } : x,
                          ),
                        )
                      }
                      aria-label="Favourite"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          s.favourite ? "fill-warning text-warning" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.distanceKm} km away · Latest{" "}
                    <span className="text-primary font-semibold">
                      {fmtMoney(s.latestPrice, vehicle.currency)}/L
                    </span>
                  </div>
                  {s.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {s.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-primary-soft text-primary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
