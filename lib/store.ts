import type {
  ContentItem,
  Idea,
  InspirationLink,
  Meeting,
  VoiceNote,
  WrittenNote,
} from "@/lib/types"

type Store = {
  contentItems: ContentItem[]
  meetings: Meeting[]
  ideas: Idea[]
  inspirationLinks: InspirationLink[]
  voiceNotes: VoiceNote[]
  writtenNotes: WrittenNote[]
  dismissedReminders: string[]
}

const STORAGE_KEY = "andys:data"

function emptyStore(): Store {
  return {
    contentItems: [],
    meetings: [],
    ideas: [],
    inspirationLinks: [],
    voiceNotes: [],
    writtenNotes: [],
    dismissedReminders: [],
  }
}

let cache: Store | null = null
const listeners = new Set<() => void>()
const serverSnapshot = emptyStore()

function load(): Store {
  if (cache) return cache
  if (typeof window === "undefined") return emptyStore()
  let next: Store
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    next = raw ? { ...emptyStore(), ...JSON.parse(raw) } : emptyStore()
  } catch {
    next = emptyStore()
  }
  cache = next
  return next
}

function persist(next: Store) {
  cache = next
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  listeners.forEach((listener) => listener())
}

function mutate(fn: (draft: Store) => Store) {
  persist(fn(load()))
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): Store {
  return load()
}

export function getServerSnapshot(): Store {
  return serverSnapshot
}

function newId() {
  return crypto.randomUUID()
}

function now() {
  return new Date().toISOString()
}

// --- content items ---

export function addContentItem(
  input: Omit<ContentItem, "id" | "createdAt">
): ContentItem {
  const item: ContentItem = { ...input, id: newId(), createdAt: now() }
  mutate((s) => ({ ...s, contentItems: [...s.contentItems, item] }))
  return item
}

export function updateContentItem(id: string, patch: Partial<ContentItem>) {
  mutate((s) => ({
    ...s,
    contentItems: s.contentItems.map((i) =>
      i.id === id ? { ...i, ...patch } : i
    ),
  }))
}

export function deleteContentItem(id: string) {
  mutate((s) => ({
    ...s,
    contentItems: s.contentItems.filter((i) => i.id !== id),
  }))
}

// --- meetings ---

export function addMeeting(input: Omit<Meeting, "id" | "createdAt">): Meeting {
  const item: Meeting = { ...input, id: newId(), createdAt: now() }
  mutate((s) => ({ ...s, meetings: [...s.meetings, item] }))
  return item
}

export function updateMeeting(id: string, patch: Partial<Meeting>) {
  mutate((s) => ({
    ...s,
    meetings: s.meetings.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  }))
}

export function deleteMeeting(id: string) {
  mutate((s) => ({ ...s, meetings: s.meetings.filter((m) => m.id !== id) }))
}

// --- ideas ---

export function addIdea(body: string): Idea {
  const item: Idea = {
    id: newId(),
    body,
    promotedContentItemId: null,
    createdAt: now(),
  }
  mutate((s) => ({ ...s, ideas: [...s.ideas, item] }))
  return item
}

export function promoteIdea(
  ideaId: string,
  contentInput: Omit<ContentItem, "id" | "createdAt">
): ContentItem {
  const contentItem: ContentItem = {
    ...contentInput,
    id: newId(),
    createdAt: now(),
  }
  mutate((s) => ({
    ...s,
    contentItems: [...s.contentItems, contentItem],
    ideas: s.ideas.map((i) =>
      i.id === ideaId ? { ...i, promotedContentItemId: contentItem.id } : i
    ),
  }))
  return contentItem
}

export function deleteIdea(id: string) {
  mutate((s) => ({ ...s, ideas: s.ideas.filter((i) => i.id !== id) }))
}

// --- inspiration links ---

export function addInspirationLink(
  input: Omit<InspirationLink, "id" | "createdAt">
): InspirationLink {
  const item: InspirationLink = { ...input, id: newId(), createdAt: now() }
  mutate((s) => ({ ...s, inspirationLinks: [...s.inspirationLinks, item] }))
  return item
}

