"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addIdea } from "@/lib/store"

export function IdeaCaptureForm({ onSaved }: { onSaved: () => void }) {
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
        placeholder="Se me ocurrio que..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={5}
      />
      <Button onClick={save} disabled={!body.trim()}>
        Guardar idea
      </Button>
    </div>
  )
}
