"use client";

import { useCallback, useEffect, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@workspace/ui/lib/utils";

import type { Market } from "./types";
import { GroupMarketPanel } from "./panels/group-market-panel";
import { MatchupMarketPanel } from "./panels/matchup-market-panel";
import { CryptoMarketPanel } from "./panels/crypto-market-panel";

/**
 * Individual market panel wrapper with slide animation.
 */

function MarketPanel({
  market,
  index,
  activeIndex,
}: {
  market: Market;
  index: number;
  activeIndex: number;
}) {
  const offset = index - activeIndex;
  const isVisible = offset === 0;

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
  );
}

export interface MarketCarouselProps {
  markets: Market[];
  className?: string;
}

const SLIDE_DURATION = 7000;

/**
 * Market carousel component with auto-advancing slides and navigation.
 */

export function MarketCarousel({ markets, className }: MarketCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const goTo = useCallback((i: number) => {
    setActiveIndex(i);
    setProgress(0);
  }, []);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + markets.length) % markets.length);
    setProgress(0);
  }, [markets.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % markets.length);
    setProgress(0);
  }, [markets.length]);

  useEffect(() => {
    if (markets.length <= 1) return;
    setProgress(0);
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / SLIDE_DURATION, 1);
      setProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setActiveIndex((i) => (i + 1) % markets.length);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeIndex, markets.length]);

  const prevMarket = markets[(activeIndex - 1 + markets.length) % markets.length]!;
  const nextMarket = markets[(activeIndex + 1) % markets.length]!;

  return (
    <div className={cn("flex flex-col lg:flex-1", className)}>
      <div className="rounded-[18px] border dark:border-border border-blue-600/10 bg-card shadow-[0_4px_16px_0_rgba(0,0,0,0.1)] shadow-blue-500/7 dark:shadow-none overflow-hidden relative min-h-120 lg:min-h-[min(480px,60vh)] lg:max-h-130 lg:flex-1">
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
        <div className="flex items-center justify-center md:justify-between md:h-10 pl-5 pr-0 mt-2">
          <div className="flex items-center gap-1.5">
            {markets.map((_, i) =>
              i === activeIndex ? (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden relative transition-all duration-300 h-1.5 w-8 cursor-pointer"
                  aria-label={`Market ${i + 1} (current)`}
                >
                  <div
                    className="absolute left-0 top-0 h-full w-full origin-left rounded-full bg-foreground"
                    style={{ transform: `scaleX(${progress})`, transition: "none" }}
                  />
                </button>
              ) : (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden relative transition-all duration-300 size-1.5 hover:bg-neutral-300 dark:hover:bg-neutral-500 cursor-pointer"
                  aria-label={`Go to market ${i + 1}`}
                />
              )
            )}
          </div>

          <div className="hidden md:flex items-center">
            <button
              onClick={prev}
              className="group flex items-center cursor-pointer outline-none py-2 pr-1.5 pl-2"
              aria-label="Previous market"
            >
              <div className="flex items-center justify-center overflow-hidden relative bg-neutral-50 dark:bg-neutral-900 border border-border group-hover:bg-neutral-100/70 dark:group-hover:bg-neutral-800 rounded-full group-active:scale-[0.98] transition-transform h-10 px-4 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-foreground">
                <IconChevronLeft size={12} className="text-muted-foreground shrink-0 mr-2" />
                <span className="text-sm font-medium whitespace-nowrap text-muted-foreground max-w-32 truncate">
                  {prevMarket.title}
                </span>
              </div>
            </button>
            <button
              onClick={next}
              className="group flex items-center cursor-pointer outline-none py-2 pl-1.5 pr-2"
              aria-label="Next market"
            >
              <div className="flex items-center justify-center overflow-hidden relative bg-neutral-50 dark:bg-neutral-900 border border-border group-hover:bg-neutral-100/70 dark:group-hover:bg-neutral-800 rounded-full group-active:scale-[0.98] transition-transform h-10 px-4 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-foreground">
                <span className="text-sm font-medium whitespace-nowrap text-muted-foreground max-w-40 truncate">
                  {nextMarket.title}
                </span>
                <IconChevronRight size={12} className="text-muted-foreground shrink-0 ml-2" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
