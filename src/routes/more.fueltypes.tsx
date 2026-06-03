import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell, Card } from "@/components/MobileShell";
import { Droplet } from "lucide-react";

export const Route = createFileRoute("/more/fueltypes")({
  head: () => ({ meta: [{ title: "Fuel types — FuelTrack Pro" }] }),
  component: () => {
    const nav = useNavigate();
    const types = ["Octane", "Petrol", "Diesel", "CNG", "LPG"];
    return (
      <MobileShell title="Fuel types" back={() => nav({ to: "/more" })}>
        <Card className="divide-y divide-border !p-0">
          {types.map((t) => (
            <div key={t} className="flex items-center gap-3 px-4 py-3">
              <div className="h-9 w-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                <Droplet className="h-4 w-4" />
              </div>
              <div className="font-medium">{t}</div>
            </div>
          ))}
        </Card>
      </MobileShell>
    );
  },
});
