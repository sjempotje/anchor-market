"use client"

import { useId } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

import type { GroupMarket, ChartDataPoint, ChartSeries } from "../types"
import { MarketActions } from "../market-actions"
import { MarketVolume } from "../market-volume"
import { ScrollingNewsFeed } from "../feeds/scrolling-news-feed"
import { ChartTooltip } from "../charts/chart-tooltip"

/**
 * Group market panel displaying options, chart, and news feed.
 */

export function GroupMarketPanel({ market }: { market: GroupMarket }) {
  const gradientId = useId()

  return (
    <div className="relative flex h-full w-full flex-col gap-4">
      <a
        className="absolute inset-0"
        aria-hidden
        tabIndex={-1}
        href={market.href}
      />

      {/* Header */}
      <div className="relative flex w-full items-start justify-between gap-4 md:pb-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
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

          <div className="flex min-w-0 flex-1 flex-col-reverse items-start gap-0.5">
            <h3 className="group/title relative w-full min-w-0 text-2xl font-semibold text-pretty md:line-clamp-1">
              <a
                className="group-hover/title:underline after:absolute after:inset-0 md:break-all"
                href={market.href}
              >
                {market.title}
              </a>
            </h3>
            <div className="relative flex items-center gap-1">
              {market.categories.map((cat, i) => (
                <span key={cat.href} className="flex items-center gap-1">
                  {i > 0 && (
                    <span className="text-sm text-muted-foreground">·</span>
                  )}
                  <a
                    href={cat.href}
                    className="text-sm font-[540] text-muted-foreground transition-colors hover:text-muted-foreground/70"
                  >
                    {cat.label}
                  </a>
                </span>
              ))}
            </div>
          </div>
        </div>

        <MarketActions title={market.title} href={market.href} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col-reverse gap-4 lg:flex-row lg:gap-6">
        {/* Left side */}
        <div className="relative flex flex-col gap-4 lg:w-[40%] lg:justify-between">
          <div className="flex flex-col gap-2 rounded-lg">
            {market.options.map((option, i) => (
              <a
                key={i}
                className="group flex min-h-10 items-center justify-between gap-3 border-b border-border/30 pb-2"
                href={option.href}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <p className="truncate text-[15px] font-[450] tracking-[-0.01em] text-foreground group-hover:underline">
                    {option.label}
                  </p>
                </div>
                <span className="text-xl font-semibold whitespace-nowrap text-foreground">
                  {option.probability}%
                </span>
              </a>
            ))}
          </div>

          <div className="hidden min-h-0 flex-1 overflow-hidden lg:flex">
            <ScrollingNewsFeed items={market.news} />
          </div>
        </div>

        {/* Right side */}
        <div className="relative hidden h-full min-h-0 flex-1 flex-col justify-center lg:flex">
          <div className="min-h-0 flex-1">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 overflow-hidden">
                {/* Legend */}
                <div className="mt-1.5 mb-4 flex flex-wrap gap-x-3 gap-y-1">
                  {market.chartSeries.map((s) => (
                    <div
                      key={s.key}
                      className="flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <p className="text-sm text-muted-foreground">
                        {s.label}
                        <span className="ml-0.5 font-semibold text-foreground">
                          &nbsp;{s.currentValue}%
                        </span>
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={market.chartData}
                    margin={{ top: 8, right: 4, left: 0, bottom: 20 }}
                  >
                    <defs>
                      {market.chartSeries.map((s) => (
                        <linearGradient
                          key={s.key}
                          id={`gradient-${gradientId}-${s.key}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={s.color}
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor={s.color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "currentColor" }}
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                      tick={{ fontSize: 11, fill: "currentColor" }}
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                      domain={[0, 1]}
                      width={36}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    {market.chartSeries.map((s) => (
                      <Area
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        stroke={s.color}
                        strokeWidth={2}
                        fill={`url(#gradient-${gradientId}-${s.key})`}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                        name={s.label}
                        isAnimationActive={false}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MarketVolume
        volume={market.volume}
        endDate={market.endDate}
        resolutionType={market.resolutionType}
      />
    </div>
  )
}
