"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconLink, IconLoader2, IconUserPlus, IconUserMinus, IconCheck, IconCopy } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { joinGroup, leaveGroup } from "../actions"

interface GroupActionsProps {
  groupId: string
  isMember: boolean
  isOwner: boolean
}

export function GroupActions({ groupId, isMember, isOwner }: GroupActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [joinError, setJoinError] = useState<string | null>(null)

  async function handleJoin(code?: string) {
    setLoading(true)
    setJoinError(null)
    try {
      const result = await joinGroup(groupId, code || joinCode)
      if (!result.ok) {
        setJoinError(result.error ?? "Failed to join group")
      } else {
        setJoinOpen(false)
        setJoinCode("")
        router.refresh()
      }
    } catch {
      setJoinError("Failed to join group")
    } finally {
      setLoading(false)
    }
  }

  async function handleLeave() {
    setLoading(true)
    try {
      await leaveGroup(groupId)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleCopyInvite() {
    const url = `${window.location.origin}/groups/${groupId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      {isOwner && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleCopyInvite}
        >
          {copied ? (
            <>
              <IconCheck size={15} stroke={1.5} />
              Copied!
            </>
          ) : (
            <>
              <IconLink size={15} stroke={1.5} />
              Copy invite link
            </>
          )}
        </Button>
      )}

      {!isOwner && (
        isMember ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={handleLeave}
            disabled={loading}
          >
            {loading ? (
              <IconLoader2 size={15} className="animate-spin" />
            ) : (
              <IconUserMinus size={15} stroke={1.5} />
            )}
            Leave
          </Button>
        ) : (
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                {loading ? (
                  <IconLoader2 size={15} className="animate-spin" />
                ) : (
                  <IconUserPlus size={15} stroke={1.5} />
                )}
                Join Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Join Group</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="join-code">
                    Join Code <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="join-code"
                    placeholder="Enter invite code if required"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to join public groups
                  </p>
                </div>
                {joinError && <p className="text-sm text-destructive">{joinError}</p>}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setJoinOpen(false)
                      setJoinCode("")
                      setJoinError(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleJoin()}
                    disabled={loading}
                  >
                    {loading && <IconLoader2 size={15} className="mr-1.5 animate-spin" />}
                    Join Group
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )
      )}
    </div>
  )
}
