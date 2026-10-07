# Spec 003 — Accounts & favorites

**Outcomes served:** O-4 (returning visitors), O-6 (community members we can reach).
**Status:** implemented on `003-accounts`; production sign-in waits on the owner's Supabase URL setup.

## What hikers get

- Sign in without a password: **email link** (Supabase magic link) and **Google** (button appears
  once the Google provider is enabled — `NEXT_PUBLIC_GOOGLE_AUTH=1`).
- Sign-in as a glass pop-up from any page, or the full `/login` page with the video.
- Save hikes with the heart; favorites live in the database, so they follow you across devices.
- An expired/used link lands on `/login?error=link` with a clear message.

## Data (Supabase Postgres, RLS on)

See `docs/architecture/database.md` and `supabase/migrations/`.

- `profiles` — one per user, created by the `handle_new_user` trigger; `role` member | owner.
- `favorites` — (user_id, hike_slug); each user reads/writes only their own rows.

## Modes (`src/lib/flags.ts` → `AUTH_MODE`)

| Where | Supabase env | Mode |
|---|---|---|
| Local / preview | present | `supabase` — real accounts; test accounts sign in without email |
| Local / CI | missing | `demo` — test accounts only, favorites in the browser |
| Production | present + `AUTH_LIVE=1` | `supabase` |
| Production | otherwise | `off` — no sign-in shown |

## Test accounts

`fixtures/test-users.json` (no passwords). `npm run db:seed` creates them;
`POST /auth/test-login` signs one in on local/preview only (404 in production) — `reset: true`
clears its favorites for e2e tests.

## Owner setup (once)

1. Supabase → Authentication → URL Configuration
   - Site URL: `https://great-hikes.vercel.app`
   - Redirect URLs: `https://great-hikes.vercel.app/**`, `https://*-yuricookes-projects.vercel.app/**`,
     `http://localhost:3001/**`
2. Vercel → Environment Variables (Production): `AUTH_LIVE=1`, then redeploy.
3. Google (optional, later): Google Cloud OAuth client → Supabase → Providers → Google;
   then `NEXT_PUBLIC_GOOGLE_AUTH=1`.
4. Before real traffic: custom SMTP in Supabase (built-in email is rate-limited to a few per hour).

## Verification

- e2e: sign in (test account per project), save a hike, see it on `/favorites` — passes in both
  `supabase` and `demo` modes.
- Typecheck, lint, unit tests, build.
