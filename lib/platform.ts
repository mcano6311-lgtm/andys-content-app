import type { Platform } from "@/lib/types"

export const PLATFORM_LABEL: Record<Platform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
}

export const PLATFORM_DOT: Record<Platform, string> = {
  youtube: "bg-red-500",
  tiktok: "bg-zinc-900 dark:bg-zinc-100",
  instagram: "bg-pink-500",
}

export const PLATFORM_BADGE: Record<Platform, string> = {
  youtube: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  tiktok:
    "bg-zinc-200 text-zinc-800 dark:bg-zinc-500/20 dark:text-zinc-200",
  instagram:
    "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400",
}

export const MEETING_DOT = "bg-blue-500"
export const MEETING_BADGE =
  "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"

export function detectPlatform(url: string): Platform | null {
  const lower = url.toLowerCase()
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return "youtube"
  }
  if (lower.includes("tiktok.com")) return "tiktok"
  if (lower.includes("instagram.com")) return "instagram"
  return null
}
