"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconLoader2, IconPlus, IconTrash } from "@tabler/icons-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { createMarket } from "./actions"

export function CreateMarketForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [outcomes, setOutcomes] = useState(["Yes", "No"])

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
  const canSubmit = title.trim() && deadline && validOutcomes.length >= 2

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const result = await createMarket({
        title: title.trim(),
        description: description.trim(),
        resolutionDeadline: new Date(deadline).toISOString(),
        outcomeTitles: validOutcomes,
      })

      if (!result.ok) {
        setError(result.error ?? "Failed to create market. Please try again.")
        return
      }

      setTitle("")
      setDescription("")
      setDeadline("")
      setOutcomes(["Yes", "No"])

      if (result.marketId) {
        router.push(`/markets/${result.marketId}`)
      } else {
        router.push("/")
      }
    } catch (err) {
      setError("Failed to create market. Please try again.")
      console.error("Failed to create market:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Question</Label>
        <Input
          id="title"
          placeholder="Will Bitcoin reach $100k by end of 2025?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={300}
          required
        />
        <p className="text-xs text-muted-foreground">{title.length}/300</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
        <Textarea
          id="description"
          placeholder="Provide context or resolution criteria..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">{description.length}/2000</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="deadline">Resolution Deadline</Label>
        <Input
          id="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          required
        />
        <p className="text-xs text-muted-foreground">When this market should be resolved</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Outcomes <span className="text-xs text-muted-foreground">(minimum 2)</span></Label>
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
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !canSubmit}>
          {loading && <IconLoader2 size={15} className="mr-1.5 animate-spin" />}
          Create Market
        </Button>
      </div>
    </form>
  )
}
