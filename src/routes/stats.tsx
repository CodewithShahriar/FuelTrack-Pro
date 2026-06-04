import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MobileShell, Card, Stat } from "@/components/MobileShell";
import { MileageValue } from "@/components/MileageValue";
import { useCosts, useFillUps, useSelectedVehicle } from "@/lib/storage";
import {
  costsForVehicle,
  distanceRows,
  fillUpsForVehicle,
  fmtMoney,
  fmtNum,
  inRange,
  ranges,
  totalDistance as getTotalDistance,
  withConsumption,
} from "@/lib/calc";
import { Fuel, LineChart as LineIcon, Route as RouteIcon, Wallet } from "lucide-react";

export const Route = createFileRoute("/stats")({
  head: () => ({ meta: [{ title: "Stats — FuelTrack Pro" }] }),
  component: StatsPage,
});

type Tab = "fillups" | "costs" | "distance";

function StatsPage() {
  const { vehicle } = useSelectedVehicle();
  const [fillups] = useFillUps();
  const [costs] = useCosts();
  const [tab, setTab] = useState<Tab>("fillups");
  const nav = useNavigate();

  const computed = useMemo(() => vehicle ? withConsumption(fillUpsForVehicle(fillups, vehicle.id)) : [], [fillups, vehicle]);
  const myCosts = useMemo(() => vehicle ? costsForVehicle(costs, vehicle.id) : [], [costs, vehicle]);

  if (!vehicle) return <MobileShell title="Stats" back={() => nav({ to: "/" })}><Card>No vehicle selected</Card></MobileShell>;

  return (
    <MobileShell
      title="Stats"
      back={() => nav({ to: "/" })}
      right={
        <Link to="/charts" className="p-2 rounded-full hover:bg-muted" aria-label="Charts">
          <LineIcon className="h-5 w-5" />
        </Link>
      }
    >
      <div className="grid grid-cols-3 gap-2 mb-4">
        <TabButton active={tab === "fillups"} icon={Fuel} label="Fill-ups" onClick={() => setTab("fillups")} />
        <TabButton active={tab === "costs"} icon={Wallet} label="Costs" onClick={() => setTab("costs")} />
        <TabButton active={tab === "distance"} icon={RouteIcon} label="Distance" onClick={() => setTab("distance")} />
      </div>

      {tab === "fillups" && <FillUpsStats computed={computed} vehicle={vehicle} />}
      {tab === "costs" && <CostsStats fillups={computed} costs={myCosts} vehicle={vehicle} />}
      {tab === "distance" && <DistanceStats computed={computed} vehicle={vehicle} />}
    </MobileShell>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[68px] rounded-2xl border px-2 py-3 text-center shadow-card transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border/70 bg-card text-foreground"
      }`}
    >
      <Icon className={`mx-auto h-5 w-5 ${active ? "" : "text-primary"}`} />
      <div className="mt-1 text-xs font-bold leading-tight">{label}</div>
    </button>
  );
}

function periodGrid(values: { label: string; value: string }[]) {
  return (
    <Card>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {values.map((v) => (
          <div key={v.label}>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{v.label}</div>
            <div className="text-base font-bold">{v.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FillUpsStats({ computed, vehicle }: any) {
  const r = ranges();
  const inP = (arr: any[], from: Date, to: Date) => arr.filter((f) => inRange(f.date, from, to));
  const cons = computed.map((c: any) => c.consumption).filter((x: any) => x);
  const litres = computed.map((c: any) => c.litres);
  return (
    <div className="space-y-4">
      <Card>
        <Stat label="Total fill-ups" value={computed.length} />
      </Card>
      {periodGrid([
        { label: "This month", value: String(inP(computed, ...r.thisMonth).length) },
        { label: "Prev month", value: String(inP(computed, ...r.prevMonth).length) },
        { label: "This year", value: String(inP(computed, ...r.thisYear).length) },
        { label: "Prev year", value: String(inP(computed, ...r.prevYear).length) },
      ])}
      <Card>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Total fuel" value={`${fmtNum(litres.reduce((a: number, b: number) => a + b, 0), 1)} ${vehicle.fuelUnit}`} />
          <Stat label="Min fill-up" value={`${fmtNum(litres.length ? Math.min(...litres) : 0, 2)}`} />
          <Stat label="Max fill-up" value={`${fmtNum(litres.length ? Math.max(...litres) : 0, 2)}`} />
        </div>
      </Card>
      <Card>
        <div className="grid grid-cols-3 gap-3">
          <Stat
            label="Avg cons."
            value={
              <MileageValue
                value={cons.length ? cons.reduce((a: number, b: number) => a + b, 0) / cons.length : null}
              />
            }
          />
          <Stat label="Best cons." value={<MileageValue value={cons.length ? Math.max(...cons) : null} />} />
          <Stat label="Worst cons." value={<MileageValue value={cons.length ? Math.min(...cons) : null} />} />
        </div>
      </Card>
    </div>
  );
}

function CostsStats({ fillups, costs, vehicle }: any) {
  const r = ranges();
  const all = [
    ...fillups.map((f: any) => ({ date: f.date, amount: f.totalCost })),
    ...costs.map((c: any) => ({ date: c.date, amount: c.amount })),
  ];
  const sum = (a: any[]) => a.reduce((acc, x) => acc + x.amount, 0);
  const inP = (from: Date, to: Date) => all.filter((x) => inRange(x.date, from, to));
  const bills = fillups.map((f: any) => f.totalCost);
  const prices = fillups.map((f: any) => f.pricePerLitre);
  const totalDistance = getTotalDistance(fillups, vehicle.initialOdo);
  const totalCost = sum(all);

  const firstDate = all.length ? Math.min(...all.map((x) => new Date(x.date).getTime())) : Date.now();
  const days = Math.max(1, (Date.now() - firstDate) / (1000 * 60 * 60 * 24));
  const months = Math.max(1, days / 30);

  return (
    <div className="space-y-4">
      <Card>
        <Stat label="Total cost" value={fmtMoney(totalCost, vehicle.currency)} />
      </Card>
      {periodGrid([
        { label: "This month", value: fmtMoney(sum(inP(...r.thisMonth)), vehicle.currency) },
        { label: "Prev month", value: fmtMoney(sum(inP(...r.prevMonth)), vehicle.currency) },
        { label: "This year", value: fmtMoney(sum(inP(...r.thisYear)), vehicle.currency) },
        { label: "Prev year", value: fmtMoney(sum(inP(...r.prevYear)), vehicle.currency) },
      ])}
      <Card>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Lowest bill" value={bills.length ? fmtMoney(Math.min(...bills), vehicle.currency) : "—"} />
          <Stat label="Highest bill" value={bills.length ? fmtMoney(Math.max(...bills), vehicle.currency) : "—"} />
          <Stat label="Best price" value={prices.length ? fmtMoney(Math.min(...prices), vehicle.currency) : "—"} />
          <Stat label="Worst price" value={prices.length ? fmtMoney(Math.max(...prices), vehicle.currency) : "—"} />
        </div>
      </Card>
      <Card>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Cost / km" value={totalDistance > 0 ? fmtMoney(totalCost / totalDistance, vehicle.currency) : "—"} />
          <Stat label="Cost / day" value={fmtMoney(totalCost / days, vehicle.currency)} />
          <Stat label="Cost / month" value={fmtMoney(totalCost / months, vehicle.currency)} />
        </div>
      </Card>
    </div>
  );
}

function DistanceStats({ computed, vehicle }: any) {
  const r = ranges();
  const distances = distanceRows(computed, vehicle.initialOdo).map((c: any) => ({ date: c.date, d: c.distance || 0 }));
  const inP = (from: Date, to: Date) =>
    distances.filter((x: any) => inRange(x.date, from, to)).reduce((a: number, b: any) => a + b.d, 0);
  const totalDistance = distances.reduce((a: number, b: any) => a + b.d, 0);
  const lastOdo = computed.length ? computed[computed.length - 1].odo : vehicle.initialOdo;
  const firstDate = computed.length ? new Date(computed[0].date).getTime() : Date.now();
  const days = Math.max(1, (Date.now() - firstDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Distance driven" value={`${fmtNum(totalDistance, 1)} ${vehicle.distanceUnit}`} />
          <Stat label="Last odo" value={`${fmtNum(lastOdo, 1)} ${vehicle.distanceUnit}`} />
        </div>
      </Card>
      {periodGrid([
        { label: "This month", value: `${fmtNum(inP(...r.thisMonth), 1)} ${vehicle.distanceUnit}` },
        { label: "Prev month", value: `${fmtNum(inP(...r.prevMonth), 1)} ${vehicle.distanceUnit}` },
        { label: "This year", value: `${fmtNum(inP(...r.thisYear), 1)} ${vehicle.distanceUnit}` },
        { label: "Prev year", value: `${fmtNum(inP(...r.prevYear), 1)} ${vehicle.distanceUnit}` },
      ])}
      <Card>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Avg / day" value={`${fmtNum(totalDistance / days, 2)} ${vehicle.distanceUnit}`} />
          <Stat label="Avg / month" value={`${fmtNum((totalDistance / days) * 30, 1)} ${vehicle.distanceUnit}`} />
        </div>
      </Card>
    </div>
  );
}
