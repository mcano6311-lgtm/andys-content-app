"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { ChevronRight, Plus, Users } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlatformBadge } from "@/components/calendar/platform-badge"
import { ContentItemForm } from "@/components/content/content-item-form"
import { MeetingForm } from "@/components/content/meeting-form"
import {
  addContentItem,
  addMeeting,
  updateContentItem,
} from "@/lib/store"
import { formatDayTime, fullDayLabel } from "@/lib/date"
import type { ContentItem, Meeting } from "@/lib/types"
import { useTranslations } from "@/lib/i18n/use-translations"

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
  const [quickIdea, setQuickIdea] = useState("")
  const quickIdeaRef = useRef<HTMLInputElement>(null)
  const { t, locale } = useTranslations()

  const open = date !== null

  function handleOpenChange(next: boolean) {
    if (!next) {
      setAddMode("none")
      setQuickIdea("")
    }
    onOpenChange(next)
  }

  function addQuickIdea() {
    const title = quickIdea.trim()
    if (!title || !date) return
    addContentItem({
      title,
      platform: "instagram",
      scheduledAt: date.toISOString(),
      status: "scheduled",
      notes: "",
    })
    setQuickIdea("")
    quickIdeaRef.current?.focus()
  }

  const dayLabel = date ? fullDayLabel(date, locale) : ""

  const combined = [
    ...contentItems.map((c) => ({ kind: "content" as const, item: c })),
    ...meetings.map((m) => ({ kind: "meeting" as const, item: m })),
  ].sort(
    (a, b) =>
      new Date(a.item.scheduledAt).getTime() -
      new Date(b.item.scheduledAt).getTime()
  )

  let contentCount = 0
  const numbered = combined.map((entry) => {
    if (entry.kind === "content") contentCount += 1
    return { ...entry, number: entry.kind === "content" ? contentCount : null }
  })

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[85vh] max-w-lg overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>{dayLabel}</SheetTitle>
        </SheetHeader>

        <div className="flex gap-2 px-4 pb-3">
          <Input
            ref={quickIdeaRef}
            value={quickIdea}
            onChange={(e) => setQuickIdea(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addQuickIdea()
              }
            }}
            placeholder={t("calendar.quickIdeaPlaceholder")}
          />
          <Button
            size="icon"
            className="shrink-0"
            disabled={!quickIdea.trim()}
            aria-label={t("calendar.addIdea")}
            onClick={addQuickIdea}
          >
            <Plus />
          </Button>
        </div>

        <div className="flex flex-col gap-2 px-4 pb-2">
          {combined.length === 0 && addMode === "none" && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t("calendar.nothingScheduled")}
            </p>
          )}

          {numbered.map(({ kind, item, number }) => {
            const isDone = kind === "content" && (item as ContentItem).status === "posted"

            return kind === "content" ? (
              <div
                key={item.id}
                className="flex items-center gap-1 rounded-xl border p-1 pr-3"
              >
                <button
                  type="button"
                  aria-label={t("calendar.toggleDone")}
                  onClick={() =>
                    updateContentItem(item.id, {
                      status: isDone ? "scheduled" : "posted",
                    })
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-2 text-left active:bg-muted"
                >
                  <PlatformBadge platform={(item as ContentItem).platform} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        "truncate text-sm font-medium" +
                        (isDone ? " text-muted-foreground line-through" : "")
                      }
                    >
                      {number}- {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDayTime(item.scheduledAt, locale)}
                    </p>
                  </div>
                </button>
                <Link
                  href={`/content/${item.id}`}
                  onClick={() => handleOpenChange(false)}
                  aria-label={t("calendar.openDetail")}
                  className="shrink-0 p-1 text-muted-foreground"
                >
                  <ChevronRight className="size-4" />
                </Link>
              </div>
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
                    {formatDayTime(item.scheduledAt, locale)}
                    {(item as Meeting).location
                      ? ` · ${(item as Meeting).location}`
                      : ""}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {addMode === "none" && (
          <div className="flex gap-2 px-4 pb-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setAddMode("content")}
            >
              <Plus /> {t("calendar.addContent")}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setAddMode("meeting")}
            >
              <Plus /> {t("calendar.addMeeting")}
            </Button>
          </div>
        )}

        {addMode === "content" && date && (
          <div className="px-4 pb-6">
            <ContentItemForm
              defaultDate={date}
              submitLabel={t("calendar.addContentSubmit")}
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
