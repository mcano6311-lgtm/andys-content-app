"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DayDetailSheet } from "@/components/calendar/day-detail-sheet"
import { useAppStore } from "@/lib/use-store"
import {
  buildMonthGrid,
  dayKey,
  dayKeyFromDate,
  monthLabel,
  weekdayShort,
} from "@/lib/date"
import { MEETING_DOT, PLATFORM_DOT } from "@/lib/platform"

export function CalendarView() {
  const { contentItems, meetings } = useAppStore()
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const grid = useMemo(() => buildMonthGrid(monthDate), [monthDate])

  const itemsByDay = useMemo(() => {
    const map = new Map<
      string,
      { dots: string[] }
    >()
    for (const item of contentItems) {
      const key = dayKey(item.scheduledAt)
      const entry = map.get(key) ?? { dots: [] }
      entry.dots.push(PLATFORM_DOT[item.platform])
      map.set(key, entry)
    }
    for (const meeting of meetings) {
      const key = dayKey(meeting.scheduledAt)
      const entry = map.get(key) ?? { dots: [] }
      entry.dots.push(MEETING_DOT)
      map.set(key, entry)
    }
    return map
  }, [contentItems, meetings])

  function goToMonth(delta: number) {
    const d = new Date(monthDate)
    d.setMonth(d.getMonth() + delta)
    setMonthDate(d)
  }

  const todayKey = dayKeyFromDate(new Date())

  const selectedItems = selectedDay
    ? contentItems.filter((c) => dayKey(c.scheduledAt) === dayKeyFromDate(selectedDay))
    : []
  const selectedMeetings = selectedDay
    ? meetings.filter((m) => dayKey(m.scheduledAt) === dayKeyFromDate(selectedDay))
    : []

  return (
    <div className="flex flex-1 flex-col px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold capitalize">
          {monthLabel(monthDate)}
        </h1>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => goToMonth(-1)}>
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => goToMonth(1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i}>{weekdayShort(i)}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((d) => {
          const inMonth = d.getMonth() === monthDate.getMonth()
          const key = dayKeyFromDate(d)
          const entry = itemsByDay.get(key)
          const isToday = key === todayKey

          return (
            <button
              key={key}
              onClick={() => setSelectedDay(d)}
              className={
                "flex aspect-square flex-col items-center justify-start gap-1 rounded-xl pt-1.5 text-sm transition-colors " +
                (inMonth ? "text-foreground" : "text-muted-foreground/40") +
                (isToday ? " bg-primary/10 font-semibold" : " hover:bg-muted")
              }
            >
              <span>{d.getDate()}</span>
              {entry && entry.dots.length > 0 && (
                <span className="flex gap-0.5">
                  {entry.dots.slice(0, 3).map((dot, i) => (
                    <span
                      key={i}
                      className={`size-1.5 rounded-full ${dot}`}
                    />
                  ))}
                  {entry.dots.length > 3 && (
                    <span className="text-[9px] leading-none text-muted-foreground">
                      +{entry.dots.length - 3}
                    </span>
                  )}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <DayDetailSheet
        date={selectedDay}
        contentItems={selectedItems}
        meetings={selectedMeetings}
        onOpenChange={(open) => {
          if (!open) setSelectedDay(null)
        }}
      />
    </div>
  )
}
