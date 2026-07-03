import { getServerApiClient, getSessionToken } from "./server"
import { apiFetch } from "./client"
import { normalizeMarket, type MarketSummary } from "./markets"

/**
 * Assembles the market detail snapshot. Per the integration guide, outcomes are
 * the hinge call: fetch `getMarket` + `getMarketOutcomes` first, then fan out
 * the per-outcome price / order book / price-history calls keyed by `outcomeId`.
 *
 * The SDK types numeric fields (`LimitOrderPrice` et al.) as opaque objects and
 * leaves several responses untyped (`void`), so everything is coerced and
 * normalized defensively here.
 */

export interface OutcomeSummary {
  id: string
  title: string
  shortName?: string
  color?: string
  imageUrl?: string
}

export interface PriceSummary {
  currentPrice: number
  change24hPercent: number
  high24h: number
  low24h: number
  volume24h: number
}

export interface OrderBookLevel {
  price: number
  quantity: number
}

export interface OrderBookSummary {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  bestBid: number | null
  bestAsk: number | null
  spread: number | null
}

export interface PricePoint {
  timestamp: string
  price: number
}

export interface OutcomeDetail {
  outcome: OutcomeSummary
  price: PriceSummary | null
  orderBook: OrderBookSummary | null
  priceHistory: PricePoint[]
}

export interface TradeSummary {
  id: string
  outcomeId?: string
  price: number
  shares: number
  createdAt: string
}

export interface MarketFeed {
  /** Feed registration ID, used to fetch stored price history for non-Binance feeds. */
  feedId: string
  /** Adapter type, e.g. "BinanceCrypto" or "HypixelBazaar". */
  adapterType: string
  /** Underlying Binance symbol, e.g. "BTCUSDT". Null for non-Binance feeds. */
  symbol: string | null
}

export interface MarketDetail {
  market: MarketSummary
  outcomes: OutcomeDetail[]
  trades: TradeSummary[]
  /** Non-null for feed-backed markets, drives charting the underlying price. */
  feed: MarketFeed | null
  feedValue: number | null
  winningOutcomeId: string | null
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const n = Number.parseFloat(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const n = toNumber(value)
  return Number.isFinite(n) ? n : null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOutcome(o: any): OutcomeSummary & { totalBetAmount: number } {
  return {
    id: o.id ?? "",
    title: o.title ?? "Outcome",
    shortName: o.shortName ?? undefined,
    color: o.color ?? undefined,
    imageUrl: o.imageUrl ?? undefined,
    totalBetAmount: toNumber(o.totalBetAmount),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePrice(p: any): PriceSummary {
  return {
    currentPrice: toNumber(p.currentPrice),
    change24hPercent: toNumber(p.change24hPercent),
    high24h: toNumber(p.high24h),
    low24h: toNumber(p.low24h),
    volume24h: toNumber(p.volume24h),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOrderBook(b: any): OrderBookSummary {
  const level = (l: { price: unknown; totalQuantity: unknown }) => ({
    price: toNumber(l.price),
    quantity: toNumber(l.totalQuantity),
  })
  return {
    bids: (b.bids ?? []).map(level),
    asks: (b.asks ?? []).map(level),
    bestBid: toNullableNumber(b.bestBid),
    bestAsk: toNullableNumber(b.bestAsk),
    spread: toNullableNumber(b.spread),
  }
}

/** Price-history rows are untyped; pull price/time from the usual key names. */
function normalizePriceHistory(raw: unknown): PricePoint[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((row): PricePoint | null => {
      if (!row || typeof row !== "object") return null
      const r = row as Record<string, unknown>
      const price = r.price ?? r.value ?? r.close
      const timestamp = r.timestamp ?? r.time ?? r.createdAt ?? r.date
      if (price === undefined || timestamp === undefined) return null
      return { timestamp: String(timestamp), price: toNumber(price) }
    })
    .filter((p): p is PricePoint => p !== null)
}

function normalizeTrades(raw: unknown): TradeSummary[] {
  if (!Array.isArray(raw)) return []
  return raw.map((t): TradeSummary => {
    const r = t as Record<string, unknown>
    return {
      id: String(r.id ?? crypto.randomUUID()),
      outcomeId: r.outcomeId ? String(r.outcomeId) : undefined,
      price: toNumber(r.executedPrice ?? r.price),
      shares: toNumber(r.shares),
      createdAt: String(r.createdAt ?? new Date().toISOString()),
    }
  })
}

/** Derive the underlying symbol from a market's feed registration, if any. */
function normalizeFeed(raw: unknown): MarketFeed | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const reg = raw[0] as { id?: string; adapterType?: string; config?: string }
  let symbol: string | null = null
  try {
    if (reg.config) {
      const cfg = JSON.parse(reg.config) as { Symbol?: unknown }
      symbol = typeof cfg.Symbol === "string" ? cfg.Symbol : null
    }
  } catch {
    symbol = null
  }
  return {
    feedId: reg.id ?? "",
    adapterType: reg.adapterType ?? "",
    symbol,
  }
}

function unwrap(res: { data: unknown }): unknown {
  return res.data
}

export async function getMarketDetail(
  marketId: string
): Promise<MarketDetail | null> {
  const api = await getServerApiClient()
  const token = await getSessionToken()

  // Hinge calls first.
  const [marketRes, outcomesRes] = await Promise.all([
    api.markets.apiMarketsIdGet(marketId),
    api.markets.apiMarketsIdOutcomesGet(marketId),
  ])

  const rawMarket = unwrap(marketRes)
  if (!rawMarket || typeof rawMarket !== "object") return null
  const market = normalizeMarket(rawMarket as any)

  const rawOutcomes = unwrap(outcomesRes)
  const outcomes = Array.isArray(rawOutcomes)
    ? (rawOutcomes as any[]).map(normalizeOutcome)
    : []

  // Implied probability, derived from each outcome's share of the market's total bet
  // amount (matches the backend's price-update broadcast formula), used as the
  // current price and as a fallback seed when there's no stored history yet.
  const marketTotal = outcomes.reduce((sum, o) => sum + o.totalBetAmount, 0)

  const priceHistories = await Promise.all(
    outcomes.map((o) =>
      apiFetch<unknown>(`/api/markets/outcomes/${o.id}/price-history`, token).catch(() => [])
    )
  )

  const outcomeDetails = outcomes.map(({ totalBetAmount, ...outcome }, i): OutcomeDetail => ({
    outcome,
    price: {
      currentPrice: marketTotal > 0 ? totalBetAmount / marketTotal : 1 / outcomes.length,
      change24hPercent: 0,
      high24h: 0,
      low24h: 0,
      volume24h: 0,
    },
    orderBook: null,
    priceHistory: normalizePriceHistory(priceHistories[i]),
  }))

  // Market-scoped extras. Resolution only exists once resolved.
  const [winningOutcomeId, rawTrades] = await Promise.all([
    api.marketResolution
      .apiMarketsMarketIdResolutionGet(marketId)
      .then((r) => {
        const v = unwrap(r) as any | null
        return v?.winningOutcomeId ?? null
      })
      .catch(() => null),
    apiFetch<unknown>(`/api/markets/${marketId}/trades`, token).catch(() => []),
  ])
  const trades = normalizeTrades(rawTrades)
  const feed = null

  return { market, outcomes: outcomeDetails, trades, feed, feedValue: null, winningOutcomeId }
}
