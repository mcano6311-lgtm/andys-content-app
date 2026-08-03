import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import { cancelHermesTurn } from "@/lib/hermes"

export async function POST(request: NextRequest) {
  await requireAuth()

  const body = await request.json()
  const requestId = String(body.requestId ?? "")
  if (requestId) await cancelHermesTurn(requestId)

  return NextResponse.json({ ok: true })
}
