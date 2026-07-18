"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PlatformBadge } from "@/components/calendar/platform-badge"
import { addInspirationLink } from "@/lib/store"
import { detectPlatform } from "@/lib/platform"
import { useTranslations } from "@/lib/i18n/use-translations"

export function LinkCaptureForm({
  onSaved,
  contentItemId = null,
}: {
  onSaved: () => void
  contentItemId?: string | null
}) {
  const { t } = useTranslations()
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
      .map((tag) => tag.trim())
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
        <Label htmlFor="link-url">{t("capture.linkLabel")}</Label>
        <div className="flex gap-2">
          <Input
            id="link-url"
            autoFocus
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={pasteFromClipboard}>
            {t("capture.paste")}
          </Button>
        </div>
        {platform && (
          <div>
            <PlatformBadge platform={platform} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="link-notes">{t("capture.notesOptional")}</Label>
        <Textarea
          id="link-notes"
          placeholder={t("capture.notesPlaceholder")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="link-tags">{t("capture.tagsLabel")}</Label>
        <Input
          id="link-tags"
          placeholder={t("capture.tagsPlaceholder")}
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </div>
      <Button onClick={save} disabled={!url.trim()}>
        {t("capture.saveLink")}
      </Button>
    </div>
  )
}
