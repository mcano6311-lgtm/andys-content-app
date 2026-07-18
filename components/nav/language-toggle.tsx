"use client"

import { useTranslations } from "@/lib/i18n/use-translations"

export function LanguageToggle() {
  const { locale, setLocale } = useTranslations()
  const next = locale === "es" ? "en" : "es"

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a espanol"}
      className="flex h-9 items-center justify-center rounded-full bg-background/80 px-3 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
    >
      {locale === "es" ? "EN" : "ES"}
    </button>
  )
}
