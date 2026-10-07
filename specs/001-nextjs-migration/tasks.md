---
description: "Task list for spec 001 — Platform Rebuild with Preserved Identity"
---

# Tasks: Platform Rebuild with Preserved Identity

**Input**: `specs/001-nextjs-migration/` (plan.md, spec.md, research.md, data-model.md,
contracts/routes.md, quickstart.md)

**Tests**: Included — the plan and constitution quality gates require unit (Vitest), e2e
(Playwright) and accessibility (axe) checks.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependencies)
- Paths per plan.md: Next.js at repo root, app code in `src/`, data in `content/`, tests in `tests/`

---

## Phase 1: Setup

- [x] T001 Remove CRA app files (`src/App.js`, `src/index.js`, `src/pages/`, `src/components/`, `src/data/`, `src/img/`, CRA boilerplate) and untrack `build/`; add `build/`, `.next/`, `test-results/`, `playwright-report/` to `.gitignore`
- [x] T002 Replace `package.json` with Next.js 16 + React 19 + TypeScript + ESLint setup (scripts: dev, build, start, lint, typecheck, test, test:e2e); regenerate `package-lock.json`
- [x] T003 [P] Add `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `eslint.config.mjs`
- [x] T004 [P] Add `vercel.json` with `{ "framework": "nextjs" }`
- [x] T005 [P] Configure Vitest in `vitest.config.ts`; Playwright + axe in `playwright.config.ts`
- [x] T006 [P] Add CI workflow `.github/workflows/ci.yml` (install, typecheck, lint, unit, build, e2e)

## Phase 2: Foundational (blocks all stories)

- [x] T007 Design tokens in `src/styles/tokens.css` (glass fills, blur, borders, shadows, radii, text, spacing, type scale) extracted from legacy CSS (research R3)
- [x] T008 Global styles in `src/styles/globals.css` (reset, base typography, focus-visible ring, reduced-motion rules)
- [x] T009 [P] Zod schemas in `src/lib/schema.ts` (Hike, Photo, Continent) per data-model.md
- [x] T010 [P] Slug utility in `src/lib/slug.ts`
- [x] T011 Migration script `scripts/migrate-legacy-data.ts`: legacy JSON → `content/hikes.json`, move `public/NN.jpg` → `public/hikes/<slug>.jpg`; run it; delete legacy data
- [x] T012 Data accessors in `src/lib/hikes.ts` (all, bySlug, byLegacyId, related, byContinentKey, continents) with build-time validation and duplicate-slug check
- [x] T013 [P] Unit tests `tests/unit/hikes.test.ts` and `tests/unit/slug.test.ts` (32 hikes valid, unique slugs, related ≤ 6 same continent, continent keys)
- [x] T014 Root layout `src/app/layout.tsx`: next/font (Exo 2, Mukta), tokens/globals, metadataBase, skip link
- [x] T015 [P] Icon component `src/components/Icon/` with inline Material Symbols SVGs (hiking, group, favorite, person, arrow_back, menu, close, photo_camera, instagram link glyph)
- [x] T016 [P] Identity primitives: `GlassPanel`, `PillButton` (button + link variants), `BackgroundMedia` (fixed full-bleed `next/image` + scrim, optional video with poster and reduced-motion fallback)

## Phase 3: US1 — Same experience, rebuilt (P1) 🎯 MVP

**Independent test**: quickstart V1–V3 — home, hikes browser and all 32 hike pages match production content with the identity.

- [x] T017 [US1] Home page `src/app/page.tsx`: video background behind glass panel, logo, tagline, "Let's Hike!" → `/hikes`
- [x] T018 [P] [US1] `HikeCard` component `src/components/HikeCard/`
- [x] T019 [US1] `HikeBrowser` client component `src/components/HikeBrowser/`: selected hike drives background + glass info panel; list of cards; "Let's hike" → `/hikes/<slug>`
- [x] T020 [US1] Hikes page `src/app/hikes/page.tsx` rendering HikeBrowser (static)
- [x] T021 [US1] Hike page `src/app/hikes/[slug]/page.tsx` with `generateStaticParams`: new layout — hero (title, country, continent) over photo; glass content column (story, photo, location map); sidebar with related hikes; sections structured to host stats/map/gallery/reviews in later specs
- [x] T022 [US1] e2e `tests/e2e/journeys.spec.ts`: V1, V2, V3 (loop over all hikes)

## Phase 4: US2 — Shareable addresses (P1)

**Independent test**: quickstart V4–V6.

- [x] T023 [US2] `generateMetadata` for hike pages and static metadata for home/hikes (title, description, canonical, OG/Twitter image)
- [x] T024 [US2] Legacy redirects (`/Hikes`, `/Hikes/<id>`) — implemented in `src/proxy.ts` because next.config redirects match case-insensitively and looped `/hikes`
- [x] T025 [P] [US2] `src/app/sitemap.ts`, `src/app/robots.ts`
- [x] T026 [P] [US2] Branded `src/app/not-found.tsx` (noindex) with link to all hikes
- [x] T027 [US2] e2e `tests/e2e/routing.spec.ts`: redirects, 404s, metadata, sitemap count (V4–V6)

## Phase 5: US3 — Comfortable on a phone (P2)

**Independent test**: quickstart V7–V9.

- [x] T028 [US3] `Menu` component `src/components/Menu/`: desktop glass rail, phone top bar + drawer; labeled links Home, Hikes, Instagram; keyboard + Esc support
- [x] T029 [US3] Mobile-first responsive layouts for home, hikes, hike page (360 → 1440 px); contrast scrims under text over imagery
- [x] T030 [US3] e2e `tests/e2e/a11y.spec.ts`: axe scans on `/`, `/hikes`, a hike, 404; mobile 360px no horizontal scroll; keyboard focus

## Phase 6: US4 — Honest interface (P2)

- [x] T031 [US4] Verify no placeholder controls or fake review remain (favorite/rate/groups/official site/maps/contact/GPS/account); official site link shown only when `officialUrl` exists
- [x] T032 [US4] e2e check: every button/link on each page type has an action (V10)

## Phase 7: US5 — Photographer credits (P3)

- [x] T033 [P] [US5] `PhotoCredit` component and usage on hikes browser + hike page (V3 asserts credit link)

## Phase 8: US6 — Continent filter (P3)

- [x] T034 [US6] Continent filter in HikeBrowser via `?continent=` (`useSearchParams` in `<Suspense>`), empty state for unknown keys
- [x] T035 [US6] Unit test for filter helper + e2e V11

## Phase 9: Polish & cross-cutting

- [ ] T036 [P] Re-encode home video (≤ 1 MB mp4 + webm) and create poster in `public/video/` — deferred: ffmpeg not installed; video moved to `public/video/hikes.mp4` (2 MB), poster = first hike photo, not loaded for reduced-motion users
- [x] T037 [P] Optimize continent map SVGs (SVGO: 3.0 MB → 0.74 MB; Asia 289 KB, Europe 204 KB still > 150 KB — replaced by interactive maps in spec 003); delete unused assets
- [x] T038 Update `README.md` (English, new stack, scripts, links to docs/specs)
- [x] T039 Run all quality gates locally (typecheck, lint, unit, build, e2e)
- [ ] T040 design-guardian review of the diff; fix findings
- [ ] T041 Push branch; verify Vercel preview build uses Next.js preset; run V12–V13 on preview
- [ ] T042 Owner side-by-side review (V14) → merge to `main`

## Dependencies

- Setup (T001–T006) → Foundational (T007–T016) → stories.
- US1 (T017–T022) before US2 page metadata (T023) and US3 layout work (T029).
- US4–US6 depend on US1 components; US5/US6 can run in parallel.
- Polish after stories; T041–T042 last.

## Parallel examples

- After T012: T013, T015, T016 together.
- US2: T025 and T026 together while T023/T024 proceed.
- Polish: T036 and T037 together.

## Implementation strategy

MVP = Phases 1–4 (US1 + US2): the rebuilt, shareable site. Then US3/US4 (mobile, honesty),
US5/US6, polish, preview review, merge.
