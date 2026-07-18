"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toDatetimeLocalValue, fromDatetimeLocalValue } from "@/lib/date"
import type { Meeting } from "@/lib/types"

export function MeetingForm({
  defaultDate,
  onSubmit,
}: {
  defaultDate: Date
  onSubmit: (input: Omit<Meeting, "id" | "createdAt">) => void
}) {
  const [title, setTitle] = useState("")
  const [scheduledAt, setScheduledAt] = useState(
    toDatetimeLocalValue(defaultDate.toISOString())
  )
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")

  function save() {
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      scheduledAt: fromDatetimeLocalValue(scheduledAt),
      location: location.trim(),
      notes: notes.trim(),
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mt-title">Titulo</Label>
        <Input
          id="mt-title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Junta de contenido"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="mt-date">Fecha y hora</Label>
          <Input
            id="mt-date"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="mt-location">Lugar</Label>
          <Input
            id="mt-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Zoom, oficina..."
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mt-notes">Notas</Label>
        <Textarea
          id="mt-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      <Button onClick={save} disabled={!title.trim()}>
        Guardar junta
      </Button>
    </div>
  )
}
