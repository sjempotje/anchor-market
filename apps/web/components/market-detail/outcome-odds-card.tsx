import { IconTrophy } from "@tabler/icons-react"
import { cn } from "@workspace/ui/lib/utils"
import type { OutcomeDetail } from "@/lib/api/market-detail"
import { Card } from "./card"

export function OutcomeOddsCard({
  outcomes,
  prices,
  selectedId,
  winningOutcomeId,
  onSelect,
}: {
  outcomes: OutcomeDetail[]
  prices: Record<string, number>
  selectedId: string
  winningOutcomeId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <Card>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Current odds</h2>
        <p className="text-xs text-muted-foreground">
          Shifts with every bet — not a locked-in rate
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {outcomes.map(({ outcome }) => {
          const isSelected = outcome.id === selectedId
          const isWinner = outcome.id === winningOutcomeId
          const pct = Math.round((prices[outcome.id] ?? 0) * 100)
          return (
            <button
              key={outcome.id}
              onClick={() => onSelect(outcome.id)}
              className={cn(
                "group relative overflow-hidden rounded-lg border px-4 py-3 text-left transition-colors",
                isSelected
                  ? "border-foreground/30 bg-accent/40"
                  : "border-border hover:bg-accent/20"
              )}
            >
              <div
                className="absolute inset-y-0 left-0 bg-blue-500/10"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  {outcome.color && (
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: outcome.color }}
                    />
                  )}
                  {outcome.title}
                  {isWinner && <IconTrophy size={15} className="text-emerald-500" />}
                </span>
                <span className="text-xl font-bold tabular-nums text-foreground">
                  {pct}%
                </span>
              </div>
            </button>
          )
        })}
        {outcomes.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No outcomes for this market.
          </p>
        )}
      </div>
    </Card>
  )
}
