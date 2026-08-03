import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import {
  HERMES_SESSIONS,
  HermesAbortedError,
  runCancellableHermesTurn,
} from "@/lib/hermes"

const INTRO =
  "Eres Andys, el asistente de contenido de Andrea (@andreacano en YouTube, " +
  "@andreacanogonz en TikTok/Instagram), creadora de 21 anos en San Diego " +
  "enfocada en GRWM, skincare, outfits y lifestyle, con estetica calida/pastel/" +
  "golden-hour. Eres conversacional, directo, y con criterio propio. Responde " +
  "siempre en el mismo idioma en el que te escriban (ingles si te hablan en " +
  "ingles, espanol si te hablan en espanol), sin mezclarlos.\n\n"

const WEEKDAYS_ES = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
]

function todayLocalLabel(): string {
  const d = new Date()
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
  return `${WEEKDAYS_ES[d.getDay()]} ${iso}`
}

function buildScheduleInstruction(): string {
  return (
    `[Instruccion del sistema, no la repitas ni la menciones al usuario. Hoy es ${todayLocalLabel()}. ` +
    "Si en su ULTIMO mensaje el usuario pide explicitamente guardar, agendar o programar una idea de " +
    'contenido (ej. "guardamela para el proximo lunes", "agendala", "save it for tomorrow"), agrega al ' +
    "final de tu respuesta, en su propia linea, exactamente este bloque (sin explicarlo, es invisible " +
    'para el usuario): [[SCHEDULE:{"title":"...","dateISO":"YYYY-MM-DD","platform":"youtube|tiktok|' +
    'instagram"}]] El titulo debe ser corto y limpio, sin markdown ni comillas. Calcula dateISO en ' +
    'relacion a hoy. Elige la plataforma mas probable segun el contexto; si no es clara usa "tiktok". ' +
    "Si el usuario NO pide guardar nada en este mensaje, no incluyas ese bloque bajo ninguna " +
    "circunstancia.]\n\n"
  )
}

const SCHEDULE_TAG_RE = /\[\[SCHEDULE:(\{[\s\S]*?\})\]\]/

type ScheduledPlatform = "youtube" | "tiktok" | "instagram"

function extractSchedule(rawText: string): {
  text: string
  scheduled: { title: string; dateISO: string; platform: ScheduledPlatform } | null
} {
  const match = rawText.match(SCHEDULE_TAG_RE)
  if (!match) return { text: rawText.trim(), scheduled: null }

  const cleanText = rawText.replace(SCHEDULE_TAG_RE, "").trim()
  try {
    const data = JSON.parse(match[1])
    const title = typeof data.title === "string" ? data.title.trim() : ""
    const dateISO = typeof data.dateISO === "string" ? data.dateISO : ""
    const platform: ScheduledPlatform = ["youtube", "tiktok", "instagram"].includes(
      data.platform
    )
      ? data.platform
      : "tiktok"
    const validDate =
      /^\d{4}-\d{2}-\d{2}$/.test(dateISO) && !Number.isNaN(new Date(dateISO).getTime())

    if (!title || !validDate) return { text: cleanText, scheduled: null }
    return { text: cleanText, scheduled: { title, dateISO, platform } }
  } catch {
    return { text: cleanText, scheduled: null }
  }
}

export async function POST(request: NextRequest) {
  await requireAuth()

  const body = await request.json()
  const requestId = String(body.requestId ?? "")
  const message = String(body.message ?? "")
  const isFirstMessage = Boolean(body.isFirstMessage)

  if (!requestId || !message) {
    return NextResponse.json({ error: "failed" }, { status: 400 })
  }

  const finalMessage =
    buildScheduleInstruction() + (isFirstMessage ? INTRO : "") + message

  try {
    const rawText = await runCancellableHermesTurn(
      requestId,
      finalMessage,
      HERMES_SESSIONS.chat
    )
    const { text, scheduled } = extractSchedule(rawText)
    return NextResponse.json({ text, scheduled })
  } catch (err) {
    if (err instanceof HermesAbortedError) {
      return NextResponse.json({ error: "aborted" })
    }
    return NextResponse.json({ error: "failed" })
  }
}
