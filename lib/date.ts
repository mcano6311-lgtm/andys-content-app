export function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
}

export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function dayKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
}

export function isSameDay(iso: string, d: Date): boolean {
  return dayKey(iso) === dayKeyFromDate(d)
}

import type { Locale } from "@/lib/i18n/dictionary"

const MONTHS: Record<Locale, string[]> = {
  es: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
}

const WEEKDAYS_SHORT: Record<Locale, string[]> = {
  es: ["dom", "lun", "mar", "mie", "jue", "vie", "sab"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
}

export function monthLabel(d: Date, locale: Locale = "es"): string {
  return `${MONTHS[locale][d.getMonth()]} ${d.getFullYear()}`
}

export function fullDayLabel(d: Date, locale: Locale = "es"): string {
  const month = MONTHS[locale][d.getMonth()]
  if (locale === "en") {
    return `${month} ${d.getDate()}, ${d.getFullYear()}`
  }
  return `${d.getDate()} de ${month} ${d.getFullYear()}`
}

export function weekdayShort(index: number, locale: Locale = "es"): string {
  return WEEKDAYS_SHORT[locale][index]
}

export function formatDayTime(iso: string, locale: Locale = "es"): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = MONTHS[locale][d.getMonth()].slice(0, 3)
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${dd} ${mm}, ${hh}:${min}`
}

export function formatRelative(iso: string, locale: Locale = "es"): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.round(diffMs / 60000)
  if (locale === "en") {
    if (diffMin < 1) return "just now"
    if (diffMin < 60) return `${diffMin} min ago`
    const diffH = Math.round(diffMin / 60)
    if (diffH < 24) return `${diffH} h ago`
    const diffD = Math.round(diffH / 24)
    if (diffD < 7) return `${diffD} d ago`
    return formatDayTime(iso, locale)
  }
  if (diffMin < 1) return "ahora mismo"
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `hace ${diffH} h`
  const diffD = Math.round(diffH / 24)
  if (diffD < 7) return `hace ${diffD} d`
  return formatDayTime(iso, locale)
}

export function buildMonthGrid(monthDate: Date): Date[] {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay() // 0 = Sunday
  const gridStart = new Date(year, month, 1 - startOffset)

  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    days.push(d)
  }
  return days
}

export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString()
}
