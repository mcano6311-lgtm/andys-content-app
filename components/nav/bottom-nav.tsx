"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Lightbulb, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/lib/i18n/use-translations"

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useTranslations()

  const items = [
    { href: "/", label: t("nav.calendar"), icon: CalendarDays },
    { href: "/ideas", label: t("nav.ideas"), icon: Lightbulb },
    { href: "/andys", label: t("nav.chat"), icon: Sparkles },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {items.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-xs font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
