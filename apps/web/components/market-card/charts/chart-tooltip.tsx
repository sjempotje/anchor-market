"use client"

/**
 * Custom tooltip for recharts charts displaying percentage values.
 */

interface ChartTooltipProps {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  formatter?: (value: number) => string
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const formatValue = formatter ?? ((v) => `${(v * 100).toFixed(0)}%`)
  return (
    <div className="space-y-1 rounded-lg border border-border bg-background p-2.5 text-xs shadow-md">
      <p className="font-medium text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground">
            {entry.name}: <strong>{formatValue(entry.value)}</strong>
          </span>
        </div>
      ))}
    </div>
  )
}
