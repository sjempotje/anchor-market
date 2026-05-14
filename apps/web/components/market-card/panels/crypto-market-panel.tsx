"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { IconArrowUp, IconArrowDown } from "@tabler/icons-react"
import { cn } from "@workspace/ui/lib/utils"

import type { CryptoMarket } from "../types"
import { MarketVolume } from "../market-volume"
import { MarketActions } from "../market-actions"

/**
 * Crypto market panel displaying price charts with up/down betting.
 */

export function CryptoMarketPanel({ market }: { market: CryptoMarket }) {
  const upColor = "#ff9900"
  const downColor = "#6b7280"

  const [timeLeft, setTimeLeft] = useState(market.endsIn)

  useEffect(() => {
    if (!timeLeft) return
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev) return prev
        const totalSec = prev.minutes * 60 + prev.seconds - 1
        if (totalSec <= 0) {
          clearInterval(id)
          return { minutes: 0, seconds: 0 }
        }
        return { minutes: Math.floor(totalSec / 60), seconds: totalSec % 60 }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const Header = () => (
    <div className="group relative flex w-full items-center gap-4">
      {market.iconUrl && (
        <div className="hidden shrink-0 md:block">
          <div
            className="relative overflow-hidden rounded-md"
            style={{
              height: 56,
              width: 56,
              minWidth: 56,
              backgroundColor: market.iconBg ?? "white",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={market.iconUrl}
              alt={`icon for ${market.title}`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      )}
      <div className="flex flex-col items-start gap-1">
        <h3 className="text-2xl leading-tight font-semibold text-pretty">
          <a
            className="group-hover:underline after:absolute after:inset-0"
            href={market.href}
          >
            {market.title}
          </a>
        </h3>
        <div className="pointer-events-none relative">
          <span className="text-sm font-[540] text-muted-foreground">
            {market.timeRange}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative flex h-full w-full flex-col gap-2">
      <a
        className="absolute inset-0"
        aria-hidden
        tabIndex={-1}
        href={market.href}
      />

      {/* Mobile header */}
      <div className="lg:hidden">
        <Header />
      </div>

      <div className="flex min-h-0 flex-1 flex-col-reverse gap-4 lg:flex-row lg:gap-6">
        {/* Left: buttons + comments */}
        <div className="relative flex flex-col gap-4 lg:w-[40%] lg:justify-between">
          <div className="hidden lg:block">
            <Header />
          </div>

          {/* Up/Down buttons */}
          <div className="flex gap-2">
            <a
              className="group flex h-14 flex-1 items-center justify-center rounded-[8px] transition-colors"
              style={{
                backgroundColor: `color-mix(in srgb, ${upColor} 20%, transparent)`,
              }}
              href={market.upHref}
            >
              <span
                className="flex items-center gap-1.5 text-lg font-semibold tabular-nums"
                style={{ color: upColor }}
              >
                <IconArrowUp size={18} />
                <span>Up</span>
                {market.upProbability !== undefined && (
                  <span>{market.upProbability}%</span>
                )}
              </span>
            </a>
            <a
              className="flex h-14 flex-1 items-center justify-center rounded-[8px] bg-muted/20 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              href={market.downHref}
            >
              <span className="flex items-center gap-1.5 text-lg font-semibold tabular-nums">
                <IconArrowDown size={18} />
                <span>Down</span>
                {market.downProbability !== undefined && (
                  <span>{market.downProbability}%</span>
                )}
              </span>
            </a>
          </div>

          {/* Comments */}
          <div className="hidden min-h-0 flex-1 overflow-hidden lg:flex">
            <div
              className="relative h-full w-full overflow-hidden"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0px, black 40px, black 100%)",
                maskImage:
                  "linear-gradient(to bottom, transparent 0px, black 40px, black 100%)",
              }}
            >
              {/* Comments feed would go here */}
            </div>
          </div>
        </div>

        {/* Right: price + chart */}
        <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col gap-3">
          {/* Price display */}
          <div className="relative flex w-full items-start justify-between gap-4 md:pb-1.5">
            <MarketActions title={market.title} href={market.href} />
          </div>
          <div className="flex items-center justify-between py-0.5 pr-2">
            <div className="flex items-center gap-4">
              {/* Price to beat */}
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted-foreground opacity-80">
                  Price To Beat
                </span>
                <span className="mt-1 text-xl font-[620] tracking-wide text-muted-foreground md:text-2xl">
                  ${market.priceToBeat.toLocaleString()}
                </span>
              </div>

              <div className="h-6 w-0.5 rounded-full bg-muted lg:h-8" />

              {/* Current price */}
              {market.currentPrice !== undefined && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span
                      className="text-xs font-semibold opacity-80"
                      style={{ color: upColor }}
                    >
                      Current Price
                    </span>
                    {market.priceDelta !== undefined && (
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          market.priceDelta >= 0
                            ? "text-green-500"
                            : "text-red-400"
                        )}
                      >
                        {market.priceDelta >= 0 ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-xl font-[620] tabular-nums md:text-2xl"
                    style={{ color: upColor }}
                  >
                    ${market.currentPrice.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Countdown */}
            {timeLeft && (
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-muted-foreground opacity-80">
                  Ends in
                </span>
                <span className="text-xl font-[620] text-red-500 tabular-nums md:text-2xl">
                  {String(timeLeft.minutes).padStart(2, "0")}:
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          {/* Price chart */}
          {market.chartData && market.chartData.length > 0 && (
            <div className="relative min-h-0 flex-1">
              <div className="absolute inset-0 overflow-hidden">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={market.chartData}
                    margin={{ top: 8, right: 4, left: 0, bottom: 20 }}
                  >
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10, fill: "currentColor" }}
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "currentColor" }}
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                      tickFormatter={(v) => `$${v.toLocaleString()}`}
                      width={62}
                    />
                    <Tooltip
                      formatter={(v) => [
                        `$${Number(v).toLocaleString()}`,
                        "Price",
                      ]}
                      labelFormatter={(l) => `Time: ${l}`}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <ReferenceLine
                      y={market.priceToBeat}
                      stroke="#6b7280"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: "Target",
                        position: "insideTopRight",
                        fontSize: 10,
                        fill: "#6b7280",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={upColor}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      <MarketVolume volume={market.volume} isLive={market.isLive} />
    </div>
  )
}
