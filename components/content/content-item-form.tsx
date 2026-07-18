"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toDatetimeLocalValue, fromDatetimeLocalValue } from "@/lib/date"
import { PLATFORM_LABEL } from "@/lib/platform"
import type { ContentItem, Platform } from "@/lib/types"

export function ContentItemForm({
  defaultDate,
  initialTitle = "",
  initialNotes = "",
  submitLabel = "Guardar",
  onSubmit,
}: {
  defaultDate: Date
  initialTitle?: string
  initialNotes?: string
  submitLabel?: string
  onSubmit: (input: Omit<ContentItem, "id" | "createdAt">) => void
}) {
  const [title, setTitle] = useState(initialTitle)
  const [platform, setPlatform] = useState<Platform>("instagram")
  const [scheduledAt, setScheduledAt] = useState(
    toDatetimeLocalValue(defaultDate.toISOString())
  )
  const [notes, setNotes] = useState(initialNotes)

  function save() {
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      platform,
      scheduledAt: fromDatetimeLocalValue(scheduledAt),
      status: "scheduled",
      notes: notes.trim(),
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ci-title">Titulo</Label>
        <Input
          id="ci-title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="De que va el video"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label>Plataforma</Label>
          <Select
            value={platform}
            onValueChange={(v) => setPlatform(v as Platform)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {PLATFORM_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="ci-date">Fecha y hora</Label>
          <Input
            id="ci-date"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ci-notes">Notas</Label>
        <Textarea
          id="ci-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      <Button onClick={save} disabled={!title.trim()}>
        {submitLabel}
      </Button>
    </div>
  )
}
