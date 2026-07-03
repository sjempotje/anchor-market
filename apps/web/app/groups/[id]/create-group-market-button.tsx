"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconPlus, IconLoader2, IconTrash } from "@tabler/icons-react"
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
import { NativeSelect, NativeSelectOption } from "@workspace/ui/components/native-select"
import { Textarea } from "@workspace/ui/components/textarea"
import { createGroupMarket } from "../actions"

export interface ResolverCandidate {
  userId: string
  label: string
}

interface CreateGroupMarketButtonProps {
  groupId: string
  /** Other group members eligible to be picked as the resolver — the creator can't resolve their own market. */
  resolverCandidates: ResolverCandidate[]
}

export function CreateGroupMarketButton({ groupId, resolverCandidates }: CreateGroupMarketButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [outcomes, setOutcomes] = useState(["Yes", "No"])
  const [resolverId, setResolverId] = useState("")

  function addOutcome() {
    setOutcomes((prev) => [...prev, ""])
  }

  function removeOutcome(i: number) {
    setOutcomes((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateOutcome(i: number, value: string) {
    setOutcomes((prev) => prev.map((o, idx) => (idx === i ? value : o)))
  }

  const validOutcomes = outcomes.filter((o) => o.trim().length > 0)
  const canSubmit = title.trim() && deadline && validOutcomes.length >= 2 && !!resolverId

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const result = await createGroupMarket({
        groupId,
        title: title.trim(),
        description: description.trim(),
        resolutionDeadline: new Date(deadline).toISOString(),
        outcomeTitles: validOutcomes,
        resolverId,
      })
      if (!result.ok) {
        setError(result.error ?? "Failed to create market. Please try again.")
        return
      }
      setOpen(false)
      setTitle("")
      setDescription("")
      setDeadline("")
      setOutcomes(["Yes", "No"])
      setResolverId("")
      router.refresh()
    } catch {
      setError("Failed to create market. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <IconPlus size={16} stroke={1.5} />
          New Market
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Group Market</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gm-title">Question</Label>
            <Input
              id="gm-title"
              placeholder="Will Bitcoin reach $100k by end of 2025?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={300}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gm-desc">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea
              id="gm-desc"
              placeholder="Provide context or resolution criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gm-deadline">Resolution Deadline</Label>
            <Input
              id="gm-deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gm-resolver">Resolver</Label>
            <NativeSelect
              id="gm-resolver"
              value={resolverId}
              onChange={(e) => setResolverId(e.target.value)}
              required
            >
              <NativeSelectOption value="" disabled>
                Who will resolve this market?
              </NativeSelectOption>
              {resolverCandidates.map((c) => (
                <NativeSelectOption key={c.userId} value={c.userId}>
                  {c.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <p className="text-xs text-muted-foreground">
              This person decides the outcome — you can&apos;t resolve your own market.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Outcomes <span className="text-xs text-muted-foreground">(min 2)</span></Label>
            {outcomes.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder={`Outcome ${i + 1}`}
                  value={o}
                  onChange={(e) => updateOutcome(i, e.target.value)}
                  maxLength={200}
                />
                {outcomes.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOutcome(i)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove outcome"
                  >
                    <IconTrash size={16} />
                  </button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start gap-1"
              onClick={addOutcome}
            >
              <IconPlus size={14} />
              Add outcome
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !canSubmit}>
              {loading && <IconLoader2 size={15} className="mr-1.5 animate-spin" />}
              Create Market
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
