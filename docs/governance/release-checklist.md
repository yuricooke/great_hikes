# Release checklist (B5, v1 2026-10-08)

## Every change (automatic in CI / before merging to main)
- [ ] Typecheck, lint, unit tests (Vitest), build
- [ ] e2e + accessibility tests (Playwright + axe) on phone and desktop
- [ ] Content validation (Zod schemas: hikes, trails, journal, products)

## Every release with UI changes (manual, 10 min)
- [ ] Look at the change on phone, tablet and desktop (screenshots)
- [ ] Glass/readability over a bright and a dark photo
- [ ] No layout jump (CLS) on the changed page; images credited
- [ ] Preview link reviewed by the owner when it changes something visible

## Every content batch
- [ ] Agent reports read (unverified/dropped facts)
- [ ] New photos: licence + credit + alt text checked
- [ ] Drafts reviewed on the preview, then published

## After deploy
- [ ] Production smoke check: landing, a hike, a trail, map, login, share (HTTP 200 + quick look)
- [ ] Vercel Analytics normal; no spike of 404s/errors

## Rollback
Vercel → Deployments → previous deployment → **Promote to Production** (instant); then revert the
commit on main.

## Monitoring to add (B5 backlog)
Error tracking (Sentry free tier), uptime check, weekly broken-link/broken-image report, Supabase
backups review, stale-content report (monthly).
