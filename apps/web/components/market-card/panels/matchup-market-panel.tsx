"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { MatchupMarket } from "../types";
import { MarketActions } from "../market-actions";
import { MarketVolume } from "../market-volume";
import { ScrollingCommentsFeed } from "../feeds/scrolling-comments-feed";
import { ChartTooltip } from "../charts/chart-tooltip";

/**
 * Matchup market panel displaying two competing teams/options with live scores and charts.
 */

export function MatchupMarketPanel({ market }: { market: MatchupMarket }) {
  const Header = () => (
    <div className="relative flex w-full items-center gap-4">
      <div className="flex flex-col-reverse items-start gap-1">
        <h3 className="group/title relative font-semibold text-2xl">
          <a
            className="group-hover/title:underline after:absolute after:inset-0"
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
  );

  return (
    <div className="relative w-full h-full flex flex-col gap-2">
      <a className="absolute inset-0" aria-hidden tabIndex={-1} href={market.href} />

      {/* Mobile header */}
      <div className="lg:hidden">
        <Header />
      </div>

      <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
        {/* Left column */}
        <div className="relative flex flex-col gap-4 lg:w-[40%] lg:justify-between">
          {/* Desktop header */}
          <div className="hidden lg:block">
            <Header />
          </div>

          {/* Team buttons */}
          <div className="flex flex-col justify-end lg:flex-initial lg:justify-start gap-3">
            <div className="flex gap-2">
              <a
                className="group relative flex-1 h-14 rounded-[8px] px-4 flex items-center justify-center overflow-hidden transition-colors min-w-0"
                href={market.team1.href}
                style={
                  {
                    "--team-color": market.team1.color,
                    backgroundColor: `color-mix(in srgb, ${market.team1.color} 10%, transparent)`,
                  } as React.CSSProperties
                }
              >
                <span
                  className="text-lg font-semibold z-10 truncate transition group-hover:text-white"
                  style={{ color: market.team1.color }}
                >
                  {market.team1.name}
                </span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition rounded-[8px]"
                  style={{ backgroundColor: market.team1.color }}
                />
              </a>
              <a
                className="group relative flex-1 h-14 rounded-[8px] px-4 flex items-center justify-center overflow-hidden transition-colors min-w-0"
                href={market.team2.href}
                style={{
                  backgroundColor: `color-mix(in srgb, ${market.team2.color} 10%, transparent)`,
                }}
              >
                <span
                  className="text-lg font-semibold z-10 truncate transition group-hover:text-white"
                  style={{ color: market.team2.color }}
                >
                  {market.team2.name}
                </span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition rounded-[8px]"
                  style={{ backgroundColor: market.team2.color }}
                />
              </a>
            </div>
          </div>

          {/* Comments feed */}
          <div
            className="h-full overflow-hidden relative"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0px, black 40px, black 100%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0px, black 40px, black 100%)",
            }}
          >
            <ScrollingCommentsFeed items={market.comments} />
          </div>
        </div>

        {/* Right: matchup visual + chart */}
        <div className="relative flex-1 min-h-0 flex flex-col justify-center gap-3 h-full">
          {/* Score display */}
          <div className="flex flex-col items-center">
            <div className="flex justify-center gap-10 items-end">
              {/* Team 1 */}
              <div className="flex flex-1 min-w-0 flex-col items-center gap-3">
                {market.team1.logoUrl ? (
                  <div className="relative size-12 rounded-md overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={market.team1.logoUrl}
                      alt={market.team1.name}
                      className="object-contain w-full h-full"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div
                    className="size-12 rounded-md flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: market.team1.color }}
                  >
                    {market.team1.name.slice(0, 2)}
                  </div>
                )}
                <span className="block w-full text-center leading-tight text-foreground font-medium break-normal text-sm sm:text-base">
                  {market.team1.name}
                </span>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center gap-3 w-35">
                <div className="flex flex-col items-center gap-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[2rem] font-medium tabular-nums">
                        {market.score?.team1 ?? "–"}
                      </span>
                    </div>
                    <span className="w-3 h-1 rounded-full bg-muted mb-5" />
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[2rem] font-medium tabular-nums">
                        {market.score?.team2 ?? "–"}
                      </span>
                    </div>
                  </div>

                  {market.isLive && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-500 whitespace-nowrap mb-0.5">
                      <span className="uppercase">Live</span>
                      <div className="relative flex items-center justify-center shrink-0">
                        <div className="size-1.25 rounded-full bg-red-500 relative z-10" />
                        <div className="absolute -inset-px size-1.75 rounded-full bg-red-500 opacity-75 animate-ping" />
                      </div>
                      {market.gameInfo && (
                        <span className="font-medium">{market.gameInfo}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Team 2 */}
              <div className="flex flex-1 min-w-0 flex-col items-center gap-3">
                {market.team2.logoUrl ? (
                  <div className="relative size-12 rounded-md overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={market.team2.logoUrl}
                      alt={market.team2.name}
                      className="object-contain w-full h-full"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div
                    className="size-12 rounded-md flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: market.team2.color }}
                  >
                    {market.team2.name.slice(0, 2)}
                  </div>
                )}
                <span className="block w-full text-center leading-tight text-foreground font-medium break-normal text-sm sm:text-base">
                  {market.team2.name}
                </span>
              </div>
            </div>
          </div>

          {/* Probability chart */}
          {market.chartData && market.chartData.length > 0 && (
            <div className="flex-1 min-h-0 hidden lg:block">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={market.chartData}
                  margin={{ top: 8, right: 4, left: 0, bottom: 20 }}
                >
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
                  <Line
                    type="monotone"
                    dataKey="team1"
                    stroke={market.team1.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    name={market.team1.name}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="team2"
                    stroke={market.team2.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                    name={market.team2.name}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* End probability labels */}
              <div className="flex justify-between px-2 mt-1">
                <span
                  className="text-sm font-semibold"
                  style={{ color: market.team1.color }}
                >
                  {market.team1.name} {(market.team1.probability * 100).toFixed(0)}%
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: market.team2.color }}
                >
                  {market.team2.name} {(market.team2.probability * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <MarketVolume volume={market.volume} isLive={market.isLive} />
    </div>
  );
}
