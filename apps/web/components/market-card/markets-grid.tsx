import { IconChartBar } from "@tabler/icons-react"

import type { MarketSummary } from "@/lib/api/markets"
import { MarketGridCard } from "./market-grid-card"

/**
 * Discovery grid of markets, rendered under the featured carousel on the
 * landing page from the `/api/markets` snapshot.
 */
export function MarketsGrid({ markets }: { markets: MarketSummary[] }) {
  return (
    <section className="mt-8 mb-12 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">All markets</h2>
        {markets.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {markets.length} market{markets.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {markets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <IconChartBar
            size={40}
            stroke={1.5}
            className="text-muted-foreground/40"
          />
          <p className="text-sm text-muted-foreground">
            No markets available yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {markets.map((market) => (
            <MarketGridCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </section>
  )
}
