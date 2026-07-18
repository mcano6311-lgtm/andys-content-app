"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Users } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { PlatformBadge } from "@/components/calendar/platform-badge"
import { ContentItemForm } from "@/components/content/content-item-form"
import { MeetingForm } from "@/components/content/meeting-form"
import { addContentItem, addMeeting } from "@/lib/store"
import { formatDayTime, monthLabel } from "@/lib/date"
import type { ContentItem, Meeting } from "@/lib/types"

type AddMode = "none" | "content" | "meeting"

export function DayDetailSheet({
  date,
  contentItems,
  meetings,
  onOpenChange,
}: {
  date: Date | null
  contentItems: ContentItem[]
  meetings: Meeting[]
  onOpenChange: (open: boolean) => void
}) {
  const [addMode, setAddMode] = useState<AddMode>("none")

  const open = date !== null

  function handleOpenChange(next: boolean) {
    if (!next) setAddMode("none")
    onOpenChange(next)
  }

  const dayLabel = date
    ? `${date.getDate()} de ${monthLabel(date)}`
    : ""

  const combined = [
    ...contentItems.map((c) => ({ kind: "content" as const, item: c })),
    ...meetings.map((m) => ({ kind: "meeting" as const, item: m })),
  ].sort(
    (a, b) =>
      new Date(a.item.scheduledAt).getTime() -
      new Date(b.item.scheduledAt).getTime()
  )

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[85vh] max-w-lg overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>{dayLabel}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-2 px-4 pb-2">
          {combined.length === 0 && addMode === "none" && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nada agendado este dia todavia.
            </p>
          )}

          {combined.map(({ kind, item }) =>
            kind === "content" ? (
              <Link
                key={item.id}
                href={`/content/${item.id}`}
                onClick={() => handleOpenChange(false)}
                className="flex items-center gap-3 rounded-xl border p-3 hover:bg-muted"
              >
                <PlatformBadge platform={(item as ContentItem).platform} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDayTime(item.scheduledAt)}
                  </p>
                </div>
              </Link>
            ) : (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border p-3"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  <Users className="size-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDayTime(item.scheduledAt)}
                    {(item as Meeting).location
                      ? ` · ${(item as Meeting).location}`
                      : ""}
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        {addMode === "none" && (
          <div className="flex gap-2 px-4 pb-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setAddMode("content")}
            >
              <Plus /> Contenido
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setAddMode("meeting")}
            >
              <Plus /> Junta
            </Button>
          </div>
        )}

        {addMode === "content" && date && (
          <div className="px-4 pb-6">
            <ContentItemForm
              defaultDate={date}
              submitLabel="Agregar contenido"
              onSubmit={(input) => {
                addContentItem(input)
                setAddMode("none")
              }}
            />
          </div>
        )}

        {addMode === "meeting" && date && (
          <div className="px-4 pb-6">
            <MeetingForm
              defaultDate={date}
              onSubmit={(input) => {
                addMeeting(input)
                setAddMode("none")
              }}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
