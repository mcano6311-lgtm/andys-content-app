"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { PlatformBadge } from "@/components/calendar/platform-badge"
import { useAppStore } from "@/lib/use-store"
import { dismissReminder } from "@/lib/store"
import { dayKey, dayKeyFromDate } from "@/lib/date"
import { useTranslations } from "@/lib/i18n/use-translations"

export function ReminderBanner() {
  const { contentItems, dismissedReminders } = useAppStore()
  const { t } = useTranslations()

  const todayKey = dayKeyFromDate(new Date())
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowKey = dayKeyFromDate(tomorrow)

  const reminders = contentItems
    .filter((item) => item.status !== "posted" && item.status !== "skipped")
    .map((item) => {
      const key = dayKey(item.scheduledAt)
      if (key !== todayKey && key !== tomorrowKey) return null
      const reminderKey = `${item.id}:${key}`
      if (dismissedReminders.includes(reminderKey)) return null
      return { item, when: key === todayKey ? ("today" as const) : ("tomorrow" as const), reminderKey }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => (a.when === "today" ? -1 : 1) - (b.when === "today" ? -1 : 1))

  if (reminders.length === 0) return null

  return (
    <div className="mb-4 flex flex-col gap-2">
      {reminders.map(({ item, when, reminderKey }) => (
        <div
          key={reminderKey}
          className="flex items-center gap-2 rounded-xl border bg-accent/40 px-3 py-2"
        >
          <Link href={`/content/${item.id}`} className="flex flex-1 items-center gap-2 overflow-hidden">
            <span className="shrink-0 text-xs font-semibold text-primary">
              {when === "today" ? t("reminders.today") : t("reminders.tomorrow")}
            </span>
            <span className="truncate text-sm">{item.title}</span>
            <PlatformBadge platform={item.platform} className="ml-auto shrink-0" />
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault()
              dismissReminder(reminderKey)
            }}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label={t("reminders.dismiss")}
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
