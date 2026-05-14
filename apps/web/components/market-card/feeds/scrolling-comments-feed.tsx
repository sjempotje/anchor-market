"use client";

import { AvatarOrGradient } from "../avatar-or-gradient";

/**
 * Auto-scrolling comments feed with vertical marquee animation.
 */

interface Comment {
  username: string;
  text: string;
  avatarUrl?: string;
  avatarGradient?: { base: string; stops: string[] };
  href: string;
}

export function ScrollingCommentsFeed({ items }: { items: Comment[] }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div
      className="h-full overflow-hidden relative"
      style={{
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0px, black 40px, black 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0px, black 40px, black 100%)",
      }}
    >
      <div className="flex flex-col shrink-0 animate-[marquee-vertical_25s_linear_infinite] will-change-transform hover:paused">
        {doubled.map((item, i) => (
          <a key={i} className="block py-2 shrink-0" href={item.href}>
            <div className="flex items-start gap-1.5">
              <AvatarOrGradient
                username={item.username}
                avatarUrl={item.avatarUrl}
                avatarGradient={item.avatarGradient}
                size={20}
              />
              <div className="min-w-0 flex flex-col gap-0.5">
                <p className="text-sm font-normal text-foreground">
                  {item.username}
                </p>
                <p className="text-xs font-normal text-muted-foreground line-clamp-2">
                  {item.text}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
