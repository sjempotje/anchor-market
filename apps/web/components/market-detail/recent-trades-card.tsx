import type { TradeSummary } from "@/lib/api/market-detail"
import { Card } from "./card"
import { formatOdds, timeAgo } from "./format"

export function RecentTradesCard({ trades }: { trades: TradeSummary[] }) {
  return (
    <Card title="Recent trades">
      {trades.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No trades yet.
        </p>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-1 pb-1 text-xs font-medium text-muted-foreground">
            <span>Odds</span>
            <span>Amount</span>
            <span>Time</span>
          </div>
          {trades.slice(0, 15).map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-1 py-1.5 text-sm tabular-nums"
            >
              <span className="font-medium text-foreground">
                {formatOdds(t.price)}
              </span>
              <span className="text-muted-foreground">
                ${t.shares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className="text-xs text-muted-foreground"
                title={new Date(t.createdAt).toLocaleString()}
              >
                {timeAgo(t.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
