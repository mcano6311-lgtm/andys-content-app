"use client"

import { useEffect, useRef, useState } from "react"
import { Send, Square, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/use-store"
import { addChatMessage, addContentItem } from "@/lib/store"
import { fromDatetimeLocalValue, fullDayLabel, parseDayKey } from "@/lib/date"
import { useTranslations } from "@/lib/i18n/use-translations"
import { cn } from "@/lib/utils"
import type { Platform } from "@/lib/types"

type ScheduledIdea = { title: string; dateISO: string; platform: Platform }

type SendResponse =
  | { text: string; scheduled?: ScheduledIdea | null }
  | { error: "aborted" | "failed" }

function stopRequest(requestId: string) {
  fetch("/api/chat/stop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId }),
    keepalive: true,
  })
}

export function AndysChat() {
  const { t, locale } = useTranslations()
  const { chatMessages } = useAppStore()
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [notice, setNotice] = useState<"stopped" | "error" | null>(null)
  const requestIdRef = useRef<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages.length, pending])

  async function send() {
    const text = input.trim()
    if (!text) return

    if (requestIdRef.current) {
      stopRequest(requestIdRef.current)
    }

    const requestId = crypto.randomUUID()
    requestIdRef.current = requestId
    const isFirstMessage = chatMessages.length === 0

    addChatMessage({ role: "user", text })
    setInput("")
    setNotice(null)
    setPending(true)

    let res: SendResponse
    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, message: text, isFirstMessage }),
      })
      res = await response.json()
    } catch {
      res = { error: "failed" }
    }

    if (requestIdRef.current === requestId) requestIdRef.current = null
    setPending(false)

    if ("text" in res) {
      let savedNote: string | undefined
      if (res.scheduled) {
        const { title, dateISO, platform } = res.scheduled
        addContentItem({
          title,
          platform,
          scheduledAt: fromDatetimeLocalValue(`${dateISO}T12:00`),
          status: "scheduled",
          notes: t("chat.originNote"),
        })
        savedNote = `${t("chat.savedPrefix")} ${fullDayLabel(parseDayKey(dateISO), locale)}`
      }
      addChatMessage({ role: "assistant", text: res.text, savedNote })
    } else if (res.error === "aborted") {
      setNotice("stopped")
    } else {
      setNotice("error")
    }
  }

  function stop() {
    if (requestIdRef.current) {
      stopRequest(requestIdRef.current)
      requestIdRef.current = null
    }
  }

  return (
    <div className="flex flex-1 flex-col px-4 pt-6">
      <h1 className="text-lg font-semibold">{t("chat.heading")}</h1>
      <p className="mb-4 text-sm text-muted-foreground">{t("chat.subtitle")}</p>

      <div className="flex flex-col gap-3 pb-3">
        {chatMessages.length === 0 && !pending && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t("chat.empty")}
          </p>
        )}

        {chatMessages.map((m) => (
          <div
            key={m.id}
            className={cn("flex flex-col gap-1", m.role === "user" ? "items-end" : "items-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {m.text}
            </div>
            {m.savedNote && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Check className="size-3" />
                {m.savedNote}
              </span>
            )}
          </div>
        ))}

        {pending && (
          <div className="mr-auto max-w-[85%] rounded-2xl bg-muted px-3.5 py-2 text-sm text-muted-foreground">
            {t("chat.thinking")}
          </div>
        )}

        {notice && (
          <p className="text-center text-xs text-muted-foreground">
            {notice === "stopped" ? t("chat.stopped") : t("chat.error")}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-16 mt-auto flex items-center gap-2 border-t bg-background/95 py-3 backdrop-blur">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder={t("chat.placeholder")}
          className="flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {pending ? (
          <Button size="icon" variant="destructive" onClick={stop} aria-label={t("chat.stop")}>
            <Square className="size-4" />
          </Button>
        ) : (
          <Button size="icon" onClick={send} disabled={!input.trim()} aria-label={t("chat.send")}>
            <Send className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
