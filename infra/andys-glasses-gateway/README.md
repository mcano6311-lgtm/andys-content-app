# andys-glasses-gateway

OpenAI-compatible `/v1/models` + `/v1/chat/completions` gateway for the G2
smart glasses (Even Realities), backed by Hermes Agent on the VPS.

Hermes Agent has no built-in OpenAI-compatible API, and the glasses need
one with a plain bearer-key API key — same underlying problem as
`../andys-hermes-shim`, different shape. Each request wraps `docker exec
<hermes container> hermes chat -q "<flattened transcript>" -Q --source
tool`. Unlike the WhatsApp/chat shim, this one does **not** keep Hermes
session state between calls — OpenAI's chat/completions API has no
conversation id, so every call flattens the full `messages` array the
client sent into one prompt and treats it as a fresh one-shot turn.

Only reachable over Tailscale (not the public internet):
`https://hermes-vps-1.tail9814c9.ts.net` — exposed via `tailscale serve`,
not a Docker network or Traefik route. **Must be plain 443, no port
suffix** — see gotchas below, the glasses' own app can't handle a custom
port in its base-URL field.

## Deploy on the VPS

```bash
mkdir -p /opt/andys-glasses-gateway
# copy server.js, package.json, Dockerfile, docker-compose.yml here
cp .env.example /opt/andys-glasses-gateway/.env   # set GATEWAY_KEY
cd /opt/andys-glasses-gateway && docker compose up -d --build

# one-time per VPS: join Tailscale and expose the gateway over it
tailscale up --hostname=hermes-vps
tailscale cert <the-assigned-name>.tail9814c9.ts.net   # first cert issuance can 500 right after joining — retry once
tailscale serve --bg --https=443 http://127.0.0.1:8647
```

Configure the glasses with:
- Base URL: `https://<tailnet-hostname>.tail9814c9.ts.net` (no port)
- API key: the `GATEWAY_KEY` value
- Model: `claude-sonnet-4.6` (or whatever `MODEL_ID` is set to)

## Gotchas

- **Use `--https=443`, not a custom port.** First attempt used `--https=8642`
  (matching the old pre-wipe setup) — server side worked fine (verified
  with `curl` from multiple tailnet devices), but the G2 glasses' own
  companion app failed with a generic "✗ Load failed" and never even hit
  the gateway's logs. Root cause: that app's base-URL field doesn't support
  a non-standard port. Moving to `--https=443` (bare hostname, no `:port`
  in the URL) fixed it immediately. `tailscale serve`'s userspace netstack
  only intercepts 443 on the *tailnet* IP, so it does not conflict with
  Traefik's `:443` on the public interface (confirmed both work at once).
- The app **inside** the container must bind `0.0.0.0`, not `127.0.0.1` —
  Docker's `127.0.0.1:8647:8647` port mapping on the host already
  restricts external reachability; a container-internal loopback bind is
  unreachable through Docker's NAT and silently 502s from `tailscale serve`.
- `tailscale cert <name>` can fail once right after a fresh `tailscale up`
  with `500 ... failed to create DNS record` even with HTTPS Certificates
  enabled tailnet-wide — just retry it once, it's transient.
- If the tailnet already has a stale/offline device with the hostname you
  want (e.g. after a VPS wipe/rejoin), Tailscale appends `-1` to the new
  node's hostname instead of reusing the old one. Either clean up the old
  device from the admin console first, or just use the `-1` name.
