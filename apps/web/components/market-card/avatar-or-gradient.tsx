"use client"

/**
 * Avatar component that renders either an image or a gradient-based avatar.
 */

interface AvatarOrGradientProps {
  username: string
  avatarUrl?: string
  avatarGradient?: { base: string; stops: string[] }
  size?: number
}

export function AvatarOrGradient({
  username,
  avatarUrl,
  avatarGradient,
  size = 20,
}: AvatarOrGradientProps) {
  if (avatarUrl) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={username}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  const gradientStops = avatarGradient?.stops ?? []
  const backgroundImage = gradientStops
    .map(
      (color, i) =>
        `radial-gradient(at ${i === 0 ? "66% 77%" : i === 1 ? "29% 97%" : i === 2 ? "99% 86%" : "29% 88%"}, ${color} 0px, transparent 50%)`
    )
    .join(", ")

  return (
    <div
      className="shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: avatarGradient?.base ?? "#888",
        backgroundImage: backgroundImage || undefined,
      }}
    />
  )
}
