"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { authClient } from "@/lib/auth-client"
import type { OrderBookSummary } from "@/lib/api/market-detail"
import { getWalletBalance, placeOrder } from "@/app/markets/[id]/actions"

type Side = "buy" | "sell"

interface OrderTicketProps {
  marketId: string
  outcomes: { id: string; title: string; color?: string }[]
  selectedId: string
  onSelect: (id: string) => void
  prices: Record<string, number>
  books: Record<string, OrderBookSummary | undefined>
  resolved?: boolean
  resolutionDeadline?: string // ISO string
}

function suggestPrice(side: Side, book: OrderBookSummary | undefined, fallback: number): number {
  const best = side === "buy" ? book?.bestAsk : book?.bestBid
  const value = best ?? (fallback > 0 ? fallback : 0.5)
  return Math.min(99, Math.max(1, Math.round(value * 100)))
}

const HALT_MINUTES = 5

function useIsHalted(resolutionDeadline?: string) {
  const [halted, setHalted] = useState(false)
  useEffect(() => {
    if (!resolutionDeadline) return
    const check = () => {
      const minsLeft = (new Date(resolutionDeadline).getTime() - Date.now()) / 60_000
      setHalted(minsLeft <= HALT_MINUTES)
    }
    check()
    const id = setInterval(check, 10_000)
    return () => clearInterval(id)
  }, [resolutionDeadline])
  return halted
}

export function OrderTicket({
  marketId,
  outcomes,
  selectedId,
  onSelect,
  prices,
  books,
  resolved,
  resolutionDeadline,
}: OrderTicketProps) {
  const { data: session, isPending: sessionLoading } = authClient.useSession()
  const token = session?.session?.token as string | undefined
  const userId = session?.user?.id as string | undefined

  const isHalted = useIsHalted(resolutionDeadline)
  const [side, setSide] = useState<Side>("buy")
  const [priceCents, setPriceCents] = useState(50)
  const [shares, setShares] = useState(100)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null)
  const [balance, setBalance] = useState<number | null>(null)

  // Re-suggest a price whenever the outcome or side changes.
  useEffect(() => {
    setPriceCents(suggestPrice(side, books[selectedId], prices[selectedId] ?? 0))
    setMessage(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, side])

  // Load wallet balance.
  useEffect(() => {
    if (!userId || !token) return
    let cancelled = false
    getWalletBalance().then((b) => {
      if (!cancelled) setBalance(b)
    })
    return () => {
      cancelled = true
    }
  }, [userId, token])

  const cost = (priceCents / 100) * shares
  const selectedOutcome = outcomes.find((o) => o.id === selectedId)

  const validation = useMemo(() => {
    if (sessionLoading) return "Loading…"
    if (!token) return "Log in to trade"
    if (resolved) return "Market resolved"
    if (isHalted) return `Trading halted — resolves in <${HALT_MINUTES} min`
    if (!selectedId) return "Select an outcome"
    if (shares <= 0) return "Enter a quantity"
    if (priceCents < 1 || priceCents > 99) return "Price must be 1–99¢"
    if (side === "buy" && balance != null && cost > balance) return "Insufficient balance"
    return null
  }, [sessionLoading, token, resolved, isHalted, selectedId, shares, priceCents, side, balance, cost])

  async function submit() {
    if (validation) return
    setSubmitting(true)
    setMessage(null)
    const result = await placeOrder({
      marketId,
      outcomeId: selectedId,
      side: side === "buy" ? 0 : 1,
      price: priceCents / 100,
      quantity: shares,
      expiresAt: null,
    })
    setSubmitting(false)
    if (result.ok) {
      setMessage({ kind: "ok", text: `${side === "buy" ? "Buy" : "Sell"} order placed` })
      if (side === "buy" && balance != null) setBalance(balance - cost)
    } else {
      setMessage({ kind: "err", text: result.error ?? "Could not place order" })
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      {/* Buy / Sell */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={cn(
              "rounded-md py-2 text-sm font-semibold capitalize transition-colors",
              side === s
                ? s === "buy"
                  ? "bg-emerald-500 text-white"
                  : "bg-red-500 text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Outcome */}
      <div className="mt-4">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Outcome</p>
        <div className="grid grid-cols-2 gap-2">
          {outcomes.map((o) => (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                o.id === selectedId
                  ? "border-foreground/40 bg-accent"
                  : "border-border hover:bg-accent/40"
              )}
            >
              <span className="truncate">{o.title}</span>
              <span className="tabular-nums text-muted-foreground">
                {Math.round((prices[o.id] ?? 0) * 100)}¢
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Limit price */}
      <div className="mt-4">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Limit price (¢)</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPriceCents((p) => Math.max(1, p - 1))}
            className="size-9 shrink-0 rounded-lg border border-border text-lg leading-none hover:bg-accent"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={99}
            value={priceCents}
            onChange={(e) => setPriceCents(Math.min(99, Math.max(1, Number(e.target.value) || 0)))}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-center text-sm tabular-nums outline-none focus:border-foreground/40"
          />
          <button
            onClick={() => setPriceCents((p) => Math.min(99, p + 1))}
            className="size-9 shrink-0 rounded-lg border border-border text-lg leading-none hover:bg-accent"
          >
            +
          </button>
        </div>
      </div>

      {/* Shares */}
      <div className="mt-3">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Shares</p>
        <input
          type="number"
          min={0}
          value={shares}
          onChange={(e) => setShares(Math.max(0, Number(e.target.value) || 0))}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm tabular-nums outline-none focus:border-foreground/40"
        />
        <div className="mt-2 flex gap-1.5">
          {[10, 50, 100, 500].map((q) => (
            <button
              key={q}
              onClick={() => setShares(q)}
              className="flex-1 rounded-md border border-border py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{side === "buy" ? "You pay" : "You receive"}</span>
          <span className="font-semibold tabular-nums">${cost.toFixed(2)}</span>
        </div>
        {side === "buy" && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Payout if correct</span>
            <span className="tabular-nums">${shares.toFixed(2)} (+${(shares - cost).toFixed(2)} profit)</span>
          </div>
        )}
        {balance != null && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Balance</span>
            <span className="tabular-nums">${balance.toFixed(2)}</span>
          </div>
        )}
      </div>

      <button
        onClick={submit}
        disabled={!!validation || submitting}
        className={cn(
          "mt-4 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          side === "buy" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
        )}
      >
        {submitting
          ? "Placing…"
          : validation ?? `${side === "buy" ? "Buy" : "Sell"} ${selectedOutcome?.title ?? ""}`}
      </button>

      {message && (
        <p
          className={cn(
            "mt-2 text-center text-xs",
            message.kind === "ok" ? "text-emerald-500" : "text-red-500"
          )}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
