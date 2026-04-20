"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { DiscordSDK } from "@discord/embedded-app-sdk"
import { useDiscordActivityAuth } from "@/hooks/use-discord-activity-auth"

/**
 * Performs Discord Activity authentication on the client.
 *
 * Uses the embedded Discord SDK to sign in and refreshes the Next.js router
 * once authentication succeeds so server components can recognize the session.
 *
 * @param props.discordSdk - Initialized Discord SDK instance.
 * @param props.children - Content to render after authentication completes.
 * @returns Authenticated children or a loading/error state while signing in.
 */
function DiscordActivityAuth({
  discordSdk,
  children,
}: {
  discordSdk: DiscordSDK
  children: React.ReactNode
}) {
  const router = useRouter()
  const refreshed = useRef(false)
  const { status, error } = useDiscordActivityAuth({
    discordSdk,
    clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
    autoAuth: true,
  })

  useEffect(() => {
    if (status === "success" && !refreshed.current) {
      refreshed.current = true
      router.refresh()
    }
  }, [status, router])

  if (status === "success") {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {status === "error" ? (
        <p className="text-sm text-destructive">
          Discord sign-in failed: {error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Signing in with Discord…
        </p>
      )}
    </div>
  )
}

/**
 * Client-side gate for Discord Activity context detection.
 *
 * Renders children immediately on the server for SSR safety, then loads the
 * Discord SDK on the client and wraps the page in the auth gate when ready.
 *
 * @param props.children - Content to render inside the gate.
 * @returns Children rendered immediately or after Discord auth is ready.
 */
export default function DiscordActivityGate({
  children,
}: {
  children: React.ReactNode
}) {
  const [discordSdk, setDiscordSdk] = useState<DiscordSDK | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    import("@/lib/discord-sdk").then(({ getDiscordSdk }) => {
      setDiscordSdk(getDiscordSdk())
      setChecked(true)
    })
  }, [])

  if (!checked || !discordSdk) {
    return <>{children}</>
  }

  return (
    <DiscordActivityAuth discordSdk={discordSdk}>
      {children}
    </DiscordActivityAuth>
  )
}
