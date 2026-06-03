import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { MobileShell, Card, Stat } from "@/components/MobileShell";
import { MileageValue } from "@/components/MileageValue";
import { useFillUps, useSelectedVehicle, useStations } from "@/lib/storage";
import {
  fillUpsForVehicle,
  withConsumption,
  fmtMoney,
  fmtNum,
} from "@/lib/calc";
import {
  BarChart3,
  LineChart,
  MapPin,
  Plus,
  ChevronRight,
  Fuel,
  Gauge,
  TrendingUp,
  Car,
  Bike,
  Truck,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FuelTrack Pro — Mileage & Fuel Tracker" },
      { name: "description", content: "Track fuel, mileage, costs, and maintenance for your vehicles. Mobile-first vehicle tracker." },
      { property: "og:title", content: "FuelTrack Pro" },
      { property: "og:description", content: "Track fuel, mileage, costs, and maintenance for your vehicles." },
    ],
  }),
  component: Home,
});

function vehicleIcon(type: string) {
  if (type === "bike") return Bike;
  if (type === "truck") return Truck;
  return Car;
}

function Home() {
  const { vehicle } = useSelectedVehicle();
  const [allFillUps] = useFillUps();
  const [stations] = useStations();

  const computed = useMemo(() => {
    if (!vehicle) return [];
    return withConsumption(fillUpsForVehicle(allFillUps, vehicle.id));
  }, [allFillUps, vehicle]);

  if (!vehicle) {
    return (
      <MobileShell title="FuelTrack">
        <Card>
          <div className="font-semibold">No vehicle selected</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a vehicle to start tracking fuel, costs, and mileage.
          </p>
        </Card>
      </MobileShell>
    );
  }

  const last = computed[computed.length - 1];
  const consumptions = computed.map((c) => c.consumption).filter((x): x is number => !!x);
  const avgConsumption = consumptions.length
    ? consumptions.reduce((a, b) => a + b, 0) / consumptions.length
    : null;

  const VIcon = vehicleIcon(vehicle.type);
  const nearby = stations.slice(0, 2);

  return (
    <MobileShell
      title="FuelTrack"
      subtitle="Pro"
      right={
        <Link
          to="/fillups/add"
          className="rounded-full bg-primary text-primary-foreground p-2 shadow-soft"
          aria-label="Add fill-up"
        >
          <Plus className="h-5 w-5" />
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Vehicle selector */}
        <Link to="/more/vehicles">
          <Card className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
              <VIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Vehicle</div>
              <div className="font-semibold text-base truncate">{vehicle.name}</div>
              <div className="text-xs text-muted-foreground">
                Odo {fmtNum(last?.odo ?? vehicle.initialOdo, 1)} {vehicle.distanceUnit}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Card>
        </Link>

        {/* Nearby stations preview */}
        <Link to="/stations">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <div className="font-semibold">Nearby petrol stations</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {nearby.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.distanceKm} km away</div>
                  </div>
                  <div className="text-primary font-semibold">{fmtMoney(s.latestPrice, vehicle.currency)}/L</div>
                </div>
              ))}
            </div>
          </Card>
        </Link>

        {/* Fuel summary */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Fuel className="h-4 w-4 text-primary" />
            <div className="font-semibold">Fuel summary</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat
              label="Avg cons."
              value={<MileageValue value={avgConsumption} />}
            />
            <Stat
              label="Last cons."
              value={<MileageValue value={last?.consumption ?? null} />}
            />
            <Stat
              label="Last price"
              value={fmtMoney(last?.pricePerLitre ?? 0, vehicle.currency)}
              sub={`/${vehicle.fuelUnit}`}
            />
          </div>
        </Card>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3">
          <QuickLink to="/stats" icon={BarChart3} label="Stats" />
          <QuickLink to="/charts" icon={LineChart} label="Charts" />
          <QuickLink to="/fillups" icon={Fuel} label="Fill-ups" />
        </div>

        {/* Trends */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Trends</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <div className="text-xs text-muted-foreground">Consumption</div>
              <div className="mt-1">
                <MileageValue value={avgConsumption} className="text-xl" />
              </div>
              <div className="text-[11px] text-muted-foreground">average</div>
              <Sparkline values={consumptions} />
            </Card>
            <Card>
              <div className="text-xs text-muted-foreground">Last odo</div>
              <div className="text-xl font-bold mt-1">{fmtNum(last?.odo ?? 0, 1)}</div>
              <div className="text-[11px] text-muted-foreground">{vehicle.distanceUnit}</div>
              <Sparkline values={computed.map((c) => c.odo)} />
            </Card>
            <Card>
              <div className="text-xs text-muted-foreground">Last fill</div>
              <div className="text-xl font-bold mt-1">{fmtNum(last?.litres ?? 0, 1)}</div>
              <div className="text-[11px] text-muted-foreground">{vehicle.fuelUnit}</div>
              <Sparkline values={computed.map((c) => c.litres)} />
            </Card>
            <Card>
              <div className="text-xs text-muted-foreground">Last cost</div>
              <div className="text-xl font-bold mt-1">
                {fmtMoney(last?.totalCost ?? 0, vehicle.currency)}
              </div>
              <div className="text-[11px] text-muted-foreground">total</div>
              <Sparkline values={computed.map((c) => c.totalCost)} />
            </Card>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: any;
  label: string;
}) {
  return (
    <Link to={to as any}>
      <Card className="flex flex-col items-center justify-center gap-2 py-4">
        <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-sm font-medium">{label}</div>
      </Card>
    </Link>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (!values.length) return <div className="h-8" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * 100;
      const y = 30 - ((v - min) / range) * 28;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" className="mt-2 w-full h-8">
      <polyline
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
