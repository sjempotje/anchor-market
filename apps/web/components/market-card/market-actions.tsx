"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { IconLink, IconBookmark } from "@tabler/icons-react";

/**
 * Market actions component with copy link and bookmark buttons.
 */

export function MarketActions({ title, href }: { title: string; href: string }) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}${href}`);
  };

  return (
    <div className="shrink-0 hidden md:flex relative z-10 gap-1 items-center">
      <TooltipProvider>
        <UITooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={handleCopyLink}
              aria-label={`Copy link for ${title}`}
            >
              <IconLink size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy link</TooltipContent>
        </UITooltip>
      </TooltipProvider>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
        aria-label="Add to favorites"
      >
        <IconBookmark size={18} />
      </Button>
    </div>
  );
}
