"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mic, NotebookText, Plus, Trash2, Link2 } from "lucide-react"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { PlatformBadge } from "@/components/calendar/platform-badge"
import { VoiceRecorder } from "@/components/capture/voice-recorder"
import { LinkCaptureForm } from "@/components/capture/link-capture-form"
import { useAppStore } from "@/lib/use-store"
import {
  addVoiceNote,
  addWrittenNote,
  deleteContentItem,
  deleteInspirationLink,
  deleteVoiceNote,
  deleteWrittenNote,
  updateContentItem,
} from "@/lib/store"
import { fromDatetimeLocalValue, formatDayTime, toDatetimeLocalValue } from "@/lib/date"
import { PLATFORM_LABEL } from "@/lib/platform"
import type { ContentStatus, Platform } from "@/lib/types"
import { useTranslations } from "@/lib/i18n/use-translations"

export function ContentItemDetail({ id }: { id: string }) {
  const store = useAppStore()
  const router = useRouter()
  const { t, locale } = useTranslations()
  const item = store.contentItems.find((c) => c.id === id)

  const [voiceOpen, setVoiceOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [noteBody, setNoteBody] = useState("")

  const statusLabel: Record<ContentStatus, string> = {
    idea: t("status.idea"),
    scheduled: t("status.scheduled"),
    in_progress: t("status.in_progress"),
    posted: t("status.posted"),
    skipped: t("status.skipped"),
  }

  if (!item) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-muted-foreground">{t("detail.notFound")}</p>
        <Link href="/" className="text-sm font-medium text-primary underline">
          {t("detail.backToCalendar")}
        </Link>
      </div>
    )
  }

  const relatedIdeas = store.ideas.filter((i) => i.promotedContentItemId === id)
  const relatedLinks = store.inspirationLinks.filter((l) => l.contentItemId === id)
  const relatedVoice = store.voiceNotes.filter((v) => v.contentItemId === id)
  const relatedNotes = store.writtenNotes.filter((n) => n.contentItemId === id)

  function handleDelete() {
    if (!window.confirm(t("detail.confirmDelete"))) return
    deleteContentItem(id)
    router.push("/")
  }

  return (
    <div className="flex flex-1 flex-col px-4 pt-6 pb-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="size-4" /> {t("detail.calendar")}
        </Link>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 text-sm text-destructive"
        >
          <Trash2 className="size-4" /> {t("detail.delete")}
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="d-title">{t("detail.title")}</Label>
          <Input
            id="d-title"
            value={item.title}
            onChange={(e) => updateContentItem(id, { title: e.target.value })}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label>{t("detail.platform")}</Label>
            <Select
              value={item.platform}
              onValueChange={(v) =>
                updateContentItem(id, { platform: v as Platform })
              }
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
            <Label>{t("detail.status")}</Label>
            <Select
              value={item.status}
              onValueChange={(v) =>
                updateContentItem(id, { status: v as ContentStatus })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(statusLabel) as ContentStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="d-date">{t("detail.dateTime")}</Label>
          <Input
            id="d-date"
            type="datetime-local"
            value={toDatetimeLocalValue(item.scheduledAt)}
            onChange={(e) =>
              updateContentItem(id, {
                scheduledAt: fromDatetimeLocalValue(e.target.value),
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            {formatDayTime(item.scheduledAt, locale)}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="d-notes">{t("detail.notes")}</Label>
          <Textarea
            id="d-notes"
            rows={3}
            value={item.notes}
            onChange={(e) => updateContentItem(id, { notes: e.target.value })}
          />
        </div>
      </div>

      <RelatedSection
        title={t("detail.originIdeas")}
        empty={t("detail.noIdeasLinked")}
      >
        {relatedIdeas.map((i) => (
          <p key={i.id} className="rounded-lg bg-muted p-2.5 text-sm">
            {i.body}
          </p>
        ))}
      </RelatedSection>

      <RelatedSection
        title={t("detail.inspirationLinks")}
        empty={t("detail.noLinksLinked")}
        action={
          <button
            onClick={() => setLinkOpen(true)}
            className="flex items-center gap-1 text-xs font-medium text-primary"
          >
            <Plus className="size-3.5" /> {t("detail.linkHere")}
          </button>
        }
      >
        {relatedLinks.map((l) => (
          <div key={l.id} className="flex items-start justify-between gap-2 rounded-lg bg-muted p-2.5">
            <div className="min-w-0 flex-1">
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-sm font-medium text-primary underline underline-offset-2"
              >
                {l.url}
              </a>
              {l.platform && <PlatformBadge platform={l.platform} className="mt-1" />}
            </div>
            <button onClick={() => deleteInspirationLink(l.id)} aria-label={t("feed.delete")}>
              <Trash2 className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
      </RelatedSection>

      <RelatedSection
        title={t("detail.voiceNotes")}
        empty={t("detail.noVoiceNotes")}
        action={
          <button
            onClick={() => setVoiceOpen(true)}
            className="flex items-center gap-1 text-xs font-medium text-primary"
          >
            <Mic className="size-3.5" /> {t("detail.recordHere")}
          </button>
        }
      >
        {relatedVoice.map((v) => (
          <div key={v.id} className="flex items-center gap-2 rounded-lg bg-muted p-2.5">
            <audio src={v.audioDataUrl} controls className="h-8 flex-1" />
            <button onClick={() => deleteVoiceNote(v.id)} aria-label={t("feed.delete")}>
              <Trash2 className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
      </RelatedSection>

      <RelatedSection title={t("detail.writtenNotes")} empty="">
        {relatedNotes.map((n) => (
          <div key={n.id} className="flex items-start justify-between gap-2 rounded-lg bg-muted p-2.5">
            <p className="whitespace-pre-wrap text-sm">{n.body}</p>
            <button onClick={() => deleteWrittenNote(n.id)} aria-label={t("feed.delete")}>
              <Trash2 className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <Textarea
            placeholder={t("detail.addNotePlaceholder")}
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            rows={2}
            className="flex-1"
          />
          <Button
            size="icon"
            className="shrink-0"
            disabled={!noteBody.trim()}
            onClick={() => {
              addWrittenNote({ body: noteBody.trim(), contentItemId: id })
              setNoteBody("")
            }}
          >
            <NotebookText />
          </Button>
        </div>
      </RelatedSection>

      <Sheet open={voiceOpen} onOpenChange={setVoiceOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{t("capture.voiceTitle")}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            <VoiceRecorder
              onSave={(dataUrl, duration) => {
                addVoiceNote({
                  audioDataUrl: dataUrl,
                  durationSeconds: duration,
                  contentItemId: id,
                  ideaId: null,
                })
                setVoiceOpen(false)
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={linkOpen} onOpenChange={setLinkOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Link2 className="size-4" /> {t("detail.linkThisTitle")}
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            <LinkCaptureForm
              contentItemId={id}
              onSaved={() => setLinkOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function RelatedSection({
  title,
  empty,
  action,
  children,
}: {
  title: string
  empty: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  const hasChildren = Array.isArray(children)
    ? children.some(Boolean)
    : Boolean(children)

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      <div className="flex flex-col gap-2">
        {hasChildren ? children : (
          <p className="text-sm text-muted-foreground">{empty}</p>
        )}
      </div>
    </div>
  )
}
