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
  Calculator,
  BarChart3,
  LineChart,
  MapPin,
  Plus,
  ChevronRight,
  Fuel,
  Wrench,
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
        <Link to="/more/vehicles">
          <Card className="flex items-center gap-3 border border-border/70">
            <div className="h-12 w-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
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

        <div className="grid grid-cols-2 gap-3">
          <Link to="/fillups/add" className="rounded-2xl bg-primary p-4 text-primary-foreground shadow-card active:scale-[0.99] transition-transform">
            <Plus className="h-6 w-6" />
            <div className="mt-3 text-base font-bold">Add fill-up</div>
            <div className="text-xs opacity-85">Log fuel now</div>
          </Link>
          <Link to="/more/calculator" className="rounded-2xl bg-card p-4 text-foreground shadow-card border border-border/70 active:scale-[0.99] transition-transform">
            <Calculator className="h-6 w-6 text-primary" />
            <div className="mt-3 text-base font-bold">Trip calculator</div>
            <div className="text-xs text-muted-foreground">Cost and fuel</div>
          </Link>
        </div>

        <Card className="border border-border/70">
          <div className="flex items-center gap-2 mb-3">
            <Fuel className="h-4 w-4 text-primary" />
            <div className="font-semibold">Fuel summary</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Avg cons." value={<MileageValue value={avgConsumption} />} />
            <Stat label="Last cons." value={<MileageValue value={last?.consumption ?? null} />} />
            <Stat label="Last price" value={fmtMoney(last?.pricePerLitre ?? 0, vehicle.currency)} sub={`/${vehicle.fuelUnit}`} />
          </div>
        </Card>

        <div className="grid grid-cols-4 gap-2">
          <QuickLink to="/stats" icon={BarChart3} label="Stats" />
          <QuickLink to="/costs" icon={Wrench} label="Costs" />
          <QuickLink to="/fillups" icon={Fuel} label="Logs" />
          <QuickLink to="/charts" icon={LineChart} label="Charts" />
        </div>

        <Link to="/stations">
          <Card className="border border-border/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <div className="font-semibold truncate">Petrol stations</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
            <div className="mt-3 space-y-2">
              {nearby.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.distanceKm} km away</div>
                  </div>
                  <div className="text-primary font-semibold shrink-0">{fmtMoney(s.latestPrice, vehicle.currency)}/L</div>
                </div>
              ))}
            </div>
          </Card>
        </Link>

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
      <div className="flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-2xl bg-card px-2 py-3 text-center shadow-card border border-border/70 active:scale-[0.99] transition-transform">
        <div className="h-9 w-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-xs font-semibold leading-tight">{label}</div>
      </div>
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
