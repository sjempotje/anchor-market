"use client";

/**
 * Avatar component that renders either an image or a gradient-based avatar.
 */

interface AvatarOrGradientProps {
  username: string;
  avatarUrl?: string;
  avatarGradient?: { base: string; stops: string[] };
  size?: number;
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
        className="relative rounded-full overflow-hidden shrink-0"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={username}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  const gradientStops = avatarGradient?.stops ?? [];
  const backgroundImage = gradientStops
    .map(
      (color, i) =>
        `radial-gradient(at ${i === 0 ? "66% 77%" : i === 1 ? "29% 97%" : i === 2 ? "99% 86%" : "29% 88%"}, ${color} 0px, transparent 50%)`
    )
    .join(", ");

  return (
    <div
      className="rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: avatarGradient?.base ?? "#888",
        backgroundImage: backgroundImage || undefined,
      }}
    />
  );
}
