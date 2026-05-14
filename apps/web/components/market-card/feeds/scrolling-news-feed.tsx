"use client";

import { FaviconIcon } from "../favicon-icon";

/**
 * Auto-scrolling news feed with vertical marquee animation.
 */

interface NewsItem {
  source: string;
  sourceDomain: string;
  timeAgo: string;
  headline: string;
  href: string;
}

export function ScrollingNewsFeed({ items }: { items: NewsItem[] }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div
      className="overflow-hidden relative h-full"
      style={{
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0px, black 40px, black 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0px, black 40px, black 100%)",
      }}
    >
      <div className="flex flex-col shrink-0 animate-[marquee-vertical_25s_linear_infinite] will-change-transform hover:paused">
        {doubled.map((item, i) => (
          <a
            key={i}
            className="block py-2.5 shrink-0"
            href={item.href}
          >
            <div className="flex flex-col gap-1.5 group">
              <div className="flex items-center">
                <div className="flex items-center gap-1.5">
                  <FaviconIcon domain={item.sourceDomain} />
                  <span className="text-xs font-normal text-muted-foreground truncate">
                    {item.source}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground/60 shrink-0">
                  {"・"}
                </span>
                <span className="text-xs text-muted-foreground/60 shrink-0">
                  {item.timeAgo}
                </span>
              </div>
              <p className="text-sm font-normal text-foreground/70 line-clamp-2 group-hover:text-foreground transition-colors">
                {item.headline}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
