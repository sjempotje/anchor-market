import { DiscordSDK, patchUrlMappings } from "@discord/embedded-app-sdk"

// Lazy singleton, created on first call, only on the client when frame_id is present.
// The DiscordSDK constructor reads frame_id from window.location.search and throws if it's missing.
let _sdk: DiscordSDK | null = null

export function getDiscordSdk(): DiscordSDK | null {
  if (typeof window === "undefined") return null
  if (_sdk) return _sdk

  const frameId = new URLSearchParams(window.location.search).get("frame_id")
  if (!frameId) return null

  // Remap Discord API calls through the Discord proxy so they work inside the iframe.
  patchUrlMappings([{ prefix: "/discord", target: "discord.com" }])

  _sdk = new DiscordSDK(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!)
  return _sdk
}
