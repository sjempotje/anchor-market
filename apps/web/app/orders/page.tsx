import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getServerApiClient } from "@/lib/api/server"
import {
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from "@tabler/icons-react"

interface PositionWithPnl {
  id: string
  marketId: string
  marketTitle: string
  outcomeId: string
  outcomeTitle: string
  quantity: number
  averagePrice: number
  currentPrice: number
  unrealizedPnl: number
  unrealizedPnlPct: number
  value: number
  cost: number
  side: number
  status: number
  createdAt: string
}

function PnlCell({ pnl, pct }: { pnl: number; pct: number }) {
  if (pnl > 0)
    return (
      <span className="flex items-center gap-1 text-emerald-500 tabular-nums">
        <IconTrendingUp size={14} stroke={1.5} />+${pnl.toFixed(2)} ({pct >= 0 ? "+" : ""}{pct.toFixed(1)}%)
      </span>
    )
  if (pnl < 0)
    return (
      <span className="flex items-center gap-1 text-red-500 tabular-nums">
        <IconTrendingDown size={14} stroke={1.5} />${pnl.toFixed(2)} ({pct.toFixed(1)}%)
      </span>
    )
  return (
    <span className="flex items-center gap-1 text-muted-foreground tabular-nums">
      <IconMinus size={14} stroke={1.5} />$0.00
    </span>
  )
}

export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  let positions: PositionWithPnl[] = []
  try {
    const api = await getServerApiClient()
    const res = await api.positions.apiPositionsWithPnlGet()
    const data = res.data as unknown
    if (Array.isArray(data)) positions = data as PositionWithPnl[]
  } catch (e) {
    console.error("Orders page API error:", e)
  }

  const openPositions = positions.filter((p) => p.status === 0 || p.status == null)
  const closedPositions = positions.filter((p) => p.status !== 0 && p.status != null)

  const totalValue = openPositions.reduce((s, p) => s + (p.value ?? 0), 0)
  const totalCost = openPositions.reduce((s, p) => s + (p.cost ?? 0), 0)
  const totalPnl = totalValue - totalCost

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 py-8 px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <IconChartBar size={24} stroke={1.5} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Positions</h1>
          <p className="text-sm text-muted-foreground">Your active market positions</p>
        </div>
      </div>

      {openPositions.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Portfolio value</p>
            <p className="text-2xl font-bold tabular-nums">
              ${totalValue.toFixed(2)}
            </p>
          </div>
          <div className="mt-1 flex items-center justify-end">
            <PnlCell pnl={totalPnl} pct={totalCost > 0 ? (totalPnl / totalCost) * 100 : 0} />
          </div>
        </div>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Open Positions
        </h2>
        {openPositions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-16 text-center">
            <IconChartBar size={36} stroke={1.5} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No open positions yet.</p>
            <Link href="/" className="mt-1 text-sm font-medium text-primary hover:underline">
              Browse markets
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
            {openPositions.map((p) => (
              <div key={p.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/markets/${p.marketId}`}
                    className="block truncate text-sm font-medium hover:text-primary"
                  >
                    {p.marketTitle}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{p.outcomeTitle}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Shares</p>
                    <p className="tabular-nums font-medium">{p.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Avg price</p>
                    <p className="tabular-nums font-medium">
                      {Math.round((p.averagePrice ?? 0) * 100)}¢
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="tabular-nums font-medium">
                      {Math.round((p.currentPrice ?? 0) * 100)}¢
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Value</p>
                    <p className="tabular-nums font-medium">${(p.value ?? 0).toFixed(2)}</p>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <p className="text-xs text-muted-foreground">P&L</p>
                    <PnlCell
                      pnl={p.unrealizedPnl ?? p.value - p.cost}
                      pct={p.unrealizedPnlPct ?? (p.cost > 0 ? ((p.value - p.cost) / p.cost) * 100 : 0)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {closedPositions.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Closed Positions
          </h2>
          <div className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
            {closedPositions.map((p) => (
              <div key={p.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 opacity-70">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/markets/${p.marketId}`}
                    className="block truncate text-sm font-medium hover:text-primary"
                  >
                    {p.marketTitle}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{p.outcomeTitle}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Shares</p>
                    <p className="tabular-nums font-medium">{p.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Avg price</p>
                    <p className="tabular-nums font-medium">
                      {Math.round((p.averagePrice ?? 0) * 100)}¢
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">P&L</p>
                    <PnlCell
                      pnl={p.unrealizedPnl ?? p.value - p.cost}
                      pct={p.unrealizedPnlPct ?? (p.cost > 0 ? ((p.value - p.cost) / p.cost) * 100 : 0)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
