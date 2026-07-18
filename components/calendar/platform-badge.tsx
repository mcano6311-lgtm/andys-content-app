"use client"

import { cn } from "@/lib/utils"
import { MEETING_BADGE, PLATFORM_BADGE, PLATFORM_LABEL } from "@/lib/platform"
import type { Platform } from "@/lib/types"
import { useTranslations } from "@/lib/i18n/use-translations"

export function PlatformBadge({
  platform,
  className,
}: {
  platform: Platform | "meeting"
  className?: string
}) {
  const { t } = useTranslations()
  const label = platform === "meeting" ? t("platform.meeting") : PLATFORM_LABEL[platform]
  const style = platform === "meeting" ? MEETING_BADGE : PLATFORM_BADGE[platform]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        style,
        className
      )}
    >
      {label}
    </span>
  )
}
