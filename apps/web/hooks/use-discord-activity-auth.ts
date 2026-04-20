"use client"

import { useEffect, useRef, useState } from "react"
import type { DiscordSDK, CommandResponse } from "@discord/embedded-app-sdk"

/**
 * The Discord SDK response shape for the `authenticate` command.
 */
type DiscordAuth = CommandResponse<"authenticate">

/**
 * The authenticated Discord user information returned from the server.
 */
type DiscordUser = {
  id: string
  name: string
  email: string
  image: string | null
}

/**
 * The full state machine for the Discord Activity authentication hook.
 */
type AuthState =
  | { status: "idle" }
  | { status: "pending" }
  | {
      status: "success"
      token: string
      user: DiscordUser
      discordAuth: DiscordAuth
    }
  | { status: "error"; error: string }

/**
 * Options accepted by the `useDiscordActivityAuth` hook.
 */
export interface UseDiscordActivityAuthOptions {
  /** The initialized Discord embedded SDK instance. */
  discordSdk: DiscordSDK

  /**
   * The public Discord OAuth client ID used for the authorization request.
   */
  clientId: string

  /**
   * The OAuth scopes requested from Discord. Defaults to the Activity app scopes.
   */
  scopes?: string[]

  /**
   * When true, the hook automatically begins authentication on mount.
   */
  autoAuth?: boolean
}

/**
 * Return values from `useDiscordActivityAuth`.
 */
export type UseDiscordActivityAuthResult = {
  status: AuthState["status"]
  user: DiscordUser | null
  token: string | null
  discordAuth: DiscordAuth | null
  error: string | null
  signIn: () => Promise<void>
}

/**
 * Payload returned by the server after exchanging a Discord OAuth code.
 */
type DiscordActivitySignInResponse = {
  token: string
  access_token: string
  user: DiscordUser
}

/**
 * React hook for authenticating a Discord Activity app inside an embedded client.
 *
 * This hook orchestrates the Discord embedded SDK and a server-side sign-in
 * endpoint to establish a local session and complete Activity authentication.
 *
 * The hook supports both manual sign-in and automatic sign-in on mount.
 *
 * @param options - Hook configuration options.
 * @returns An object containing the authentication status, user info, token,
 * error state, and a `signIn` callback to trigger authentication manually.
 *
 * @example
 * const { status, discordAuth, error, signIn } = useDiscordActivityAuth({
 *   discordSdk,
 *   clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
 * })
 */
export function useDiscordActivityAuth({
  discordSdk,
  clientId,
  scopes = [
    "identify",
    "email",
    "guilds",
    "guilds.members.read",
    "rpc.voice.read",
    "applications.commands",
  ],
  autoAuth = true,
}: UseDiscordActivityAuthOptions): UseDiscordActivityAuthResult {
  const [state, setState] = useState<AuthState>({ status: "idle" })
  /**
   * Tracks whether the automatic sign-in effect has already run.
   */
  const hasTriggered = useRef(false)

  /**
   * Initiates the Discord Activity sign-in flow.
   *
   * This performs SDK readiness, Discord OAuth authorization, server-side
   * session creation, and final client-side Discord Activity authentication.
   */
  const signIn = async () => {
    if (state.status === "pending" || state.status === "success") return
    console.log("Starting Discord Activity authentication flow...")

    setState({ status: "pending" })
    try {
      await discordSdk.ready()

      // open Discord's OAuth authorization flow and obtain a code.
      const { code } = await discordSdk.commands.authorize({
        client_id: clientId,
        response_type: "code",
        state: "",
        prompt: "none",
        scope: scopes as Parameters<
          typeof discordSdk.commands.authorize
        >[0]["scope"],
      })

      const res = await fetch("/api/auth/sign-in/discord-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          message?: string
        }
        throw new Error(
          body.message ?? `Request failed with status ${res.status}`
        )
      }

      const data = (await res.json()) as DiscordActivitySignInResponse

      const discordAuth = await discordSdk.commands.authenticate({
        access_token: data.access_token,
      })

      if (discordAuth == null) {
        throw new Error("Discord authenticate command returned null")
      }

      setState({
        status: "success",
        token: data.token,
        user: data.user,
        discordAuth,
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed"
      setState({ status: "error", error: message })
    }
  }

  useEffect(() => {
    if (!autoAuth || hasTriggered.current) return
    hasTriggered.current = true
    void signIn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    status: state.status,
    user: state.status === "success" ? state.user : null,
    token: state.status === "success" ? state.token : null,
    discordAuth: state.status === "success" ? state.discordAuth : null,
    error: state.status === "error" ? state.error : null,
    signIn,
  }
}
