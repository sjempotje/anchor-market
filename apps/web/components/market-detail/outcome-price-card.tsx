import { cn } from "@workspace/ui/lib/utils"
import type { OutcomeDetail } from "@/lib/api/market-detail"
import { Card } from "./card"
import { formatOdds } from "./format"
import { PriceChart, TIMEFRAMES, type ChartSeries } from "./price-chart"

export function OutcomePriceCard({
  selected,
  selectedId,
  price,
  timeframe,
  onTimeframeChange,
  chartSeries,
  chartDomain,
  onSelectSeries,
}: {
  selected: OutcomeDetail
  selectedId: string
  price: number
  timeframe: string
  onTimeframeChange: (label: string) => void
  chartSeries: ChartSeries[]
  chartDomain?: [number, number]
  onSelectSeries: (id: string) => void
}) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {formatOdds(price)}
          </span>
          <span className="text-sm text-muted-foreground">
            {selected.outcome.title}
          </span>
        </div>
        <div className="flex gap-0.5 rounded-lg bg-muted p-0.5">
          {TIMEFRAMES.map((t) => (
            <button
              key={t.label}
              onClick={() => onTimeframeChange(t.label)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                timeframe === t.label
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Live implied odds from the betting pool, reflects the market right now, not a
        price you lock in by betting.
      </p>
      {chartSeries.length > 1 && (
        <div className="mb-2 flex items-center gap-4">
          {chartSeries.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSeries(s.id)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium transition-opacity",
                s.id === selectedId ? "opacity-100" : "opacity-50 hover:opacity-80"
              )}
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </button>
          ))}
        </div>
      )}
      <PriceChart series={chartSeries} domain={chartDomain} />
    </Card>
  )
}
