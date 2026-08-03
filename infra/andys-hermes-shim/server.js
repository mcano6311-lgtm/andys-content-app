const express = require("express")
const { execFile } = require("child_process")
const fs = require("fs")

const PORT = process.env.PORT || 8646
const SHIM_KEY = process.env.SHIM_KEY
const HERMES_CONTAINER = process.env.HERMES_CONTAINER || "hermes-agent-zwvv-hermes-agent-1"
const HERMES_BIN = "/opt/hermes/.venv/bin/hermes"
const SESSIONS_FILE = "/data/sessions.json"
const TIMEOUT_MS = 65_000

if (!SHIM_KEY) {
  console.error("SHIM_KEY env var is required")
  process.exit(1)
}

let sessions = {}
try {
  sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8"))
} catch {
  sessions = {}
}

function saveSessions() {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2))
}

// requestId -> ChildProcess, so /cancel can kill an in-flight turn
const inFlight = new Map()

// `hermes chat -Q` prints the reply to stdout and `session_id: ...` to
// stderr (both land on the same terminal in interactive use, which is why
// they look like one stream — execFile captures them separately).
function parseReply(stdout, stderr) {
  const match = stderr.match(/session_id:\s*(\S+)/)
  if (!match) throw new Error("no session_id in hermes stderr")
  const reply = stdout
    .split("\n")
    .filter((line) => !line.startsWith("↻ Resumed session"))
    .join("\n")
    .trim()
  return { reply, sessionId: match[1] }
}

const app = express()
app.use(express.json())

app.use((req, res, next) => {
  if (req.headers.authorization !== `Bearer ${SHIM_KEY}`) {
    return res.status(401).json({ error: "unauthorized" })
  }
  next()
})

app.post("/turn", (req, res) => {
  const { requestId, message, sessionKey } = req.body || {}
  if (!requestId || !message || !sessionKey) {
    return res.status(400).json({ error: "failed" })
  }

  const existingId = sessions[sessionKey]
  const args = ["exec", HERMES_CONTAINER, HERMES_BIN, "chat", "-q", message, "-Q", "--source", "tool"]
  if (existingId) args.push("--resume", existingId)

  const child = execFile(
    "docker",
    args,
    { timeout: TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024 },
    (err, stdout, stderr) => {
      inFlight.delete(requestId)
      if (err) {
        console.error("hermes chat exec error:", err)
        return res.json({ error: err.killed || err.signal ? "aborted" : "failed" })
      }
      try {
        const { reply, sessionId } = parseReply(stdout, stderr)
        sessions[sessionKey] = sessionId
        saveSessions()
        res.json({ text: reply })
      } catch (parseErr) {
        console.error(
          "hermes chat parse error:",
          parseErr,
          "stdout:",
          JSON.stringify(stdout),
          "stderr:",
          JSON.stringify(stderr)
        )
        res.json({ error: "failed" })
      }
    }
  )
  inFlight.set(requestId, child)
})

app.post("/cancel", (req, res) => {
  const { requestId } = req.body || {}
  const child = inFlight.get(requestId)
  if (child) {
    child.kill("SIGTERM")
    inFlight.delete(requestId)
  }
  res.json({ ok: true })
})

app.get("/health", (req, res) => res.json({ ok: true }))

app.listen(PORT, "0.0.0.0", () => {
  console.log(`andys-hermes-shim listening on :${PORT}`)
})
