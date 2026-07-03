"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { authClient } from "@/lib/auth-client"
import { getWalletBalance, placeBet } from "@/app/markets/[id]/actions"

interface BetTicketProps {
  marketId: string
  outcomes: { id: string; title: string; color?: string }[]
  selectedId: string
  onSelect: (id: string) => void
  resolved?: boolean
  resolutionDeadline?: string
}

export function BetTicket({
  marketId,
  outcomes,
  selectedId,
  onSelect,
  resolved,
  resolutionDeadline,
}: BetTicketProps) {
  const { data: session, isPending: sessionLoading } = authClient.useSession()
  const userId = session?.user?.id as string | undefined

  const [amount, setAmount] = useState(10)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null)
  const [balance, setBalance] = useState<number | null>(null)

  const selectedOutcome = outcomes.find((o) => o.id === selectedId)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    getWalletBalance().then((b) => {
      if (!cancelled) setBalance(b)
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  const validation = useMemo(() => {
    if (sessionLoading) return "Loading…"
    if (!userId) return "Log in to bet"
    if (resolved) return "Market resolved"
    if (!selectedId) return "Select an outcome"
    if (amount < 0.01) return "Minimum bet is $0.01"
    if (balance != null && amount > balance) return "Insufficient balance"
    return null
  }, [sessionLoading, userId, resolved, selectedId, amount, balance])

  async function submit() {
    if (validation) return
    setSubmitting(true)
    setMessage(null)
    const result = await placeBet({
      marketId,
      outcomeId: selectedId,
      amount,
    })
    setSubmitting(false)
    if (result.ok) {
      setMessage({ kind: "ok", text: `Bet placed on ${selectedOutcome?.title}` })
      setAmount(10)
      if (balance != null) setBalance(balance - amount)
    } else {
      setMessage({ kind: "err", text: result.error ?? "Could not place bet" })
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-foreground">Place a bet</h2>

      {/* Outcome */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Choose</p>
        <div className="flex flex-col gap-2">
          {outcomes.map((o) => (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              className={cn(
                "rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
                o.id === selectedId
                  ? "border-foreground/40 bg-accent"
                  : "border-border hover:bg-accent/40"
              )}
            >
              {o.color && (
                <span
                  className="mr-2 inline-block size-2 rounded-full"
                  style={{ backgroundColor: o.color }}
                />
              )}
              {o.title}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Amount</p>
        <input
          type="number"
          min={0.01}
          step={0.01}
          value={amount}
          onChange={(e) => setAmount(Math.max(0.01, Number(e.target.value) || 0))}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm tabular-nums outline-none focus:border-foreground/40"
          placeholder="$0.00"
        />
        <div className="mt-2 flex gap-1.5">
          {[5, 10, 25, 100].map((q) => (
            <button
              key={q}
              onClick={() => setAmount(q)}
              className="flex-1 rounded-md border border-border py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              ${q}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {balance != null && (
        <div className="mb-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Your bet</span>
            <span className="tabular-nums">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Balance</span>
            <span className="tabular-nums">${balance.toFixed(2)}</span>
          </div>
        </div>
      )}

      <button
        onClick={submit}
        disabled={!!validation || submitting}
        className={cn(
          "w-full rounded-lg bg-blue-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {submitting ? "Placing bet…" : validation ?? `Bet $${amount.toFixed(2)} on ${selectedOutcome?.title}`}
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
