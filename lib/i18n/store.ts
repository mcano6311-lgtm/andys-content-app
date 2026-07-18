import type { Locale } from "@/lib/i18n/dictionary"

const STORAGE_KEY = "andys:locale"
const DEFAULT_LOCALE: Locale = "es"

let cache: Locale | null = null
const listeners = new Set<() => void>()

function load(): Locale {
  if (cache) return cache
  if (typeof window === "undefined") return DEFAULT_LOCALE
  const raw = window.localStorage.getItem(STORAGE_KEY)
  cache = raw === "en" || raw === "es" ? raw : DEFAULT_LOCALE
  return cache
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): Locale {
  return load()
}

export function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE
}

export function setLocale(locale: Locale) {
  cache = locale
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, locale)
  }
  listeners.forEach((listener) => listener())
}
