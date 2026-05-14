"use client"

/**
 * Favicon icon component that displays a website's favicon.
 */

export function FaviconIcon({ domain }: { domain: string }) {
  return (
    <div className="size-3 shrink-0 overflow-hidden rounded-xs">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/proxy/favicon?domain=${encodeURIComponent(domain)}&sz=64`}
        alt=""
        className="size-3 object-cover"
        loading="eager"
      />
    </div>
  )
}
