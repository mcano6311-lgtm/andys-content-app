# andys-hermes-shim

Small HTTP shim that lets `andys-content-app`'s `/andys` chat talk to the
Hermes Agent gateway (Hostinger marketplace app,
`ghcr.io/hostinger/hvps-hermes-agent`, container `hermes-agent-zwvv-hermes-agent-1`).

Hermes Agent doesn't expose an HTTP API of its own for external callers —
only messaging-platform channels (WhatsApp, Telegram, ...) and its `hermes`
CLI. This shim wraps `docker exec <hermes container> hermes chat -q "<msg>"
-Q [--resume <session_id>] --source tool`, keeps a `sessionKey -> hermes
session_id` map on disk so conversations keep context across turns, and
exposes it as a small bearer-key-protected HTTP API on the internal
`andys_default` Docker network (no public port).

## Deploy on the VPS

```bash
mkdir -p /opt/andys-hermes-shim/data
# copy server.js, package.json, Dockerfile, docker-compose.yml here
cp .env.example /opt/andys-hermes-shim/.env
# edit .env: set SHIM_KEY to a random value, and set the same value as
# HERMES_SHIM_KEY in /opt/andys/.env
cd /opt/andys-hermes-shim && docker compose up -d --build
```

The `andys` app container reaches it at `http://andys-hermes-shim:8646`
because both join the `andys_default` network — see `lib/hermes.ts` in the
app for the client side.

## API

- `POST /turn` `{ requestId, message, sessionKey }` → `{ text }` or `{ error }`
- `POST /cancel` `{ requestId }` → `{ ok: true }`

Both require `Authorization: Bearer <SHIM_KEY>`.

## Gotcha

`hermes chat -Q` prints the reply to **stdout** and the trailing
`session_id: ...` line to **stderr** — they only look like one stream in an
interactive terminal. `execFile` captures them separately; `server.js`
reads the session id from `stderr` and the reply from `stdout`.
