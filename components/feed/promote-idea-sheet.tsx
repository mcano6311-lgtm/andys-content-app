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
import { useTranslations } from "@/lib/i18n/use-translations"

export function PromoteIdeaSheet({ idea }: { idea: Idea }) {
  const { t } = useTranslations()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        {t("feed.promote")}
      </Button>
      <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>{t("promote.title")}</SheetTitle>
          <SheetDescription>{t("promote.subtitle")}</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <ContentItemForm
            defaultDate={new Date()}
            initialTitle={idea.body.slice(0, 80)}
            submitLabel={t("promote.submit")}
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
