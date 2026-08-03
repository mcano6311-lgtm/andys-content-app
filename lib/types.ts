export type Platform = "youtube" | "tiktok" | "instagram"

export type ContentStatus =
  | "idea"
  | "scheduled"
  | "in_progress"
  | "posted"
  | "skipped"

export type ContentItem = {
  id: string
  title: string
  platform: Platform
  scheduledAt: string // ISO datetime
  status: ContentStatus
  notes: string
  createdAt: string
}

export type Meeting = {
  id: string
  title: string
  scheduledAt: string
  location: string
  notes: string
  createdAt: string
}

export type Idea = {
  id: string
  body: string
  promotedContentItemId: string | null
  createdAt: string
}

export type InspirationLink = {
  id: string
  url: string
  platform: Platform | null
  notes: string
  tags: string[]
  contentItemId: string | null
  createdAt: string
}

export type VoiceNote = {
  id: string
  audioDataUrl: string
  durationSeconds: number
  contentItemId: string | null
  ideaId: string | null
  createdAt: string
}

export type WrittenNote = {
  id: string
  body: string
  contentItemId: string | null
  createdAt: string
}

export type CaptureKind = "idea" | "link" | "voice" | "note"

export type ChatRole = "user" | "assistant"

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  aborted?: boolean
  savedNote?: string
  createdAt: string
}
