import "server-only"

const SHIM_URL = process.env.HERMES_SHIM_URL ?? "http://andys-hermes-shim:8646"
const SHIM_KEY = process.env.HERMES_SHIM_KEY ?? ""
const TIMEOUT_MS = 70_000

export const HERMES_SESSIONS = {
  ideas: "andys-content-ideas",
  chat: "andys-chat",
} as const

interface ShimResponse {
  text?: string
  error?: "aborted" | "failed" | string
}

async function callShim(path: string, body: unknown): Promise<ShimResponse> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${SHIM_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SHIM_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    return (await res.json()) as ShimResponse
  } finally {
    clearTimeout(timer)
  }
}

export class HermesAbortedError extends Error {
  constructor() {
    super("hermes turn aborted")
    this.name = "HermesAbortedError"
  }
}

/**
 * Runs one turn against the Hermes gateway shim (see /opt/andys-hermes-shim
 * on the VPS) and returns the agent's reply text. Reuses a fixed session key
 * per feature so the conversation keeps context across turns.
 */
export async function runCancellableHermesTurn(
  requestId: string,
  message: string,
  sessionKey: string
): Promise<string> {
  const data = await callShim("/turn", { requestId, message, sessionKey })
  if (data.error === "aborted") throw new HermesAbortedError()
  if (data.error || typeof data.text !== "string") {
    throw new Error(`hermes shim turn failed: ${data.error ?? "unknown"}`)
  }
  return data.text
}

export async function cancelHermesTurn(requestId: string): Promise<boolean> {
  try {
    const data = await callShim("/cancel", { requestId })
    return Boolean((data as { ok?: boolean }).ok)
  } catch {
    return false
  }
}
