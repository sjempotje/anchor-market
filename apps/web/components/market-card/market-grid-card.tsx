import Link from "next/link"
import { IconChartBar } from "@tabler/icons-react"

import type { MarketSummary } from "@/lib/api/markets"
import { formatVolume } from "@/lib/api/markets"

/**
 * Compact market card for the discovery grid. Renders from the `/api/markets`
 * snapshot, which has no outcomes/prices, those load on the detail page.
 */
export function MarketGridCard({ market }: { market: MarketSummary }) {
  return (
    <Link
      href={`/markets/${market.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/20 hover:bg-accent/40"
    >
      <div className="flex items-start gap-3">
        {market.imageUrl ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={market.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <IconChartBar
              size={20}
              stroke={1.5}
              className="text-muted-foreground"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:underline">
            {market.title}
          </h3>
          {market.categoryName && (
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              {market.categoryName}
            </p>
          )}
        </div>
      </div>

      {market.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {market.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between pt-1 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {formatVolume(market.volume24h)} · 24h
        </span>
        <span className="tabular-nums">
          {formatVolume(market.volumeAllTime)} Vol
        </span>
      </div>
    </Link>
  )
}
