import { fmtNum } from "@/lib/calc";

type Props = {
  value: number | null | undefined;
  digits?: number;
  className?: string;
  unit?: string;
};

export function MileageValue({ value, digits = 2, className = "", unit = "km/L" }: Props) {
  const hasValue = value !== null && value !== undefined && !Number.isNaN(value);
  const color = !hasValue
    ? "text-muted-foreground"
    : value >= 40
      ? "text-success"
      : "text-destructive";

  return (
    <span className={`${color} font-bold ${className}`}>
      {fmtNum(value, digits)}
      {hasValue ? (
        <span className="font-medium text-muted-foreground"> {unit}</span>
      ) : null}
    </span>
  );
}
