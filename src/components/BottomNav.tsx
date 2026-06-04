import { Link, useLocation } from "@tanstack/react-router";
import { Home, Fuel, Wrench, PlusCircle, MoreHorizontal } from "lucide-react";

type Tab = { to: string; label: string; icon: typeof Home; exact?: boolean };
const tabs: Tab[] = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/fillups", label: "Fill-ups", icon: Fuel },
  { to: "/fillups/add", label: "Add", icon: PlusCircle },
  { to: "/costs", label: "Costs", icon: Wrench },
  { to: "/more", label: "More", icon: MoreHorizontal },
];

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {tabs.map((t) => {
          const active = t.exact
            ? loc.pathname === t.to
            : loc.pathname === t.to || loc.pathname.startsWith(t.to + "/");
          const Icon = t.icon;
          return (
            <li key={t.to} className="flex-1">
              <Link
                to={t.to as any}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
