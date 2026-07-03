"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { PricePoint } from "@/lib/api/market-detail"
import { formatOdds } from "./format"

export const TIMEFRAMES: { label: string; ms: number }[] = [
  { label: "5m", ms: 300_000 },
  { label: "1H", ms: 3_600_000 },
  { label: "6H", ms: 21_600_000 },
  { label: "1D", ms: 86_400_000 },
  { label: "1W", ms: 604_800_000 },
  { label: "1M", ms: 2_592_000_000 },
  { label: "ALL", ms: Number.POSITIVE_INFINITY },
]

export const CHART_FALLBACK_COLORS = ["#2563eb", "#ef4444", "#f59e0b", "#8b5cf6", "#10b981"]

export interface ChartSeries {
  id: string
  label: string
  color: string
  data: PricePoint[]
}

/** Merges per-outcome price histories onto a shared, sorted set of timestamps, forward-filling gaps so every series has a value at every point once it has started. */
function mergeSeries(series: ChartSeries[]): { t: number; [key: string]: number }[] {
  // Include "now" so a series whose last trade is older than another's (or than the
  // current time) still extends flat to the right edge instead of stopping short and
  // leaving a visual gap.
  const times = Array.from(
    new Set([...series.flatMap((s) => s.data.map((p) => new Date(p.timestamp).getTime())), Date.now()])
  ).sort((a, b) => a - b)

  const cursors = new Array(series.length).fill(0)
  return times.map((t) => {
    const row: { t: number; [key: string]: number } = { t }
    series.forEach((s, i) => {
      let cursor = cursors[i] ?? 0
      while (
        cursor + 1 < s.data.length &&
        new Date(s.data[cursor + 1]!.timestamp).getTime() <= t
      ) {
        cursor++
      }
      cursors[i] = cursor
      const point = s.data[cursor]
      if (point && new Date(point.timestamp).getTime() <= t) {
        row[s.id] = point.price
      }
    })
    return row
  })
}

export function PriceChart({ series, domain }: { series: ChartSeries[]; domain?: [number, number] }) {
  const pointCount = Math.max(...series.map((s) => s.data.length), 0)
  if (pointCount < 2) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Not enough price history yet.
      </div>
    )
  }
  const chartData = mergeSeries(series)
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.id} id={`priceFill-${s.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <XAxis
          dataKey="t"
          type="number"
          domain={domain ?? ["dataMin", "dataMax"]}
          tickFormatter={(t) =>
            new Date(t).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit" })
          }
          tick={{ fontSize: 11, fill: "currentColor" }}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
          minTickGap={40}
        />
        <YAxis
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          tick={{ fontSize: 11, fill: "currentColor" }}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
          domain={[0, 1]}
          width={40}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                <div className="text-muted-foreground">
                  {label != null ? new Date(label as number).toLocaleString() : ""}
                </div>
                {series.map((s) => {
                  const entry = payload.find((p) => p.dataKey === s.id)
                  if (entry?.value == null) return null
                  return (
                    <div key={s.id} className="flex items-center gap-1.5 font-semibold tabular-nums text-popover-foreground">
                      <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.label}: {formatOdds(Number(entry.value))}
                    </div>
                  )
                })}
              </div>
            )
          }}
        />
        {series.map((s) => (
          <Area
            key={s.id}
            type="monotone"
            dataKey={s.id}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#priceFill-${s.id})`}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
