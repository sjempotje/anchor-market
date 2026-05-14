"use client";

/**
 * Custom tooltip for recharts charts displaying percentage values.
 */

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  formatter?: (value: number) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const formatValue = formatter ?? ((v) => `${(v * 100).toFixed(0)}%`);
  return (
    <div className="bg-background border border-border rounded-lg shadow-md p-2.5 text-xs space-y-1">
      <p className="text-muted-foreground font-medium">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground">
            {entry.name}:{" "}
            <strong>{formatValue(entry.value)}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}
