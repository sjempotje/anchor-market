"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconGavel, IconLoader2 } from "@tabler/icons-react"
import { cn } from "@workspace/ui/lib/utils"
import { resolveGroupMarket } from "@/app/groups/actions"

interface ResolveMarketPanelProps {
  marketId: string
  outcomes: { id: string; title: string; color?: string }[]
}

export function ResolveMarketPanel({ marketId, outcomes }: ResolveMarketPanelProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!selectedId) return
    setSubmitting(true)
    setError(null)
    const result = await resolveGroupMarket(marketId, selectedId)
    setSubmitting(false)
    if (result.ok) {
      router.refresh()
    } else {
      setError(result.error ?? "Could not resolve market")
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
        <IconGavel size={16} stroke={1.5} />
        Resolve this market
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        As a group member other than the creator, you can settle this market by picking the
        winning outcome. This pays out all winning positions immediately and can&apos;t be undone.
      </p>
      <div className="flex flex-wrap gap-2">
        {outcomes.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelectedId(o.id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
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
      <button
        onClick={submit}
        disabled={!selectedId || submitting}
        className="mt-3 w-full rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Resolving…"
          : selectedId
            ? `Resolve as "${outcomes.find((o) => o.id === selectedId)?.title}"`
            : "Select the winning outcome"}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
    </div>
  )
}
