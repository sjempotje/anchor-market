"use client";

import { useId } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

import type { GroupMarket, ChartDataPoint, ChartSeries } from "../types";
import { MarketActions } from "../market-actions";
import { MarketVolume } from "../market-volume";
import { ScrollingNewsFeed } from "../feeds/scrolling-news-feed";
import { ChartTooltip } from "../charts/chart-tooltip";

/**
 * Group market panel displaying options, chart, and news feed.
 */

export function GroupMarketPanel({ market }: { market: GroupMarket }) {
  const gradientId = useId();

  return (
    <div className="relative w-full h-full flex flex-col gap-4">
      <a
        className="absolute inset-0"
        aria-hidden
        tabIndex={-1}
        href={market.href}
      />

      {/* Header */}
      <div className="flex gap-4 w-full justify-between items-start md:pb-1.5 relative">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {market.iconUrl && (
            <div className="shrink-0 hidden md:block">
              <div
                className="rounded-md overflow-hidden relative"
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
                  className="object-cover absolute inset-0 w-full h-full"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse items-start gap-0.5 min-w-0 flex-1">
            <h3 className="group/title relative w-full min-w-0 font-semibold text-2xl text-pretty md:line-clamp-1">
              <a
                className="group-hover/title:underline after:absolute after:inset-0 md:break-all"
                href={market.href}
              >
                {market.title}
              </a>
            </h3>
            <div className="flex items-center gap-1 relative">
              {market.categories.map((cat, i) => (
                <span key={cat.href} className="flex items-center gap-1">
                  {i > 0 && (
                    <span className="text-muted-foreground text-sm">·</span>
                  )}
                  <a
                    href={cat.href}
                    className="text-sm font-[540] text-muted-foreground hover:text-muted-foreground/70 transition-colors"
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

      <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
        {/* Left side */}
        <div className="relative flex flex-col gap-4 lg:w-[40%] lg:justify-between">
          <div className="rounded-lg flex flex-col gap-2">
            {market.options.map((option, i) => (
              <a
                key={i}
                className="flex items-center justify-between gap-3 group border-b border-border/30 pb-2 min-h-10"
                href={option.href}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <p className="text-[15px] font-[450] tracking-[-0.01em] text-foreground group-hover:underline truncate">
                    {option.label}
                  </p>
                </div>
                <span className="text-xl font-semibold text-foreground whitespace-nowrap">
                  {option.probability}%
                </span>
              </a>
            ))}
          </div>

          <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
            <ScrollingNewsFeed items={market.news} />
          </div>
        </div>

        {/* Right side */}
        <div className="relative flex-1 min-h-0 hidden lg:flex flex-col justify-center h-full">
          <div className="flex-1 min-h-0">
            <div className="h-full w-full relative">
              <div className="absolute inset-0 overflow-hidden">
                {/* Legend */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4 mt-1.5">
                  {market.chartSeries.map((s) => (
                    <div
                      key={s.key}
                      className="flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <p className="text-muted-foreground text-sm">
                        {s.label}
                        <span className="text-foreground font-semibold ml-0.5">
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
  );
}
