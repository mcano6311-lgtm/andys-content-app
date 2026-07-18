"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addIdea } from "@/lib/store"
import { useTranslations } from "@/lib/i18n/use-translations"

export function IdeaCaptureForm({ onSaved }: { onSaved: () => void }) {
  const { t } = useTranslations()
  const [body, setBody] = useState("")

  function save() {
    if (!body.trim()) return
    addIdea(body.trim())
    setBody("")
    onSaved()
  }

  return (
    <div className="flex flex-col gap-3 py-4">
      <Textarea
        autoFocus
        placeholder={t("capture.ideaPlaceholder")}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={5}
      />
      <Button onClick={save} disabled={!body.trim()}>
        {t("capture.saveIdea")}
      </Button>
    </div>
  )
}
