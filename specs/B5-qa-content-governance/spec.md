# B5 — QA & content governance

**Status:** to do (owner request 2026-10-08).

## Content review (editorial)
- **Who writes what** — agents draft (journal, hike facts), hikers submit (photos, reviews, tips,
  hikes), the owner approves. Labels: draft → in review → published → needs recheck.
- **Fact-checking rules** — official sources only; every fact traceable in `sources`; conflicts
  noted; unknown = null (already the agent rule — make it the policy).
- **Freshness** — recheck cycle per content type (permits/fees/access every season; facts yearly);
  "checked on" dates visible; stale-content report (script) monthly.
- **Seasonal/temporary notices** — closures (e.g. Grand Canyon flood 2026) shown as dated alerts
  with an expiry, not baked into evergreen text.
- **AI-assisted content policy** — disclosure (About page), human review mandatory, no AI images.
- **Photo QA** — licence verified (Unsplash/Commons/permission), credit format, alt text quality,
  no edits beyond resize, sensitive content check.
- **UGC moderation** — review SLA (e.g. 72 h), rules for hiding (ads, abuse, private info, unsafe
  advice), appeals, logging decisions.

## Software QA
- Test strategy: unit (Vitest), e2e + accessibility (Playwright/axe), visual checks on phone/tablet/
  desktop, performance budgets; CI on every PR (exists) + pre-release checklist.
- Release checklist: build, tests, preview review, content diff review, rollback plan.
- Monitoring: Vercel Analytics, error tracking (e.g. Sentry free tier), uptime check, broken-link
  and broken-image report (weekly script), Supabase backups.

## Deliverables
`docs/governance/content-policy.md`, `moderation-guidelines.md`, `release-checklist.md`, scripts:
stale-content report, link/image checker; moderation log table.
