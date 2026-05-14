"use client"

import { FaviconIcon } from "../favicon-icon"

/**
 * Auto-scrolling news feed with vertical marquee animation.
 */

interface NewsItem {
  source: string
  sourceDomain: string
  timeAgo: string
  headline: string
  href: string
}

export function ScrollingNewsFeed({ items }: { items: NewsItem[] }) {
  const doubled = [...items, ...items, ...items]
  return (
    <div
      className="relative h-full overflow-hidden"
      style={{
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0px, black 40px, black 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0px, black 40px, black 100%)",
      }}
    >
      <div className="flex shrink-0 animate-[marquee-vertical_25s_linear_infinite] flex-col will-change-transform hover:paused">
        {doubled.map((item, i) => (
          <a key={i} className="block shrink-0 py-2.5" href={item.href}>
            <div className="group flex flex-col gap-1.5">
              <div className="flex items-center">
                <div className="flex items-center gap-1.5">
                  <FaviconIcon domain={item.sourceDomain} />
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {item.source}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground/60">
                  {"・"}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground/60">
                  {item.timeAgo}
                </span>
              </div>
              <p className="line-clamp-2 text-sm font-normal text-foreground/70 transition-colors group-hover:text-foreground">
                {item.headline}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