export function deleteInspirationLink(id: string) {
  mutate((s) => ({
    ...s,
    inspirationLinks: s.inspirationLinks.filter((l) => l.id !== id),
  }))
}

// --- voice notes ---

export function addVoiceNote(
  input: Omit<VoiceNote, "id" | "createdAt">
): VoiceNote {
  const item: VoiceNote = { ...input, id: newId(), createdAt: now() }
  mutate((s) => ({ ...s, voiceNotes: [...s.voiceNotes, item] }))
  return item
}

export function deleteVoiceNote(id: string) {
  mutate((s) => ({
    ...s,
    voiceNotes: s.voiceNotes.filter((v) => v.id !== id),
  }))
}

// --- written notes ---

export function addWrittenNote(
  input: Omit<WrittenNote, "id" | "createdAt">
): WrittenNote {
  const item: WrittenNote = { ...input, id: newId(), createdAt: now() }
  mutate((s) => ({ ...s, writtenNotes: [...s.writtenNotes, item] }))
  return item
}

export function deleteWrittenNote(id: string) {
  mutate((s) => ({
    ...s,
    writtenNotes: s.writtenNotes.filter((n) => n.id !== id),
  }))
}

// --- reminders ---

export function dismissReminder(key: string) {
  mutate((s) => ({
    ...s,
    dismissedReminders: s.dismissedReminders.includes(key)
      ? s.dismissedReminders
      : [...s.dismissedReminders, key],
  }))
}

export function seedDemoData() {
  const s = load()
  if (
    s.contentItems.length ||
    s.meetings.length ||
    s.ideas.length ||
    s.inspirationLinks.length
  ) {
    return
  }

  const today = new Date()
  const day = (offset: number, hour = 18) => {
    const d = new Date(today)
    d.setDate(d.getDate() + offset)
    d.setHours(hour, 0, 0, 0)
    return d.toISOString()
  }

  const items: ContentItem[] = [
    {
      id: newId(),
      title: "GRWM para salir a Pacific Beach",
      platform: "tiktok",
      scheduledAt: day(1, 19),
      status: "scheduled",
      notes: "Usar el audio que esta sonando ahorita, mostrar rutina de skincare rapida",
      createdAt: now(),
    },
    {
      id: newId(),
      title: "Outfit del dia + de donde es todo",
      platform: "instagram",
      scheduledAt: day(2, 12),
      status: "scheduled",
      notes: "Carrusel con looks de la semana, etiquetar tiendas",
      createdAt: now(),
    },
    {
      id: newId(),
      title: "Vlog: un dia en San Diego",
      platform: "youtube",
      scheduledAt: day(4, 17),
      status: "idea",
      notes: "Falta grabar la parte del atardecer en la playa",
      createdAt: now(),
    },
  ]

  const meetings: Meeting[] = [
    {
      id: newId(),
      title: "Junta de contenido con Andrea",
      scheduledAt: day(3, 11),
      location: "Zoom",
      notes: "Revisar ideas de la semana y calendario de marcas",
      createdAt: now(),
    },
  ]

  const ideas: Idea[] = [
    {
      id: newId(),
      body: "Reto de transiciones cambiando de outfit para salir de noche",
      promotedContentItemId: null,
      createdAt: now(),
    },
    {
      id: newId(),
      body: "Rutina de skincare de las mananas con productos actuales",
      promotedContentItemId: null,
      createdAt: now(),
    },
  ]

  const links: InspirationLink[] = [
    {
      id: newId(),
      url: "https://www.tiktok.com/@ejemplo/video/123",
      platform: "tiktok",
      notes: "Formato de transicion golden hour que le puede quedar bien en la playa",
      tags: ["transiciones", "outfit", "golden-hour"],
      contentItemId: null,
      createdAt: now(),
    },
  ]

  persist({
    contentItems: items,
    meetings,
    ideas,
    inspirationLinks: links,
    voiceNotes: [],
    writtenNotes: [],
    dismissedReminders: [],
  })
}

export function clearAllData() {
  persist(emptyStore())
}
