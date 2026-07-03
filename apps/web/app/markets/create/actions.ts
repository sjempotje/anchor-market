"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getServerApiClient } from "@/lib/api/server"

export interface CreateMarketInput {
  title: string
  description: string
  resolutionDeadline: string
  outcomeTitles: string[]
}

export interface CreateMarketResult {
  ok: boolean
  marketId?: string
  error?: string
}

export async function createMarket(input: CreateMarketInput): Promise<CreateMarketResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated" }
  }

  try {
    const api = await getServerApiClient()
    const res = await api.markets.apiMarketsPost({
      creatorId: session.user.id,
      title: input.title,
      description: input.description,
      resolutionDeadline: input.resolutionDeadline,
      outcomeTitles: input.outcomeTitles,
      scope: 0, // public
      groupId: undefined,
    } as any)

    const locationHeader = (res as unknown as { headers?: { location?: string } }).headers?.location
    const marketId = locationHeader?.split("/").pop()
    return { ok: true, marketId }
  } catch (e) {
    const detail = (
      e as { response?: { data?: { error?: string; errors?: Record<string, string[]> } } }
    ).response?.data
    const error =
      detail?.error ??
      (detail?.errors ? Object.values(detail.errors).flat()[0] : undefined) ??
      "Failed to create market"
    return { ok: false, error }
  }
}
