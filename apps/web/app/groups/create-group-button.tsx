"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconPlus, IconLoader2 } from "@tabler/icons-react"
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
import { Switch } from "@workspace/ui/components/switch"
import { Textarea } from "@workspace/ui/components/textarea"
import { createGroup } from "./actions"

interface CreateGroupButtonProps {
  variant?: "default" | "outline"
}

export function CreateGroupButton({ variant = "default" }: CreateGroupButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await createGroup({
        name: name.trim(),
        description: description.trim() || null,
        isPrivate,
      })
      if (!result.ok) {
        setError(result.error ?? "Failed to create group. Please try again.")
        return
      }
      setOpen(false)
      setName("")
      setDescription("")
      if (result.groupId) {
        router.push(`/groups/${result.groupId}`)
      } else {
        router.refresh()
      }
    } catch {
      setError("Failed to create group. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className="gap-1.5">
          <IconPlus size={16} stroke={1.5} />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="group-name">Name</Label>
            <Input
              id="group-name"
              placeholder="My Prediction Group"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="group-desc">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea
              id="group-desc"
              placeholder="What is this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div>
              <Label htmlFor="group-private">Private group</Label>
              <p className="text-xs text-muted-foreground">
                Requires a join code. A code is generated once you create the group.
              </p>
            </div>
            <Switch id="group-private" checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading && <IconLoader2 size={15} className="mr-1.5 animate-spin" />}
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
