import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, Card } from "@/components/MobileShell";
import {
  Calculator,
  Car,
  Droplet,
  Settings as SettingsIcon,
  Upload,
  Download,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { exportAll, importAll, resetAll } from "@/lib/storage";
import { useRef } from "react";

export const Route = createFileRoute("/more")({
  head: () => ({ meta: [{ title: "More — FuelTrack Pro" }] }),
  component: MorePage,
});

function MorePage() {
  const fileRef = useRef<HTMLInputElement>(null);

  function doExport() {
    const blob = new Blob([exportAll()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fueltrack-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function doImport(file: File) {
    const r = new FileReader();
    r.onload = () => {
      try {
        importAll(String(r.result));
        alert("Import successful");
      } catch {
        alert("Invalid file");
      }
    };
    r.readAsText(file);
  }

  return (
    <MobileShell title="More">
      <div className="space-y-3">
        <Section>
          <Row to="/more/calculator" icon={Calculator} label="Calculator" />
          <Row to="/more/vehicles" icon={Car} label="Vehicles" />
          <Row to="/more/fueltypes" icon={Droplet} label="Fuel types" />
          <Row to="/stats" icon={SettingsIcon} label="Stats & Charts" />
        </Section>

        <Section>
          <Row onClick={doExport} icon={Download} label="Export data" />
          <Row onClick={() => fileRef.current?.click()} icon={Upload} label="Import data" />
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
              e.target.value = "";
            }}
          />
          <Row
            onClick={() => {
              if (confirm("Reset to demo data?")) resetAll();
            }}
            icon={SettingsIcon}
            label="Reset to demo data"
          />
        </Section>

        <Card className="bg-primary-soft border border-primary/10">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold text-primary">Backup notice</div>
              <div className="text-xs text-foreground/80 mt-0.5">
                Your data is stored on this device only. Export regularly to keep
                a backup.
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6" />
            <div className="flex-1">
              <div className="font-bold">FuelTrack Pro</div>
              <div className="text-xs opacity-90">
                Weather logs, cloud sync, and more
              </div>
            </div>
            <button className="bg-card text-primary font-semibold px-3 py-1.5 rounded-full text-sm">
              Upgrade
            </button>
          </div>
        </Card>
      </div>
    </MobileShell>
  );
}

function Section({ children }: { children: any }) {
  return <Card className="!p-1 divide-y divide-border">{children}</Card>;
}

function Row({
  to,
  onClick,
  icon: Icon,
  label,
}: {
  to?: string;
  onClick?: () => void;
  icon: any;
  label: string;
}) {
  const inner = (
    <div className="flex items-center gap-3 px-3 py-3">
      <div className="h-9 w-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 font-medium text-sm">{label}</div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
  if (to) return <Link to={to as any}>{inner}</Link>;
  return (
    <button onClick={onClick} className="w-full text-left">
      {inner}
    </button>
  );
}
