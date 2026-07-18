"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ContentItemForm } from "@/components/content/content-item-form"
import { promoteIdea } from "@/lib/store"
import type { Idea } from "@/lib/types"

export function PromoteIdeaSheet({ idea }: { idea: Idea }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Promover a calendario
      </Button>
      <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Promover idea</SheetTitle>
          <SheetDescription>
            Se crea un item de contenido en el calendario a partir de esta idea.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <ContentItemForm
            defaultDate={new Date()}
            initialTitle={idea.body.slice(0, 80)}
            submitLabel="Crear en calendario"
            onSubmit={(input) => {
              promoteIdea(idea.id, input)
              setOpen(false)
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
