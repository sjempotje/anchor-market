"use client"

import { useCallback, useEffect, useState } from "react"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { cn } from "@workspace/ui/lib/utils"

import type { Market } from "./types"
import { GroupMarketPanel } from "./panels/group-market-panel"
import { MatchupMarketPanel } from "./panels/matchup-market-panel"
import { CryptoMarketPanel } from "./panels/crypto-market-panel"

function MarketPanel({
  market,
  index,
  activeIndex,
}: {
  market: Market
  index: number
  activeIndex: number
}) {
  const offset = index - activeIndex
  const isVisible = offset === 0

  return (
    <div
      className="absolute inset-0 p-5 pb-4"
      style={{
        transform: `translateX(${offset * 100}%)`,
        transition: "transform 500ms cubic-bezier(0.32, 0.72, 0, 1)",
      }}
      aria-hidden={!isVisible}
      {...(!isVisible ? { inert: true } : {})}
    >
      {market.type === "group" && <GroupMarketPanel market={market} />}
      {market.type === "matchup" && <MatchupMarketPanel market={market} />}
      {market.type === "crypto" && <CryptoMarketPanel market={market} />}
    </div>
  )
}

export interface MarketCarouselProps {
  markets: Market[]
  className?: string
}

const SLIDE_DURATION = 7000

export function MarketCarousel({ markets, className }: MarketCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  // Key incremented on each slide change to restart the CSS animation
  const [animKey, setAnimKey] = useState(0)

  const advance = useCallback(() => {
    setActiveIndex((i) => (i + 1) % markets.length)
    setAnimKey((k) => k + 1)
  }, [markets.length])

  const goTo = useCallback((i: number) => {
    setActiveIndex(i)
    setAnimKey((k) => k + 1)
  }, [])

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + markets.length) % markets.length)
    setAnimKey((k) => k + 1)
  }, [markets.length])

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % markets.length)
    setAnimKey((k) => k + 1)
  }, [markets.length])

  useEffect(() => {
    if (markets.length <= 1) return
    const id = setTimeout(advance, SLIDE_DURATION)
    return () => clearTimeout(id)
  }, [animKey, markets.length, advance])

  const prevMarket =
    markets[(activeIndex - 1 + markets.length) % markets.length]!
  const nextMarket = markets[(activeIndex + 1) % markets.length]!

  return (
    <div className={cn("flex flex-col lg:flex-1", className)}>
      <div className="relative min-h-120 overflow-hidden rounded-[18px] border border-blue-600/10 bg-card shadow-[0_4px_16px_0_rgba(0,0,0,0.1)] shadow-blue-500/7 lg:max-h-130 lg:min-h-[min(480px,60vh)] lg:flex-1 dark:border-border dark:shadow-none">
        <div className="absolute inset-0 overflow-hidden">
          {markets.map((market, i) => (
            <MarketPanel
              key={market.id}
              market={market}
              index={i}
              activeIndex={activeIndex}
            />
          ))}
        </div>
      </div>

      {markets.length > 1 && (
        <div className="mt-2 flex items-center justify-center pr-0 pl-5 md:h-10 md:justify-between">
          <div className="flex items-center gap-1.5">
            {markets.map((_, i) =>
              i === activeIndex ? (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="relative h-1.5 w-8 cursor-pointer overflow-hidden rounded-full bg-neutral-200 transition-all duration-300 dark:bg-neutral-700"
                  aria-label={`Market ${i + 1} (current)`}
                >
                  <div
                    key={animKey}
                    className="absolute top-0 left-0 h-full w-full origin-left rounded-full bg-foreground"
                    style={{
                      animation: `progress-fill ${SLIDE_DURATION}ms linear forwards`,
                    }}
                  />
                </button>
              ) : (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="relative size-1.5 cursor-pointer overflow-hidden rounded-full bg-neutral-200 transition-all duration-300 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-500"
                  aria-label={`Go to market ${i + 1}`}
                />
              )
            )}
          </div>

          <div className="hidden items-center md:flex">
            <button
              onClick={prev}
              className="group flex cursor-pointer items-center py-2 pr-1.5 pl-2 outline-none"
              aria-label="Previous market"
            >
              <div className="relative flex h-10 items-center justify-center overflow-hidden rounded-full border border-border bg-neutral-50 px-4 transition-transform group-hover:bg-neutral-100/70 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-foreground group-active:scale-[0.98] dark:bg-neutral-900 dark:group-hover:bg-neutral-800">
                <IconChevronLeft
                  size={12}
                  className="mr-2 shrink-0 text-muted-foreground"
                />
                <span className="max-w-32 truncate text-sm font-medium whitespace-nowrap text-muted-foreground">
                  {prevMarket.title}
                </span>
              </div>
            </button>
            <button
              onClick={next}
              className="group flex cursor-pointer items-center py-2 pr-2 pl-1.5 outline-none"
              aria-label="Next market"
            >
              <div className="relative flex h-10 items-center justify-center overflow-hidden rounded-full border border-border bg-neutral-50 px-4 transition-transform group-hover:bg-neutral-100/70 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-foreground group-active:scale-[0.98] dark:bg-neutral-900 dark:group-hover:bg-neutral-800">
                <span className="max-w-40 truncate text-sm font-medium whitespace-nowrap text-muted-foreground">
                  {nextMarket.title}
                </span>
                <IconChevronRight
                  size={12}
                  className="ml-2 shrink-0 text-muted-foreground"
                />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
