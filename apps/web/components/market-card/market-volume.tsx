"use client";

import { IconRefresh } from "@tabler/icons-react";

/**
 * Market volume and metadata display component.
 */

export function MarketVolume({
  volume,
  endDate,
  isLive,
  resolutionType,
}: {
  volume: string;
  endDate?: string;
  isLive?: boolean;
  resolutionType?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {volume}
        {" Vol"}
      </p>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isLive && (
          <>
            <div className="flex items-center gap-1.5">
              <div className="relative flex items-center justify-center">
                <div className="size-1.75 rounded-full bg-red-500 relative z-10" />
                <div className="absolute -inset-px size-2.25 rounded-full bg-red-500 opacity-75 animate-ping" />
              </div>
              <span className="text-red-500 uppercase text-xs font-semibold">
                Live
              </span>
            </div>
            <span>·</span>
          </>
        )}
        {endDate && <span>Ends {endDate}</span>}
        {resolutionType && (
          <>
            {endDate && <span>·</span>}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <IconRefresh size={12} />
              <span>{resolutionType}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
