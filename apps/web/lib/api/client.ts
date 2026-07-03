import {
  Configuration,
  CategoriesApi,
  GroupMarketsApi,
  GroupsApi,
  MarketResolutionApi,
  MarketsApi,
  PositionsApi,
  UsersApi,
  WalletsApi,
} from "@sjempotje/anchormarket-sdk-typescript"

// Server-only: all backend calls go through server actions/components, which talk
// to the .NET API directly by URL — no browser CORS/rewrite proxy involved.
const BASE_PATH =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5079"

function createConfig(accessToken?: string) {
  return new Configuration({
    basePath: BASE_PATH,
    accessToken,
    // The generated SDK only attaches the Bearer header for operations whose OpenAPI
    // spec declares a security requirement — which the backend's document transformer
    // skips for [AllowAnonymous] actions. Several of those endpoints (e.g. group/market
    // GetById) still read the caller's identity *when present* to gate private data, so
    // the header must go out unconditionally via baseOptions, not per-operation codegen.
    baseOptions: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  })
}

/** Thin fetch wrapper for endpoints not yet in the SDK (e.g. categories). */
export async function apiFetch<T>(path: string, accessToken?: string): Promise<T> {
  const res = await fetch(`${BASE_PATH}${path}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`)
  return res.json() as Promise<T>
}

export function createApiClient(accessToken?: string) {
  const config = createConfig(accessToken)
  return {
    categories: new CategoriesApi(config),
    groupMarkets: new GroupMarketsApi(config),
    groups: new GroupsApi(config),
    marketResolution: new MarketResolutionApi(config),
    markets: new MarketsApi(config),
    positions: new PositionsApi(config),
    users: new UsersApi(config),
    wallets: new WalletsApi(config),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
