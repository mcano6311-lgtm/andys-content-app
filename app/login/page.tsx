"use client"

import { useActionState } from "react"
import Image from "next/image"
import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LanguageToggle } from "@/components/nav/language-toggle"
import { useTranslations } from "@/lib/i18n/use-translations"

const initialState: { error?: boolean } = {}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState)
  const { t } = useTranslations()

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="fixed top-3 right-3 z-40">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-xs">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Image
            src="/icon.png"
            alt=""
            width={56}
            height={56}
            className="size-14 rounded-2xl"
          />
          <h1 className="text-lg font-semibold">{t("login.appName")}</h1>
          <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
        </div>

        <form action={formAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("login.password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              required
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{t("login.error")}</p>
          )}
          <Button type="submit" disabled={pending} className="mt-1">
            {pending ? t("login.submitting") : t("login.submit")}
          </Button>
        </form>
      </div>
    </div>
  )
}
