"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getServerApiClient } from "@/lib/api/server"

export interface CreateGroupInput {
  name: string
  description: string | null
  isPrivate: boolean
}

export interface CreateGroupResult {
  ok: boolean
  groupId?: string
  error?: string
}

function extractId(res: unknown): string | undefined {
  const locationHeader = (res as { headers?: { location?: string } }).headers?.location
  return locationHeader?.split("/").pop()
}

function extractError(e: unknown, fallback: string): string {
  const detail = (
    e as { response?: { data?: { error?: string; errors?: Record<string, string[]> } } }
  ).response?.data
  return (
    detail?.error ??
    (detail?.errors ? Object.values(detail.errors).flat()[0] : undefined) ??
    fallback
  )
}

export async function createGroup(input: CreateGroupInput): Promise<CreateGroupResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated" }
  }

  try {
    const api = await getServerApiClient()
    const res = await api.groups.apiGroupsPost({
      name: input.name,
      description: input.description,
      ownerId: session.user.id,
      isPrivate: input.isPrivate,
    })
    return { ok: true, groupId: extractId(res) }
  } catch (e) {
    return { ok: false, error: extractError(e, "Failed to create group") }
  }
}

export interface JoinGroupResult {
  ok: boolean
  error?: string
}

export async function joinGroup(groupId: string, joinCode?: string): Promise<JoinGroupResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated" }
  }

  try {
    const api = await getServerApiClient()
    await api.groups.apiGroupsIdJoinPost(groupId, { joinCode: joinCode || undefined })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: extractError(e, "Failed to join group") }
  }
}

export async function leaveGroup(groupId: string): Promise<JoinGroupResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated" }
  }

  try {
    const api = await getServerApiClient()
    await api.groups.apiGroupsIdLeaveDelete(groupId)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: extractError(e, "Failed to leave group") }
  }
}

export interface CreateGroupMarketInput {
  groupId: string
  title: string
  description: string
  resolutionDeadline: string
  outcomeTitles: string[]
  resolverId: string
}

export interface CreateGroupMarketResult {
  ok: boolean
  marketId?: string
  error?: string
}

export async function createGroupMarket(
  input: CreateGroupMarketInput
): Promise<CreateGroupMarketResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated" }
  }

  try {
    const api = await getServerApiClient()
    const res = await api.groupMarkets.apiGroupMarketsPost({
      groupId: input.groupId,
      creatorId: session.user.id,
      title: input.title,
      description: input.description,
      resolutionDeadline: input.resolutionDeadline,
      outcomeTitles: input.outcomeTitles,
      resolverId: input.resolverId,
    } as any)
    return { ok: true, marketId: extractId(res) }
  } catch (e) {
    return { ok: false, error: extractError(e, "Failed to create market") }
  }
}

export interface ResolveGroupMarketResult {
  ok: boolean
  error?: string
}

/**
 * Resolves a group market. The backend requires the resolver to be a group member
 * other than the market's creator — a market creator can never resolve their own
 * market, by design, so someone else always has to weigh in.
 */
export async function resolveGroupMarket(
  marketId: string,
  winningOutcomeId: string
): Promise<ResolveGroupMarketResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated" }
  }

  try {
    const api = await getServerApiClient()
    await api.groupMarkets.apiGroupMarketsIdResolvePost(marketId, {
      marketId,
      winningOutcomeId,
      resolverId: session.user.id,
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: extractError(e, "Failed to resolve market") }
  }
}
