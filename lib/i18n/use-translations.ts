"use client"

import { useSyncExternalStore } from "react"
import { dictionary, type Locale } from "@/lib/i18n/dictionary"
import { getServerSnapshot, getSnapshot, setLocale, subscribe } from "@/lib/i18n/store"

function get(dict: object, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], dict)
  return typeof value === "string" ? value : path
}

export function useTranslations() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const dict = dictionary[locale]

  function t(path: string): string {
    return get(dict, path)
  }

  return { t, locale, setLocale: setLocale as (locale: Locale) => void }
}
