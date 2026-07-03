import { notFound } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import {
  IconArrowLeft,
  IconUsers,
  IconCalendar,
  IconChartBar,
  IconLock,
  IconWorld,
} from "@tabler/icons-react"
import { getServerApiClient, getSessionToken } from "@/lib/api/server"
import { apiFetch } from "@/lib/api/client"
import { auth } from "@/lib/auth"
import { normalizeMarket, formatVolume } from "@/lib/api/markets"
import { MarketGridCard } from "@/components/market-card/market-grid-card"
import { GroupActions } from "./group-actions"
import { CreateGroupMarketButton } from "./create-group-market-button"

interface GroupMembershipRow {
  id: string
  groupId: string
  userId: string
  joinedAt: string
}

async function getGroup(id: string): Promise<any | null> {
  try {
    const api = await getServerApiClient()
    const res = await api.groups.apiGroupsIdGet(id)
    const raw = res.data as unknown
    if (!raw || typeof raw !== "object") return null
    return raw as any
  } catch {
    return null
  }
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [group, session, token] = await Promise.all([
    getGroup(id),
    auth.api.getSession({ headers: await headers() }),
    getSessionToken(),
  ])

  if (!group) notFound()

  const userId = session?.user?.id ?? null

  // Members: the API restricts private groups' member lists to members/owner and
  // returns 403 otherwise — that failure just means we render the "join to see" state.
  const members = await apiFetch<GroupMembershipRow[]>(
    `/api/groups/${id}/members`,
    token
  ).catch(() => [] as GroupMembershipRow[])

  const isMember = members.some((m) => m.userId === userId)
  const isOwner = group.ownerId === userId

  // Group markets: the dedicated endpoint already enforces membership server-side,
  // returning [] for non-members of private groups.
  const rawMarkets =
    userId && token
      ? await (async () => {
          const api = await getServerApiClient()
          const res = await api.groupMarkets.apiGroupMarketsGet(id)
          return (res.data as unknown as any[]) ?? []
        })().catch(() => [])
      : []

  const normalized = rawMarkets.map(normalizeMarket)
  const totalVolume = normalized.reduce((sum, m) => sum + m.volumeAllTime, 0)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Link
        href="/groups"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft size={16} stroke={1.5} />
        Groups
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted">
          <IconUsers size={28} stroke={1.5} className="text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
            {userId && (
              <GroupActions
                groupId={group.id!}
                isMember={isMember}
                isOwner={isOwner}
              />
            )}
          </div>
          {group.description && (
            <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
          )}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            {group.isPrivate ? (
              <>
                <IconLock size={12} stroke={1.5} />
                <span>Private group</span>
              </>
            ) : (
              <>
                <IconWorld size={12} stroke={1.5} />
                <span>Public group</span>
              </>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <IconUsers size={15} stroke={1.5} />
              {members.length} member{members.length === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-1.5">
              <IconChartBar size={15} stroke={1.5} />
              {normalized.length} market{normalized.length === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-1.5">
              <IconCalendar size={15} stroke={1.5} />
              Created {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : ""}
            </span>
            {totalVolume > 0 && (
              <span className="font-medium text-foreground">
                {formatVolume(totalVolume)} total volume
              </span>
            )}
          </div>
          {group.isPrivate && isOwner && group.joinCode && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Join code:</span>
              <code className="font-mono font-semibold tracking-wide text-foreground">
                {group.joinCode}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* Markets section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Markets</h2>
          {isMember && userId && (
            <CreateGroupMarketButton
              groupId={group.id!}
              resolverCandidates={members
                .filter((m) => m.userId !== userId)
                .map((m) => ({ userId: m.userId, label: `${m.userId.slice(0, 8)}…` }))}
            />
          )}
        </div>

        {!isMember ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <IconLock size={36} stroke={1.5} className="text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">This group is private</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Join to see markets and participate.
              </p>
            </div>
          </div>
        ) : normalized.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <IconChartBar size={36} stroke={1.5} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No markets yet. Create the first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {normalized.map((market) => (
              <MarketGridCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </section>

      {/* Members */}
      {isMember && members.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Members</h2>
          <div className="flex flex-wrap gap-2">
            {members.map((membership: any) => (
              <div
                key={membership.id}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {(membership.userId ?? "?").slice(0, 1).toUpperCase()}
                </div>
                <span className="max-w-30 truncate text-foreground">
                  {membership.userId === group.ownerId
                    ? `${membership.userId?.slice(0, 8)}… (owner)`
                    : membership.userId?.slice(0, 8) + "…"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
