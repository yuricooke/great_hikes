# Implementation Plan: Landing & Navigation

**Branch**: `002-landing-navigation` | **Date**: 2026-10-07 | **Spec**: [spec.md](./spec.md)

## Summary

Replace the video home and the selection-style hikes browser with a landing (today's featured hike
as hero + data-driven horizontal topic rails), first-level topic grid pages and an all-hikes grid,
keeping the spec 001 identity components.

## Technical Context

Same stack as spec 001 (Next.js 16 static generation, TypeScript, CSS Modules + tokens, Zod data
validation, Vitest + Playwright/axe). No new dependencies or services.

## Constitution Check

| Principle | Compliance | Status |
|-----------|-----------|--------|
| I Identity | Full-bleed photo backgrounds, glass hero/header/rail bands, dark pills; Nortura reference used for structure only | ✅ |
| II Community | Landing sections are data-driven so Instagram/journal/shop rails plug in later (FR-003) | ✅ |
| III Consent | Every card/hero photo credited on its hike page; hero excludes photos without a source | ✅ |
| IV Fast pages | All pages static; landing regenerates hourly (ISR) for the daily feature; lazy images in rails | ✅ |
| V Accessible | Rails: real buttons with labels, keyboard focus, reduced-motion scrolling; axe on all page types | ✅ |
| VI Lean | No new services; data files editable by the owner | ✅ |

## Design decisions

- **Topics** live in `content/topics.json` (`ranked` list, `landscape` rule, `continent` rule) and
  `landing` order; hikes gain `landscapes[]`. Validated at build time.
- **Featured hike**: deterministic daily rotation (UTC) over hikes with a credited photo,
  shuffled per cycle (no repeats within a cycle); landing `revalidate = 3600`.
- **Rails**: CSS scroll-snap list (swipe on touch), prev/next buttons on ≥ 992px, "See all".
- **URLs**: `/` landing, `/explore/<topic>` grids, `/hikes` all-hikes grid, `/hikes/<slug>` hike.
  `/hikes?continent=` (spec 001) → 308 to `/explore/<continent>` in `src/proxy.ts`.
- Spec 001's `HikeBrowser` is removed; `BackgroundVideo` stays for the sign-in page (spec 003).

## Project structure (new/changed)

```text
content/topics.json, content/hikes.json (landscapes)
src/lib/topics.ts, src/lib/featured.ts, src/lib/schema.ts
src/app/page.tsx (landing), src/app/explore/[topic]/page.tsx, src/app/hikes/page.tsx
src/components/{PhotoCard,Rail,HikeGrid,Breadcrumb,ListingHeader}
tests/unit/topics.test.ts, tests/e2e/* updated
```

## Complexity Tracking

None.
