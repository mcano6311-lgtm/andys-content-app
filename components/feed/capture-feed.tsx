"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Lightbulb, Link2, Mic, NotebookText, Trash2 } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { PlatformBadge } from "@/components/calendar/platform-badge"
import { PromoteIdeaSheet } from "@/components/feed/promote-idea-sheet"
import { useAppStore } from "@/lib/use-store"
import { formatRelative } from "@/lib/date"
import {
  deleteIdea,
  deleteInspirationLink,
  deleteVoiceNote,
  deleteWrittenNote,
} from "@/lib/store"
import type {
  Idea,
  InspirationLink,
  VoiceNote,
  WrittenNote,
} from "@/lib/types"
import { useTranslations } from "@/lib/i18n/use-translations"

type FeedRow =
  | { kind: "idea"; createdAt: string; data: Idea }
  | { kind: "link"; createdAt: string; data: InspirationLink }
  | { kind: "voice"; createdAt: string; data: VoiceNote }
  | { kind: "note"; createdAt: string; data: WrittenNote }

export function CaptureFeed() {
  const { ideas, inspirationLinks, voiceNotes, writtenNotes, contentItems } =
    useAppStore()
  const { t } = useTranslations()
  const [tab, setTab] = useState<"all" | FeedRow["kind"]>("all")

  const tabLabel: Record<"all" | FeedRow["kind"], string> = {
    all: t("feed.tabAll"),
    idea: t("feed.tabIdeas"),
    link: t("feed.tabLinks"),
    voice: t("feed.tabVoice"),
    note: t("feed.tabNotes"),
  }

  const rows = useMemo<FeedRow[]>(() => {
    const all: FeedRow[] = [
      ...ideas.map((i) => ({ kind: "idea" as const, createdAt: i.createdAt, data: i })),
      ...inspirationLinks.map((l) => ({
        kind: "link" as const,
        createdAt: l.createdAt,
        data: l,
      })),
      ...voiceNotes.map((v) => ({
        kind: "voice" as const,
        createdAt: v.createdAt,
        data: v,
      })),
      ...writtenNotes.map((n) => ({
        kind: "note" as const,
        createdAt: n.createdAt,
        data: n,
      })),
    ]
    return all.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [ideas, inspirationLinks, voiceNotes, writtenNotes])

  const filtered = tab === "all" ? rows : rows.filter((r) => r.kind === tab)

  function contentTitle(id: string | null) {
    if (!id) return null
    return contentItems.find((c) => c.id === id)?.title ?? null
  }

  return (
    <div className="flex flex-1 flex-col px-4 pt-6">
      <h1 className="mb-4 text-lg font-semibold">{t("feed.heading")}</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="mb-4 w-full">
          {(Object.keys(tabLabel) as (typeof tab)[]).map((key) => (
            <TabsTrigger key={key} value={key} className="flex-1">
              {tabLabel[key]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="flex flex-col gap-3 pb-6">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t("feed.empty")}
            </p>
          )}

          {filtered.map((row) => (
            <FeedRowCard
              key={row.data.id}
              row={row}
              linkedTitle={
                row.kind === "link"
                  ? contentTitle(row.data.contentItemId)
                  : row.kind === "voice"
                  ? contentTitle(row.data.contentItemId)
                  : row.kind === "note"
                  ? contentTitle(row.data.contentItemId)
                  : null
              }
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FeedRowCard({
  row,
  linkedTitle,
}: {
  row: FeedRow
  linkedTitle: string | null
}) {
  const { t, locale } = useTranslations()

  return (
    <div className="rounded-xl border p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <RowIcon kind={row.kind} />
          {formatRelative(row.createdAt, locale)}
        </span>
        <button
          onClick={() => removeRow(row)}
          className="text-muted-foreground hover:text-destructive"
          aria-label={t("feed.delete")}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {row.kind === "idea" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm">{row.data.body}</p>
          {row.data.promotedContentItemId ? (
            <Link
              href={`/content/${row.data.promotedContentItemId}`}
              className="text-xs font-medium text-primary underline underline-offset-2"
            >
              {t("feed.alreadyPromoted")}
            </Link>
          ) : (
            <div>
              <PromoteIdeaSheet idea={row.data} />
            </div>
          )}
        </div>
      )}

      {row.kind === "link" && (
        <div className="flex flex-col gap-1.5">
          <a
            href={row.data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-medium text-primary underline underline-offset-2"
          >
            {row.data.url}
          </a>
          {row.data.platform && <PlatformBadge platform={row.data.platform} />}
          {row.data.notes && (
            <p className="text-sm text-muted-foreground">{row.data.notes}</p>
          )}
          {row.data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {row.data.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {linkedTitle && (
            <p className="text-xs text-muted-foreground">
              {t("feed.linkedTo")}: {linkedTitle}
            </p>
          )}
        </div>
      )}

      {row.kind === "voice" && (
        <div className="flex flex-col gap-1.5">
          <audio src={row.data.audioDataUrl} controls className="w-full" />
          <p className="text-xs text-muted-foreground">
            {row.data.durationSeconds}s
            {linkedTitle ? ` · ${t("feed.linkedTo")}: ${linkedTitle}` : ""}
          </p>
        </div>
      )}

      {row.kind === "note" && (
        <div className="flex flex-col gap-1.5">
          <p className="whitespace-pre-wrap text-sm">{row.data.body}</p>
          {linkedTitle && (
            <p className="text-xs text-muted-foreground">
              {t("feed.linkedTo")}: {linkedTitle}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function RowIcon({ kind }: { kind: FeedRow["kind"] }) {
  if (kind === "idea") return <Lightbulb className="size-3.5" />
  if (kind === "link") return <Link2 className="size-3.5" />
  if (kind === "voice") return <Mic className="size-3.5" />
  return <NotebookText className="size-3.5" />
}

function removeRow(row: FeedRow) {
  if (row.kind === "idea") deleteIdea(row.data.id)
  if (row.kind === "link") deleteInspirationLink(row.data.id)
  if (row.kind === "voice") deleteVoiceNote(row.data.id)
  if (row.kind === "note") deleteWrittenNote(row.data.id)
}
