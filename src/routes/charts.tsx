import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { MobileShell, Card } from "@/components/MobileShell";
import { useFillUps, useSelectedVehicle } from "@/lib/storage";
import { fillUpsForVehicle, withConsumption } from "@/lib/calc";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/charts")({
  head: () => ({ meta: [{ title: "Charts — FuelTrack Pro" }] }),
  component: ChartsPage,
});

function ChartsPage() {
  const { vehicle } = useSelectedVehicle();
  const [fillups] = useFillUps();
  const nav = useNavigate();

  const data = useMemo(() => {
    if (!vehicle) return [];
    return withConsumption(fillUpsForVehicle(fillups, vehicle.id)).map((f) => ({
      date: new Date(f.date).toLocaleDateString(undefined, { month: "short", day: "2-digit" }),
      consumption: f.consumption ?? null,
      cost: f.totalCost,
      distance: f.distance ?? 0,
    }));
  }, [fillups, vehicle]);

  const monthly = useMemo(() => {
    const m = new Map<string, { cost: number; count: number }>();
    if (!vehicle) return [];
    for (const f of fillUpsForVehicle(fillups, vehicle.id)) {
      const d = new Date(f.date);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!m.has(k)) m.set(k, { cost: 0, count: 0 });
      const e = m.get(k)!;
      e.cost += f.totalCost;
      e.count += 1;
    }
    return Array.from(m.entries()).map(([k, v]) => ({ month: k.slice(5), ...v }));
  }, [fillups, vehicle]);

  if (!vehicle) return <MobileShell title="Charts" back={() => nav({ to: "/" })}><Card>No vehicle selected</Card></MobileShell>;

  return (
    <MobileShell title="Charts" back={() => nav({ to: "/" })}>
      <div className="space-y-4">
        <ChartCard title="Fuel consumption trend" sub={`${vehicle.distanceUnit}/${vehicle.fuelUnit}`}>
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={28} />
            <Tooltip />
            <Line type="monotone" dataKey="consumption" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Monthly cost trend" sub={vehicle.currency}>
          <BarChart data={monthly}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={32} />
            <Tooltip />
            <Bar dataKey="cost" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Distance per fill-up" sub={vehicle.distanceUnit}>
          <AreaChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={32} />
            <Tooltip />
            <Area type="monotone" dataKey="distance" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Fill-up frequency" sub="per month">
          <BarChart data={monthly}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={28} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>
    </MobileShell>
  );
}

function ChartCard({ title, sub, children }: any) {
  return (
    <Card>
      <div className="flex items-baseline justify-between mb-2">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </Card>
  );
}
