"use client"

import { LogOut } from "lucide-react"
import { logout } from "@/app/actions/auth"
import { useTranslations } from "@/lib/i18n/use-translations"

export function LogoutButton() {
  const { t } = useTranslations()

  return (
    <form action={logout}>
      <button
        type="submit"
        aria-label={t("nav.logout")}
        className="flex size-9 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
      >
        <LogOut className="size-4" />
      </button>
    </form>
  )
}
