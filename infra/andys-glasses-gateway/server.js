const express = require("express")
const { execFile } = require("child_process")

const PORT = process.env.PORT || 8647
const GATEWAY_KEY = process.env.GATEWAY_KEY
const HERMES_CONTAINER = process.env.HERMES_CONTAINER || "hermes-agent-zwvv-hermes-agent-1"
const HERMES_BIN = "/opt/hermes/.venv/bin/hermes"
const MODEL_ID = process.env.MODEL_ID || "claude-sonnet-4.6"
const TIMEOUT_MS = 65_000

if (!GATEWAY_KEY) {
  console.error("GATEWAY_KEY env var is required")
  process.exit(1)
}

const app = express()
app.use(express.json({ limit: "2mb" }))

app.get("/health", (req, res) => res.json({ ok: true }))

app.use((req, res, next) => {
  if (req.headers.authorization !== `Bearer ${GATEWAY_KEY}`) {
    return res.status(401).json({ error: { message: "Invalid API key", type: "invalid_request_error" } })
  }
  next()
})

app.get("/v1/models", (req, res) => {
  res.json({
    object: "list",
    data: [{ id: MODEL_ID, object: "model", created: 0, owned_by: "hermes" }],
  })
})

function contentToText(content) {
  if (typeof content === "string") return content
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text ?? ""))
      .filter(Boolean)
      .join("\n")
  }
  return ""
}

// The glasses (like any OpenAI-style client) send the full running
// transcript on every request — there's no conversation id in the OpenAI
// chat/completions shape to key a Hermes session off of. So each call is
// a self-contained one-shot: flatten the whole message array into one
// prompt instead of trying to resume a Hermes session between requests.
function buildPrompt(messages) {
  return messages
    .map((m) => `[${m.role}] ${contentToText(m.content)}`)
    .join("\n\n")
}

app.post("/v1/chat/completions", (req, res) => {
  const { messages, stream } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: { message: "messages required", type: "invalid_request_error" } })
  }

  const prompt = buildPrompt(messages)
  const args = ["exec", HERMES_CONTAINER, HERMES_BIN, "chat", "-q", prompt, "-Q", "--source", "tool"]

  execFile("docker", args, { timeout: TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
    if (err) {
      console.error("glasses gateway exec error:", err, "stderr:", stderr)
      return res.status(502).json({ error: { message: "upstream failed", type: "server_error" } })
    }

    const reply = stdout
      .split("\n")
      .filter((line) => !line.startsWith("↻ Resumed session"))
      .join("\n")
      .trim()

    const id = `chatcmpl-${Date.now()}`
    const created = Math.floor(Date.now() / 1000)

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream")
      res.setHeader("Cache-Control", "no-cache")
      res.setHeader("Connection", "keep-alive")
      res.write(
        `data: ${JSON.stringify({
          id,
          object: "chat.completion.chunk",
          created,
          model: MODEL_ID,
          choices: [{ index: 0, delta: { role: "assistant", content: reply }, finish_reason: null }],
        })}\n\n`
      )
      res.write(
        `data: ${JSON.stringify({
          id,
          object: "chat.completion.chunk",
          created,
          model: MODEL_ID,
          choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
        })}\n\n`
      )
      res.write("data: [DONE]\n\n")
      return res.end()
    }

    res.json({
      id,
      object: "chat.completion",
      created,
      model: MODEL_ID,
      choices: [
        { index: 0, message: { role: "assistant", content: reply }, finish_reason: "stop" },
      ],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    })
  })
})

// Bind 0.0.0.0 inside the container — Docker's port mapping below
// (127.0.0.1:8647:8647 on the host) is what actually restricts this to
// loopback-only; a container-internal bind to 127.0.0.1 would be
// unreachable through Docker's published port.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`andys-glasses-gateway listening on :${PORT}`)
})
