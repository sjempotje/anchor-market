"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useMarketSocket } from "@/lib/api/use-socket"
import type {
  MarketDetail,
  PricePoint,
  TradeSummary,
} from "@/lib/api/market-detail"
import { BetTicket } from "@/components/market-detail/bet-ticket"
import { ResolveMarketPanel } from "@/components/market-detail/resolve-market-panel"
import { Card } from "@/components/market-detail/card"
import { MarketHeader, ResolvedBanner } from "@/components/market-detail/market-header"
import { OutcomeOddsCard } from "@/components/market-detail/outcome-odds-card"
import { OutcomePriceCard } from "@/components/market-detail/outcome-price-card"
import { RecentTradesCard } from "@/components/market-detail/recent-trades-card"
import { UnderlyingPriceChart } from "@/components/market-detail/underlying-price-chart"
import { TIMEFRAMES, CHART_FALLBACK_COLORS, type ChartSeries } from "@/components/market-detail/price-chart"

export default function MarketDetailClient({
  detail,
  canResolve = false,
}: {
  detail: MarketDetail
  canResolve?: boolean
}) {
  const { market, outcomes } = detail

  const [selectedId, setSelectedId] = useState(outcomes[0]?.outcome.id ?? "")
  const [timeframe, setTimeframe] = useState("5m")
  const [prices, setPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(outcomes.map((o) => [o.outcome.id, o.price?.currentPrice ?? 0]))
  )
  const [history, setHistory] = useState<Record<string, PricePoint[]>>(() =>
    Object.fromEntries(
      outcomes.map((o) => {
        if (o.priceHistory.length > 0) return [o.outcome.id, o.priceHistory]
        // No stored history yet — seed a flat two-point line at the current
        // price so the chart renders immediately instead of the empty state.
        const price = o.price?.currentPrice ?? 0
        const nowMs = Date.now()
        return [
          o.outcome.id,
          [
            { timestamp: new Date(nowMs - 60_000).toISOString(), price },
            { timestamp: new Date(nowMs).toISOString(), price },
          ],
        ]
      })
    )
  )
  // Tracks the timestamp of the last-applied price-update per outcome so an
  // out-of-order message (bets fire concurrent per-outcome broadcasts, so arrival
  // order across bets isn't guaranteed) can't regress the displayed price.
  const latestPriceTimestampRef = useRef<Record<string, number>>({})
  const [trades, setTrades] = useState<TradeSummary[]>(detail.trades)
  const [feedHistory, setFeedHistory] = useState<{ t: number; price: number }[]>([])
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(id)
  }, [])
  const [winningOutcomeId, setWinningOutcomeId] = useState<string | null>(
    detail.winningOutcomeId
  )

  useMarketSocket((socket) => {
    socket.subscribe("trades", { marketId: market.id })
    socket.subscribe("feed", { marketId: market.id })
    socket.subscribe("market", { marketId: market.id })
    for (const o of outcomes) {
      socket.subscribe("price", { outcomeId: o.outcome.id })
    }

    socket.on("price-update", (m) => {
      const msg = m as { outcomeId: string; price: number; timestamp: string }
      const t = new Date(msg.timestamp).getTime()

      // History keeps every point but must stay chronologically sorted — arrival
      // order across concurrent per-outcome broadcasts isn't guaranteed.
      setHistory((prev) => ({
        ...prev,
        [msg.outcomeId]: [
          ...(prev[msg.outcomeId] ?? []),
          { timestamp: msg.timestamp, price: msg.price },
        ]
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .slice(-500),
      }))

      // The "current price" display should never regress to an older, late-arriving update.
      const lastT = latestPriceTimestampRef.current[msg.outcomeId] ?? 0
      if (t < lastT) return
      latestPriceTimestampRef.current[msg.outcomeId] = t
      setPrices((prev) => ({ ...prev, [msg.outcomeId]: msg.price }))
    })
    socket.on("trade-executed", (m) => {
      const msg = m as {
        outcomeId: string
        price: number
        shares: number
        timestamp: string
      }
      setTrades((prev) =>
        [
          {
            id: `${msg.timestamp}-${msg.outcomeId}`,
            outcomeId: msg.outcomeId,
            price: msg.price,
            shares: msg.shares,
            createdAt: msg.timestamp,
          },
          ...prev,
        ].slice(0, 50)
      )
    })
    socket.on("feed-update", (m) => {
      const x = m as { value: number; timestamp?: string }
      setFeedHistory((prev) =>
        [
          ...prev,
          { t: x.timestamp ? Date.parse(x.timestamp) : Date.now(), price: x.value },
        ].slice(-2000)
      )
    })
    socket.on("market-resolved", (m) =>
      setWinningOutcomeId((m as { winningOutcomeId: string }).winningOutcomeId)
    )
  })

  const selected = useMemo(
    () => outcomes.find((o) => o.outcome.id === selectedId),
    [outcomes, selectedId]
  )

  const chartSeries = useMemo<ChartSeries[]>(() => {
    const tf = TIMEFRAMES.find((t) => t.label === timeframe)
    return outcomes.map((o, i) => {
      const all = history[o.outcome.id] ?? []
      let points = all
      if (tf && tf.ms !== Number.POSITIVE_INFINITY) {
        const cutoff = now - tf.ms
        const filtered = all.filter((p) => new Date(p.timestamp).getTime() >= cutoff)
        // Anchor the line to the left edge of the window with the last known
        // price before the cutoff, so it doesn't look like data starts mid-chart.
        const before = all.filter((p) => new Date(p.timestamp).getTime() < cutoff)
        const anchor = before[before.length - 1]
        const withAnchor = anchor ? [{ ...anchor, timestamp: new Date(cutoff).toISOString() }, ...filtered] : filtered
        points = withAnchor.length >= 2 ? withAnchor : all
      }
      return {
        id: o.outcome.id,
        label: o.outcome.title,
        color:
          o.outcome.color ??
          CHART_FALLBACK_COLORS[i % CHART_FALLBACK_COLORS.length] ??
          "#2563eb",
        data: points,
      }
    })
  }, [history, outcomes, timeframe, now])

  const chartDomain = useMemo<[number, number] | undefined>(() => {
    const tf = TIMEFRAMES.find((t) => t.label === timeframe)
    if (!tf || tf.ms === Number.POSITIVE_INFINITY) return undefined
    return [now - tf.ms, now]
  }, [timeframe, now])

  const ticketOutcomes = useMemo(
    () =>
      outcomes.map((o) => ({
        id: o.outcome.id,
        title: o.outcome.title,
        color: o.outcome.color,
      })),
    [outcomes]
  )

  const resolved = winningOutcomeId != null

  // Feed markets store the underlying strike/target in resolutionSource.
  const strike = useMemo(() => {
    const n = market.resolutionSource ? Number(market.resolutionSource) : NaN
    return Number.isFinite(n) ? n : undefined
  }, [market.resolutionSource])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <MarketHeader market={market} />

      {resolved && (
        <ResolvedBanner
          winnerTitle={
            outcomes.find((o) => o.outcome.id === winningOutcomeId)?.outcome.title ??
            "winner"
          }
        />
      )}

      {!resolved && canResolve && (
        <ResolveMarketPanel
          marketId={market.id}
          outcomes={outcomes.map((o) => ({
            id: o.outcome.id,
            title: o.outcome.title,
            color: o.outcome.color,
          }))}
        />
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <OutcomeOddsCard
            outcomes={outcomes}
            prices={prices}
            selectedId={selectedId}
            winningOutcomeId={winningOutcomeId}
            onSelect={setSelectedId}
          />

          {/* Chart: underlying asset price for feed markets, outcome odds otherwise */}
          {detail.feed ? (
            <Card>
              <UnderlyingPriceChart
                symbol={detail.feed.symbol}
                feedId={detail.feed.feedId}
                adapterType={detail.feed.adapterType}
                live={feedHistory}
                strike={strike}
              />
            </Card>
          ) : (
            selected && (
              <OutcomePriceCard
                selected={selected}
                selectedId={selectedId}
                price={prices[selectedId] ?? 0}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                chartSeries={chartSeries}
                chartDomain={chartDomain}
                onSelectSeries={setSelectedId}
              />
            )
          )}

          {/* About */}
          {market.description && (
            <Card title="About">
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {market.description}
              </p>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-6">
          <BetTicket
            marketId={market.id}
            outcomes={ticketOutcomes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            resolved={resolved}
            resolutionDeadline={market.resolutionDeadline}
          />

          <RecentTradesCard trades={trades} />
        </div>
      </div>
    </div>
  )
}
