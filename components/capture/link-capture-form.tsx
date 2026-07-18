"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PlatformBadge } from "@/components/calendar/platform-badge"
import { addInspirationLink } from "@/lib/store"
import { detectPlatform } from "@/lib/platform"

export function LinkCaptureForm({
  onSaved,
  contentItemId = null,
}: {
  onSaved: () => void
  contentItemId?: string | null
}) {
  const [url, setUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [tagsInput, setTagsInput] = useState("")

  const platform = useMemo(() => detectPlatform(url), [url])

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setUrl(text)
    } catch {
      // clipboard permission denied or unavailable; user can paste manually
    }
  }

  function save() {
    if (!url.trim()) return
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    addInspirationLink({
      url: url.trim(),
      platform,
      notes: notes.trim(),
      tags,
      contentItemId,
    })
    setUrl("")
    setNotes("")
    setTagsInput("")
    onSaved()
  }

  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="link-url">Link del video</Label>
        <div className="flex gap-2">
          <Input
            id="link-url"
            autoFocus
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={pasteFromClipboard}>
            Pegar
          </Button>
        </div>
        {platform && (
          <div>
            <PlatformBadge platform={platform} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="link-notes">Notas (opcional)</Label>
        <Textarea
          id="link-notes"
          placeholder="Por que te gusto, que se puede recrear..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="link-tags">Tags (separados por coma)</Label>
        <Input
          id="link-tags"
          placeholder="transiciones, outfit"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </div>
      <Button onClick={save} disabled={!url.trim()}>
        Guardar link
      </Button>
    </div>
  )
}
