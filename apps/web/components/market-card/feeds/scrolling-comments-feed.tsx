"use client"

import { AvatarOrGradient } from "../avatar-or-gradient"

/**
 * Auto-scrolling comments feed with vertical marquee animation.
 */

interface Comment {
  username: string
  text: string
  avatarUrl?: string
  avatarGradient?: { base: string; stops: string[] }
  href: string
}

export function ScrollingCommentsFeed({ items }: { items: Comment[] }) {
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
          <a key={i} className="block shrink-0 py-2" href={item.href}>
            <div className="flex items-start gap-1.5">
              <AvatarOrGradient
                username={item.username}
                avatarUrl={item.avatarUrl}
                avatarGradient={item.avatarGradient}
                size={20}
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-sm font-normal text-foreground">
                  {item.username}
                </p>
                <p className="line-clamp-2 text-xs font-normal text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
