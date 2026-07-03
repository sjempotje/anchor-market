import { getServerApiClient } from "@/lib/api/server"
import { normalizeMarket, type MarketSummary } from "@/lib/api/markets"
import { MarketCarousel, MarketsGrid, sampleMarkets } from "../market-card"

function isActiveMarket(m: MarketSummary): boolean {
  if (m.status !== 0) return false // 0 = Open
  if (m.resolutionDeadline && new Date(m.resolutionDeadline) <= new Date()) return false
  return true
}

async function getMarkets(): Promise<MarketSummary[]> {
  try {
    const api = await getServerApiClient()
    const res = await api.markets.apiMarketsGet()
    const raw = res.data as unknown
    if (!Array.isArray(raw)) return []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (raw as any[]).map(normalizeMarket).filter(isActiveMarket)
  } catch (e) {
    console.error("Landing markets API error:", e)
    return []
  }
}

export default async function LandingSection() {
  const markets = await getMarkets()

  return (
    <div className="flex w-full flex-col">
      <div className="flex min-h-3/5 w-full flex-col">
        <MarketCarousel markets={sampleMarkets} />
      </div>
      <MarketsGrid markets={markets} />
    </div>
  )
}
