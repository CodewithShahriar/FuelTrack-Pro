import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface Props {
  title?: ReactNode;
  right?: ReactNode;
  back?: () => void;
  children: ReactNode;
  hideNav?: boolean;
  subtitle?: ReactNode;
}

import { ChevronLeft } from "lucide-react";

export function MobileShell({ title, right, back, children, hideNav, subtitle }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen flex flex-col">
        {(title || back || right) && (
          <header className="sticky top-0 z-30 bg-background/90 backdrop-blur px-4 pt-[env(safe-area-inset-top)] pt-3 pb-3">
            <div className="flex items-center justify-between gap-3 min-h-[44px]">
              <div className="flex items-center gap-2 min-w-0">
                {back && (
                  <button
                    onClick={back}
                    aria-label="Back"
                    className="-ml-2 p-2 rounded-full hover:bg-muted text-foreground"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}
                <div className="min-w-0">
                  {title && (
                    <h1 className="text-[22px] font-bold tracking-tight truncate">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                  )}
                </div>
              </div>
              {right && <div className="flex items-center gap-1">{right}</div>}
            </div>
          </header>
        )}
        <main className={`flex-1 px-4 pb-28 ${title ? "" : "pt-4"}`}>{children}</main>
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-2xl shadow-card p-4 ${onClick ? "cursor-pointer active:scale-[0.99] transition-transform" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
