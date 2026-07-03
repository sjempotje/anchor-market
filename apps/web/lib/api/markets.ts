/**
 * The SDK types numeric `volume*`/`trendingScore` fields as opaque objects and
 * marks nearly everything optional. These helpers normalize a raw `/api/markets`
 * row into the strict shape the grid renders from.
 *
 * Note: `GET /api/markets` returns markets WITHOUT outcomes or prices, load
 * those per market on the detail page (getMarketOutcomes + the per-outcome
 * orderbook/price calls).
 */

export interface MarketSummary {
  id: string
  title: string
  description: string
  categoryName?: string
  imageUrl?: string
  status: number
  volume24h: number
  volumeAllTime: number
  featured: boolean
  resolutionDeadline?: string
  /** For feed markets, the underlying strike/target the price must reach. */
  resolutionSource?: string
  /** 0 = Public, 1 = Group. */
  scope: number
  creatorId?: string
  /** Set only for group-scoped markets, the creator-assigned resolver. */
  assignedResolverId?: string
  /** Set only for group-scoped markets. */
  groupId?: string
}

export interface CategorySummary {
  id: string
  name: string
  slug: string
  icon?: string
}

/** SDK numeric wrappers come back as numbers or numeric strings at runtime. */
function toNumber(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const n = Number.parseFloat(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeMarket(m: any): MarketSummary {
  return {
    id: m.id ?? "",
    title: m.title ?? "Untitled market",
    description: m.description ?? "",
    categoryName: m.category?.name ?? undefined,
    imageUrl: m.imageUrl ?? m.thumbnail ?? undefined,
    status: m.status ?? 0,
    volume24h: toNumber(m.volume24h),
    volumeAllTime: toNumber(m.totalBetAmount ?? m.volumeAllTime),
    featured: m.featured ?? false,
    resolutionDeadline: m.resolutionDeadline ?? undefined,
    resolutionSource: m.resolutionSource ?? undefined,
    scope: m.scope ?? 0,
    creatorId: m.creatorId ?? undefined,
    assignedResolverId: m.assignedResolverId ?? undefined,
    groupId: m.groupId ?? undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCategory(c: any): CategorySummary {
  return {
    id: c.id ?? "",
    name: c.name ?? "",
    slug: c.slug ?? "",
    icon: c.icon ?? undefined,
  }
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000)
    return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (value >= 1_000)
    return `$${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return `$${value.toFixed(0)}`
}
