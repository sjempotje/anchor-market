import Link from "next/link"
import { IconArrowLeft, IconChartBar, IconTrophy } from "@tabler/icons-react"
import { Countdown } from "@/components/countdown"
import type { MarketDetail } from "@/lib/api/market-detail"

export function MarketHeader({ market }: { market: MarketDetail["market"] }) {
  return (
    <>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft size={16} stroke={1.5} />
        Markets
      </Link>

      <div className="flex items-start gap-4">
        {market.imageUrl ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={market.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted">
            <IconChartBar size={28} stroke={1.5} className="text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {market.categoryName && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {market.categoryName}
            </p>
          )}
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            {market.title}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Closes in</span>
            <Countdown deadline={market.resolutionDeadline} />
          </div>
        </div>
      </div>
    </>
  )
}

export function ResolvedBanner({ winnerTitle }: { winnerTitle: string }) {
  return (
    <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
      <IconTrophy size={18} stroke={1.5} />
      Resolved, <span className="font-semibold">{winnerTitle}</span> won.
    </div>
  )
}
