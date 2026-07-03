"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconLoader2, IconX } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { removeGroupMember } from "../actions"

interface MemberRowProps {
  groupId: string
  userId: string
  isOwner: boolean
  canRemove: boolean
}

export function MemberRow({ groupId, userId, isOwner, canRemove }: MemberRowProps) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  async function handleRemove() {
    setRemoving(true)
    setError(null)
    try {
      const result = await removeGroupMember(groupId, userId)
      if (!result.ok) {
        setError(result.error ?? "Failed to remove member")
        setRemoving(false)
        return
      }
      setOpen(false)
      router.refresh()
    } catch {
      setError("Failed to remove member")
      setRemoving(false)
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pr-1.5 pl-3 text-sm">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {(userId ?? "?").slice(0, 1).toUpperCase()}
      </div>
      <span className="max-w-30 truncate text-foreground">
        {isOwner ? `${userId?.slice(0, 8)}… (owner)` : userId?.slice(0, 8) + "…"}
      </span>
      {canRemove && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <IconX size={13} stroke={1.5} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove member?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove this member from the group. They can rejoin later
                unless the group is private and requires a join code.
                {error && <span className="mt-2 block text-destructive">{error}</span>}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemove}
                disabled={removing}
                className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              >
                {removing ? (
                  <IconLoader2 size={15} className="mr-1.5 animate-spin" />
                ) : null}
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
