"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getServerApiClient } from "@/lib/api/server"

export interface PlaceOrderInput {
  marketId: string
  outcomeId: string
  side: 0 | 1
  price: number
  quantity: number
  expiresAt: string | null
}

export interface PlaceOrderResult {
  ok: boolean
  orderId?: string
  error?: string
}

export interface PlaceBetInput {
  marketId: string
  outcomeId: string
  amount: number
}

export interface PlaceBetResult {
  ok: boolean
  positionId?: string
  error?: string
}

export async function getWalletBalance(): Promise<number | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return null

  try {
    const api = await getServerApiClient()
    const res = await api.wallets.apiWalletsUserUserIdGet(session.user.id)
    const w = res.data as unknown as { availableBalance?: string; balance?: string }
    return Number.parseFloat(w.availableBalance ?? w.balance ?? "0") || 0
  } catch {
    return null
  }
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  return { ok: false, error: "Limit orders are not available in the simplified platform" }
}

export async function placeBet(input: PlaceBetInput): Promise<PlaceBetResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return { ok: false, error: "Not authenticated" }
    }

    const api = await getServerApiClient()
    const res = await api.positions.apiPositionsPost({
      marketId: input.marketId,
      outcomeId: input.outcomeId,
      amount: input.amount,
      userId: session.user.id,
    } as any)
    return { ok: true, positionId: res.data as unknown as string }
  } catch (e) {
    const detail = (
      e as { response?: { data?: { error?: string; errors?: Record<string, string[]> } } }
    ).response?.data
    const error =
      detail?.error ??
      (detail?.errors ? Object.values(detail.errors).flat()[0] : undefined) ??
      "Could not place bet"
    return { ok: false, error }
  }
}
