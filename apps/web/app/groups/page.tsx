import Link from "next/link"
import { headers } from "next/headers"
import { IconUsers, IconLock, IconWorld } from "@tabler/icons-react"
import { getServerApiClient } from "@/lib/api/server"
import { auth } from "@/lib/auth"
import { CreateGroupButton } from "./create-group-button"

async function getGroups(): Promise<any[]> {
  try {
    const api = await getServerApiClient()
    const res = await api.groups.apiGroupsGet()
    const raw = res.data as unknown
    if (!Array.isArray(raw)) return []
    return raw as any[]
  } catch {
    return []
  }
}

export default async function GroupsPage() {
  const [groups, session] = await Promise.all([
    getGroups(),
    auth.api.getSession({ headers: await headers() }),
  ])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Groups</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Private prediction market groups for friends and communities
          </p>
        </div>
        <div className="flex items-center gap-3">
          {groups.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {groups.length} group{groups.length === 1 ? "" : "s"}
            </span>
          )}
          {session && <CreateGroupButton />}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
          <IconUsers size={40} stroke={1.5} className="text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-foreground">No groups yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a group to start predicting with your community.
            </p>
          </div>
          {session && <CreateGroupButton variant="outline" />}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}

function GroupCard({ group }: { group: any }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-foreground/20 hover:bg-accent/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <IconUsers size={20} stroke={1.5} className="text-muted-foreground" />
        </div>
        {group.isPrivate ? (
          <span className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <IconLock size={11} stroke={1.5} />
            Private
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <IconWorld size={11} stroke={1.5} />
            Public
          </span>
        )}
      </div>

      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold text-foreground group-hover:underline">
          {group.name}
        </h2>
        {group.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {group.description}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : ""}
        </span>
      </div>
    </Link>
  )
}
