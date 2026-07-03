"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, AreaSeries, type IChartApi, type ISeriesApi, type AreaData, ColorType } from "lightweight-charts"
import { cn } from "@workspace/ui/lib/utils"
import { formatPct } from "./format"

const KLINES: Record<string, [string, number]> = {
  "5m": ["1m", 5],
  "1H": ["1m", 60],
  "6H": ["5m", 72],
  "1D": ["15m", 96],
  "1W": ["1h", 168],
  "1M": ["4h", 180],
  "ALL": ["1d", 200],
}

export function UnderlyingPriceChart({
  symbol,
  feedId,
  adapterType,
  live,
  strike,
}: {
  symbol?: string | null
  feedId?: string
  adapterType?: string
  live: { t: number; price: number }[]
  strike?: number
}) {
  const isBinance = adapterType === "BinanceCrypto" && !!symbol
  const [tf, setTf] = useState("5m")
  const [base, setBase] = useState<{ t: number; price: number }[]>([])
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")
  const [current, setCurrent] = useState<number | null>(null)
  const [open, setOpen] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null)
  const strikeLineRef = useRef<ReturnType<ISeriesApi<"Area">["createPriceLine"]> | null>(null)
  // Tracks how many live points have already been pushed via series.update()
  const pushedLiveCountRef = useRef(0)
  const tfRef = useRef(tf)
  useEffect(() => { tfRef.current = tf }, [tf])

  // Create/destroy chart when container mounts
  useEffect(() => {
    if (!containerRef.current) return

    const isDark = document.documentElement.classList.contains("dark")
    const textColor = isDark ? "#94a3b8" : "#64748b"
    const gridColor = isDark ? "#1e293b" : "#f1f5f9"

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 280,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.2, bottom: 0.2 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: tf === "5m",
      },
      crosshair: {
        vertLine: { labelVisible: true },
        horzLine: { labelVisible: true },
      },
      handleScale: true,
      handleScroll: true,
    })

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#f59e0b",
      topColor: "rgba(245,158,11,0.25)",
      bottomColor: "rgba(245,158,11,0)",
      lineWidth: 2,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    })

    chartRef.current = chart
    seriesRef.current = series

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) chart.applyOptions({ width: w })
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      strikeLineRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally only on mount — tf changes handled via applyOptions below

  // Update time/price scale options when tf changes
  useEffect(() => {
    chartRef.current?.applyOptions({
      timeScale: { secondsVisible: tf === "5m" },
      rightPriceScale: {
        scaleMargins: tf === "5m" ? { top: 0.25, bottom: 0.25 } : { top: 0.15, bottom: 0.15 },
      },
    })
  }, [tf])

  // Fetch historical data — Binance klines for crypto, stored feed results for others
  useEffect(() => {
    let cancelled = false
    setTimeout(() => setStatus("loading"), 0)

    if (isBinance && symbol) {
      const kline = KLINES[tf] ?? (["1m", 5] as [string, number])
      const [interval, limit] = kline
      fetch(`/api/feeds/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`)
        .then((r) => r.json())
        .then((rows: unknown) => {
          if (cancelled) return
          if (!Array.isArray(rows)) throw new Error("bad response")
          setBase(rows.map((k) => {
            const row = k as unknown[]
            return { t: Number(row[0]), price: Number(row[4]) }
          }))
          setStatus("ok")
        })
        .catch(() => {
          // Binance klines failed (rate limit, network error, etc.) — fall back to stored feed history
          if (cancelled || !feedId) return
          fetch(`/api/feeds/${feedId}/history?limit=300`)
            .then((r) => r.json())
            .then((rows: unknown) => {
              if (cancelled) return
              if (!Array.isArray(rows)) throw new Error("bad response")
              setBase(rows.map((r) => {
                const row = r as { t: number; price: number }
                return { t: row.t, price: row.price }
              }))
              setStatus("ok")
            })
            .catch(() => { if (!cancelled) setStatus("error") })
        })
    } else if (feedId) {
      // Non-Binance feed: use stored poll results from the backend
      fetch(`/api/feeds/${feedId}/history?limit=300`)
        .then((r) => r.json())
        .then((rows: unknown) => {
          if (cancelled) return
          if (!Array.isArray(rows)) throw new Error("bad response")
          setBase(rows.map((r) => {
            const row = r as { t: number; price: number }
            return { t: row.t, price: row.price }
          }))
          setStatus("ok")
        })
        .catch(() => { if (!cancelled) setStatus("error") })
    } else {
      setTimeout(() => setStatus("ok"), 0)
    }

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBinance, symbol, feedId, tf])

  // Load historical base data with setData — also includes any live points collected before base loaded
  useEffect(() => {
    const series = seriesRef.current
    if (!series) return

    const lastBaseT = base.at(-1)?.t ?? 0

    // Seed with base klines + any live points already received that fall after
    const seedLive = live.filter((p) => p.t > lastBaseT)
    const seed = [...base, ...seedLive]

    const seen = new Map<number, number>()
    for (const p of seed) seen.set(Math.floor(p.t / 1000), p.price)
    const points: AreaData[] = Array.from(seen.entries())
      .sort(([a], [b]) => a - b)
      .map(([time, value]) => ({ time: time as AreaData["time"], value }))

    if (points.length < 1) return
    series.setData(points)
    // All live points up to now are baked in — don't re-push them
    pushedLiveCountRef.current = live.length

    setTimeout(() => {
      setCurrent(points.at(-1)?.value ?? null)
      setOpen(points.at(0)?.value ?? null)
    }, 0)
    scrollToNow()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, tf]) // runs when base reloads (tf change) — live handled separately

  // Push each new live tick incrementally via series.update() for smooth movement
  useEffect(() => {
    const series = seriesRef.current
    if (!series || live.length === 0) return

    const newPoints = live.slice(pushedLiveCountRef.current)
    for (const p of newPoints) {
      const point: AreaData = { time: Math.floor(p.t / 1000) as AreaData["time"], value: p.price }
      series.update(point)
    }
    if (newPoints.length > 0) {
      pushedLiveCountRef.current = live.length
      setCurrent(live.at(-1)?.price ?? null)
      scrollToNow()
    }
  // scrollToNow is stable — reads tfRef internally, no stale closure
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live])

  // Maintain a sliding time window visible range (for non-ALL timeframes)
  const INTERVAL_SEC: Record<string, number> = {
    "1m": 60, "5m": 300, "15m": 900, "1h": 3600, "4h": 14400, "1d": 86400,
  }
  function scrollToNow() {
    const ts = chartRef.current?.timeScale()
    if (!ts) return
    const activeTf = tfRef.current
    if (activeTf === "ALL") { try { ts.fitContent() } catch { /* chart disposed */ } return }
    const k = KLINES[activeTf]
    if (!k) return
    const windowSec = (INTERVAL_SEC[k[0]] ?? 60) * k[1]
    const nowSec = Math.floor(Date.now() / 1000)
    try {
      ts.setVisibleRange({
        from: (nowSec - windowSec) as AreaData["time"],
        to: nowSec as AreaData["time"],
      })
    } catch { /* chart disposed between check and call */ }
  }

  useEffect(() => {
    const id = setInterval(scrollToNow, 1_000)
    return () => clearInterval(id)
  // scrollToNow is stable — reads tfRef internally, no stale closure
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Manage strike price line
  useEffect(() => {
    const series = seriesRef.current
    if (!series) return
    if (strikeLineRef.current) {
      series.removePriceLine(strikeLineRef.current)
      strikeLineRef.current = null
    }
    if (strike != null) {
      strikeLineRef.current = series.createPriceLine({
        price: strike,
        color: "#94a3b8",
        lineWidth: 1,
        lineStyle: 2, // dashed
        axisLabelVisible: true,
        title: `Target $${strike.toLocaleString()}`,
      })
    }
  }, [strike])

  const changePct = open && current ? ((current - open) / open) * 100 : 0
  const fmt = (v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  const targetReached = strike != null && current != null && current >= strike

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {current != null ? fmt(current) : "—"}
          </span>
          {current != null && open != null && (
            <span className={cn("text-sm font-medium tabular-nums", changePct >= 0 ? "text-emerald-500" : "text-red-500")}>
              {formatPct(changePct)}
            </span>
          )}
          {symbol && <span className="text-sm text-muted-foreground">{symbol}</span>}
          {strike != null && (
            <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium", targetReached ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
              Target ${strike.toLocaleString()}
            </span>
          )}
        </div>
        {isBinance && (
          <div className="flex gap-0.5 rounded-lg bg-muted p-0.5">
            {Object.keys(KLINES).map((label) => (
              <button
                key={label}
                onClick={() => setTf(label)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  tf === label ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {status === "error" ? (
        <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
          Couldn&apos;t load {symbol ?? "feed"} price.
        </div>
      ) : (
        <div className="relative">
          <div ref={containerRef} className="h-[280px] w-full" />
          {targetReached && (
            <div className="pointer-events-none absolute bottom-6 right-14 flex flex-col items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Target</span>
              <div className="flex items-center gap-1">
                {[0, 100, 200].map((delay) => (
                  <svg key={delay} width="16" height="10" viewBox="0 0 16 10" className="animate-bounce text-emerald-400" style={{ animationDelay: `${delay}ms` }} fill="currentColor">
                    <path d="M8 10 L0 0 H16 Z" />
                  </svg>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
