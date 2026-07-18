"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  checkPassword,
  COOKIE_NAME,
  createSessionToken,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth/session"

export async function login(
  _prevState: { error?: boolean },
  formData: FormData
): Promise<{ error?: boolean }> {
  const password = String(formData.get("password") ?? "")

  if (!password || !checkPassword(password)) {
    return { error: true }
  }

  const token = await createSessionToken()
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    // Served over plain http:// on the home LAN (no TLS) — a Secure cookie
    // would never reach the browser, so this must stay false.
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  })

  redirect("/")
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect("/login")
}
