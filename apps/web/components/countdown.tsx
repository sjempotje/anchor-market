"use client"

import { useEffect, useState } from "react"
import { IconClock } from "@tabler/icons-react"
import { cn } from "@workspace/ui/lib/utils"

function format(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

/**
 * Live countdown to a market's resolution deadline. Ticks every second, turns
 * red in the final 5 minutes, and shows "Closed" once the deadline passes.
 */
export function Countdown({
  deadline,
  onExpire,
}: {
  deadline?: string
  onExpire?: () => void
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!deadline) return null
  const ms = new Date(deadline).getTime() - now

  if (ms <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <IconClock size={15} stroke={1.5} />
        Closed
      </span>
    )
  }

  const urgent = ms < 5 * 60_000

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums",
        urgent ? "text-red-500" : "text-foreground"
      )}
    >
      <IconClock size={15} stroke={1.5} className={urgent ? "" : "text-muted-foreground"} />
      {format(ms)}
      {onExpire && ms <= 1000 && <ExpireTrigger onExpire={onExpire} />}
    </span>
  )
}

function ExpireTrigger({ onExpire }: { onExpire: () => void }) {
  useEffect(() => {
    onExpire()
  }, [onExpire])
  return null
}
