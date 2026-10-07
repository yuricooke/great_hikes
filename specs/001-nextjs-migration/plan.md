# Implementation Plan: Platform Rebuild with Preserved Identity

**Branch**: `001-nextjs-migration` | **Date**: 2026-10-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-nextjs-migration/spec.md`

## Summary

Rebuild Great Hikes from Create React App into a statically generated Next.js 16 + TypeScript
site on Vercel, keeping the visual identity (full-bleed photos/video, glass/blur panels, pill
controls) while adding per-hike readable URLs with metadata, legacy redirects, optimized media,
mobile-first navigation, photo credits, a continent filter, and accessibility fixes. Hike data
moves to a validated, typed JSON file. Details: [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript (5.x as scaffolded by create-next-app 16), Node 22

**Primary Dependencies**: Next.js 16 (App Router), React 19, Zod 4 (data validation)

**Storage**: `content/hikes.json` (static, validated at build); images in `public/`

**Testing**: Vitest (unit), Playwright + @axe-core/playwright (e2e, accessibility), Lighthouse

**Target Platform**: Web — Vercel (static pages + image optimization); evergreen browsers, iOS
Safari/Android Chrome first

**Project Type**: Web application (single Next.js project, no separate backend)

**Performance Goals**: Mobile LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms; `/hikes` transfer ≥ 60% lower
than current production

**Constraints**: Visual identity unchanged (owner sign-off); WCAG 2.2 AA; zero downtime at
`great-hikes.vercel.app`; no new paid services

**Scale/Scope**: 32 hikes, 4 page types (home, hikes, hike, not-found), ~10 components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How this plan complies | Status |
|-----------|------------------------|--------|
| I. Visual Identity | Identity captured as tokens (R3); glass/blur, photo/video backgrounds, pill buttons kept; owner side-by-side review (V14) | ✅ |
| II. Community-Fed Content | Justified exception: this is the platform for later UGC features. Contribution hooks: photo credit component (reused for community photos), extensible `Photo`/`Hike` schema, Instagram link in menu | ✅ (justified) |
| III. Consent & Attribution | Every image shows credit + source link; Pexels license recorded; no third-party content added | ✅ |
| IV. Fast, Findable Pages | Static pages, per-hike metadata, sitemap, `next/image`, video poster/reduced size, no render-blocking CDN CSS/fonts | ✅ |
| V. Accessible & Mobile-First | Mobile-first CSS, contrast scrims, real links/buttons, focus styles, reduced-motion video, axe in CI | ✅ |
| VI. Lean Solo Operations | No database or paid services; Vercel Hobby + GitHub Actions free; fewer dependencies than today | ✅ |
| Stack/workflow constraints | Next.js + TS on Vercel, English, feature branch, quality gates, `build/` removed from git | ✅ |

**Post-design re-check (after Phase 1)**: still passing; no violations, Complexity Tracking empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-nextjs-migration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/routes.md
├── checklists/requirements.md
└── tasks.md             # created by /speckit-tasks
```

### Source Code (repository root)

```text
content/
└── hikes.json                 # migrated, validated hike data
public/
├── hikes/<slug>.jpg           # 32 hike photos (moved from public/NN.jpg)
├── maps/*.svg                 # optimized continent maps
├── video/hikes.mp4|.webm      # re-encoded home video + poster.jpg
└── great_hikes.svg, icons, manifest
src/
├── app/
│   ├── layout.tsx             # fonts, tokens, Menu, metadataBase
│   ├── page.tsx               # Home
│   ├── hikes/page.tsx         # Hikes browser (static) + <Suspense> filter
│   ├── hikes/[slug]/page.tsx  # Hike page, generateStaticParams/generateMetadata
│   ├── not-found.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── Menu/                  # mobile-first nav (drawer on phone, rail on desktop)
│   ├── BackgroundMedia/       # fixed full-bleed image/video layer + scrim
│   ├── GlassPanel/
│   ├── PillButton/            # button + link variants
│   ├── HikeCard/
│   ├── HikeBrowser/           # client: selection + continent filter
│   ├── PhotoCredit/
│   └── Icon/                  # inline Material Symbols SVGs
├── lib/
│   ├── hikes.ts               # load + Zod-validate + accessors (bySlug, related, byContinent)
│   ├── schema.ts              # Zod schemas (Hike, Photo, Continent)
│   └── slug.ts
└── styles/
    ├── tokens.css             # identity design tokens
    └── globals.css
scripts/
└── migrate-legacy-data.ts     # one-off: legacy JSON → content/hikes.json + file moves
tests/
├── unit/                      # Vitest
└── e2e/                       # Playwright + axe
next.config.ts                 # legacy redirects generated from data
vercel.json                    # { "framework": "nextjs" }
.github/workflows/ci.yml
```

Removed: `src/` CRA files (`App.js`, `pages/`, `components/`, `data/`, `img/`, CRA boilerplate),
`build/`, unused `public/` assets (`Chile.svg`, `Peru.svg`, `logo.svg`, `favicona.ico`, CRA logos
if replaced).

**Structure Decision**: Single Next.js project at the repo root using `src/` for app code,
`content/` for data (so non-developers and future scripts can edit it), and `tests/` split by
level. No backend directory until community submissions (roadmap phase 3).

## Implementation phases (input for /speckit-tasks)

1. **Scaffold**: Next.js + TS + ESLint in place of CRA; tokens/globals; fonts; Vitest/Playwright;
   CI; `vercel.json`; remove `build/` from git.
2. **Data**: Zod schema, migration script, `content/hikes.json`, photo moves, accessors + tests.
3. **US1** Home, Hikes browser, Hike page with identity components.
4. **US2** Slugs, metadata, OG, sitemap/robots, redirects, not-found.
5. **US3/US4** Mobile menu, contrast scrims, focus states, remove dead controls & fake review.
6. **US5/US6** Photo credits, continent filter.
7. **Media optimization**: video re-encode + poster, map SVG optimization.
8. **Verify & release**: quickstart V1–V14 on preview, owner review, merge to `main`.

## Complexity Tracking

No constitution violations to justify.
