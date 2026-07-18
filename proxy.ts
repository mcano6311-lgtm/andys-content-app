import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const COOKIE_NAME = "andys_session"

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return false
  const secret = process.env.SESSION_SECRET
  if (!secret) return false
  try {
    await jwtVerify(token, new TextEncoder().encode(secret))
    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  if (await hasValidSession(request)) {
    return NextResponse.next()
  }
  const loginUrl = new URL("/login", request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    "/((?!login|icon\\.png|apple-icon\\.png|icon-192\\.png|icon-512\\.png|manifest\\.webmanifest|favicon\\.ico|_next/static|_next/image).*)",
  ],
}
