/** Formats an implied probability (0-1) as a percentage — this app has no fixed-price shares. */
export function formatOdds(p: number): string {
  return `${(p * 100).toFixed(1)}%`
}

export function formatPct(p: number): string {
  const sign = p > 0 ? "+" : ""
  return `${sign}${p.toFixed(1)}%`
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}
