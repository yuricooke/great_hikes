# Quickstart & Validation: Platform Rebuild

## Prerequisites

Node ≥ 20.9 (repo uses 22), npm.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

## Quality gates (must all pass before merging to main)

```bash
npm run typecheck
npm run lint
npm run test         # Vitest unit tests (data, slugs, redirects, filter)
npm run build        # fails on invalid hike data
npm run test:e2e     # Playwright journeys + axe accessibility scans
```

## Validation scenarios (map to spec)

| # | Scenario | Expected | Spec |
|---|----------|----------|------|
| V1 | Open `/` | Video (or poster with reduced motion) behind glass panel; "Let's Hike!" opens `/hikes` | US1, FR-010 |
| V2 | On `/hikes`, select 3 different hikes | Background + panel update each time; "Let's hike" opens the matching `/hikes/<slug>` | US1 |
| V3 | Open all 32 `/hikes/<slug>` (e2e loops over data) | 200, title/story/photo/credit/map/related present | US1, US5, SC-001 |
| V4 | Request `/Hikes`, `/Hikes/1`, `/Hikes/32`, `/Hikes/999` | 308→`/hikes`, 308→`/hikes/torres-del-paine-national-park`, 308→matching slug, 404 | US2, FR-005 |
| V5 | View source of a hike page | Unique `<title>`, meta description, canonical, `og:image` | US2, FR-006 |
| V6 | `/sitemap.xml` | 34 URLs | FR-007 |
| V7 | Viewport 360×800: run V1–V3 journey | No horizontal scroll; menu reachable and labeled | US3, FR-016 |
| V8 | Keyboard-only journey | All controls reachable with visible focus | US3, FR-015 |
| V9 | axe scan on `/`, `/hikes`, a hike, 404 | 0 serious/critical | SC-004 |
| V10 | Click every control on each page type | Each navigates or changes the UI | US4, SC-005 |
| V11 | `/hikes?continent=asia`, then `?continent=mars` | Only Asian hikes; then empty state with "All hikes" | US6 |
| V12 | Lighthouse mobile on the Vercel preview for `/` and a hike page | LCP ≤ 2.5 s, CLS ≤ 0.1; transferred bytes on `/hikes` ≥ 60% lower than production | SC-002, SC-003 |
| V13 | Paste a preview hike URL in WhatsApp/Instagram DM (or an OG debugger) | Card shows hike photo, title, description | SC-006 |
| V14 | Owner side-by-side review of preview vs production | Identity confirmed | SC-007 |

## Release

1. Push branch → Vercel preview builds with the Next.js preset (check build log).
2. Run V12–V14 on the preview URL.
3. Merge to `main` → production. Spot-check `/`, a hike, and `/Hikes/1` on
   `great-hikes.vercel.app`.
