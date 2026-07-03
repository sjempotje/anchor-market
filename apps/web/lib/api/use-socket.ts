"use client"

import { useEffect, useRef } from "react"
import { authClient } from "@/lib/auth-client"
import { AnchorMarketSocket } from "./socket"

/**
 * Opens an authenticated {@link AnchorMarketSocket} for the lifetime of the
 * component and hands it to `setup` once connected so callers can register
 * subscriptions and handlers. The socket is torn down on unmount or when the
 * session token changes.
 *
 * @example
 * useMarketSocket((socket) => {
 *   socket.subscribe("trades", { marketId })
 *   socket.on("trade-executed", (m) => store.addTrade(m))
 * })
 */
export function useMarketSocket(
  setup: (socket: AnchorMarketSocket) => void
) {
  const { data: session } = authClient.useSession()
  const token = session?.session?.token as string | undefined
  const setupRef = useRef(setup)

  useEffect(() => {
    setupRef.current = setup
  })

  useEffect(() => {
    if (!token) return
    const socket = new AnchorMarketSocket(token)
    socket.connect()
    setupRef.current(socket)
    return () => socket.close()
  }, [token])
}
