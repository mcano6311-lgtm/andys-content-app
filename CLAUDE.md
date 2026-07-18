@AGENTS.md

# ANDYS — content ops app

## Problem

One person manages the entire content life of a 21-year-old creator (YouTube
@andreacano, TikTok/Instagram @andreacanogonz): what to post and when, ideas
captured in the moment, inspiration links, voice notes, written notes,
meetings. This app is that single place, used from a phone, by one person.

## Users

Single user (the manager). No accounts for the creator, no multi-tenant
anything. Do not add per-user data scoping, roles, or an admin panel — there
is exactly one user and there is no plan to add more.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router), TypeScript | Server Actions avoid a separate API layer for single-user CRUD |
| Hosting | Vercel | |
| DB | Supabase Postgres | provisioned via the Supabase MCP tools |
| File storage | Supabase Storage, private `voice-notes` bucket | audio blobs, not stored in Postgres |
| UI | Tailwind + shadcn/ui (radix base, nova preset) | |
| PWA | `app/manifest.ts` + minimal service worker | installable on phone, no offline caching |
| Voice capture | Browser `MediaRecorder` → upload to Supabase Storage | |
| Auth | one shared password → signed session cookie, checked in `proxy.ts` | no per-user accounts |

## This Next.js version is not the one you remember

Read `node_modules/next/dist/docs/` before assuming an API. Confirmed
differences already hit in this project:

- `middleware.ts` is deprecated → the file is **`proxy.ts`**, exporting a
  function named `proxy` (or default export), same `config.matcher` shape.
- `cookies()` and dynamic route `params`/route-handler `ctx.params` are
  **async** — always `await` them.
- Proxy is an optimistic check, not a full auth boundary (Next's own docs say
  so) — every Server Action and Route Handler must independently call
  `requireAuth()` (see `lib/auth/session.ts`), not rely on proxy alone having
  already gated the request.

## Conventions

- Timezone: local-day grouping for the calendar is centralized in
  `lib/date/timezone.ts` — never compute "what day is this on" ad hoc
  elsewhere, that's how off-by-one calendar bugs happen.
- All Supabase access from the server uses the **service role key**
  (`lib/supabase/server.ts`, server-only import). The anon/publishable key is
  not used anywhere in this app. Every table has RLS enabled with no
  policies (deny-all) — the service role bypasses RLS by design.
- Platform color mapping (YouTube/TikTok/Instagram/meeting) lives in one
  place (`components/calendar/PlatformBadge.tsx`) and is reused everywhere a
  platform is shown, so colors never drift between screens.
- No mock/seed data left in the app — the calendar and feed render directly
  from Supabase.
- Explicitly out of scope for v1: per-user accounts, notifications, offline
  support, transcript generation for voice notes, a separate staging Supabase
  project.

## Commands

- `npm run dev` — dev server
- `npm run build` / `npm run start` — production build/serve
- `npm run lint` — eslint

## Structure

```
app/            routes (login, calendar/root, ideas, content/[id], meetings, api/voice-notes)
app/actions/    Server Actions (content-items, ideas, inspiration-links, voice-notes, written-notes, meetings, auth)
components/     ui/ (shadcn) + calendar/, capture/, feed/, content/
lib/            supabase/ (server client, generated types), auth/ (session), date/ (timezone), platform-detect.ts
supabase/migrations/  SQL migrations, source of truth for schema (kept in sync with what's applied via MCP)
```

See `/Users/miguelcano/.claude/plans/quiero-un-calendario-o-majestic-harbor.md` for the full build plan.
