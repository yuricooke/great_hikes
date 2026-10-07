# Research: Platform Rebuild with Preserved Identity

Feature: [spec.md](./spec.md) · Date: 2026-10-07. Versions checked with `npm view` on that date.

## R1. Framework and rendering

- **Decision**: Next.js 16 (App Router) with React 19, all pages statically generated
  (`generateStaticParams` for the 32 hikes). Node 22 (installed; Next requires ≥ 20.9).
- **Rationale**: Constitution (stack + Principle IV). Static pages give per-hike URLs, metadata and
  fast first loads with no server cost on Vercel.
- **Alternatives**: Vite + React SPA (no per-page metadata without extra tooling); Astro (great
  for content, but the roadmap needs accounts, forms and commerce where Next.js is stronger).

## R2. TypeScript version

- **Decision**: Use the TypeScript version that `create-next-app@16` scaffolds (expected 5.x);
  do not adopt TypeScript 7 (native compiler, released recently) until Next.js documents support.
- **Rationale**: Avoid toolchain breakage at launch; upgrade is a later, isolated change.

## R3. Styling and design tokens (identity preservation)

- **Decision**: Drop the Bootstrap CDN stylesheet. Plain CSS with **CSS Modules** per component
  and one `tokens.css` holding the identity as custom properties.
- **Tokens extracted from the current CSS** (to be kept, then tuned for contrast):
  - Glass panel: `rgba(0,0,0,0.16)`–`rgba(0,0,0,0.40)` fills, `backdrop-filter: blur(3–10px)`,
    border `1px solid rgba(255,255,255,0.10–0.19)`, shadow `2px 2px 10px 5px rgba(0,0,0,0.2)`.
  - Radii: panel 30px, card 10px, pill 35px/9999px.
  - Text `#f1f1f1` on dark; page base `#090909`.
  - Fonts: **Exo 2** (headings), **Mukta** (body); `Armata` is referenced but never loaded →
    falls back today; replace with Mukta (visually unchanged in production).
- **Rationale**: Bootstrap is only used for a handful of utilities (`row`, `col-lg-*`, `btn`,
  `rounded-pill`, spacing) yet costs a render-blocking stylesheet. Tokens satisfy FR-003.
- **Alternatives**: Tailwind (would re-express the identity in utility classes — larger rewrite,
  no gain for 3 screens); keep Bootstrap (blocking CSS, harder theming).
- **Contrast**: add a subtle dark gradient/scrim under text on photos and raise panel opacity
  where needed to meet WCAG AA against all 32 photos (FR-015) — still glass, still blurred.

## R4. Fonts and icons

- **Decision**: `next/font/google` for Exo 2 and Mukta (self-hosted, no layout shift). Replace the
  full Material Symbols variable font with **inline SVG icons from Material Symbols** (Apache-2.0)
  for the ~6 icons used (hiking, group, favorite, person, arrow back, menu, close, photo).
- **Rationale**: The variable icon font is hundreds of KB and render-blocking; SVGs keep the exact
  same glyph style.

## R5. Images, background media, maps

- **Decision**:
  - Photos move to `public/hikes/<slug>.jpg`; rendered with `next/image` (responsive sizes,
    AVIF/WebP, lazy below the fold). Full-bleed backgrounds use `next/image` with `fill` +
    `object-fit: cover` in a fixed layer (instead of CSS `background-image`) so they are optimized;
    the first visible one gets `priority`.
  - Home video: re-encode to ≤ 1 MB (H.264 720p, plus WebM), add `poster` still; don't render the
    `<video>` when `prefers-reduced-motion: reduce` (FR-010), show the poster image instead.
  - Continent map SVGs are 0.2–1.5 MB each: run through SVGO (or rasterize to WebP if still
    > 150 KB). Unused `Chile.svg`, `Peru.svg`, `src/img/*` are removed.
- **Rationale**: SC-002/SC-003 (≥ 60% less data). Vercel Hobby image optimization limits are far
  above 32 source images.

## R6. Data and validation

- **Decision**: Move hikes to `content/hikes.json` with an added `slug` and a structured `photo`
  object; validate at build time with **Zod**; expose typed accessors from `src/lib/hikes.ts`.
  Build fails on invalid data or duplicate slugs.
- **Rationale**: FR-019 (typed and extensible) without a database yet (Principle VI). A database
  arrives with community submissions (roadmap phase 3).
- **Slugs**: lowercase title, non-alphanumerics → `-`. Verified: all 32 current titles produce
  unique slugs. Slugs are stored (not recomputed) so renaming a title never breaks a URL.

## R7. Legacy URL redirects

- **Decision**: `redirects()` in `next.config.ts` generated from the data: `/Hikes` → `/hikes`
  and `/Hikes/<id>` → `/hikes/<slug>` (permanent, 308). Unknown ids fall through to the
  not-found page.
- **Rationale**: FR-005 with zero runtime code.

## R8. Continent filter

- **Decision**: `/hikes?continent=south-america`. The hikes page stays static; a client component
  reads the query (`useSearchParams` inside `<Suspense>`) and filters the list in the browser.
- **Rationale**: Shareable (FR-014) without making the page dynamic. 32 items need no server
  filtering.

## R9. Metadata, sitemap, previews

- **Decision**: `generateMetadata` per hike (title, description, canonical, Open Graph + Twitter
  image = hike photo at 1200×630 via `next/image`-compatible static asset); `app/sitemap.ts` and
  `app/robots.ts`. `metadataBase` = `https://great-hikes.vercel.app` (env-overridable for a
  future custom domain).

## R10. Deployment without downtime

- **Decision**: Replace CRA in place on the feature branch. Add `vercel.json` with
  `"framework": "nextjs"` so the Vercel project (currently set up for Create React App) builds
  the branch correctly; validate on the branch preview URL before merging to `main`. Remove the
  committed `build/` folder and add it plus `.next/` to `.gitignore`.
- **Risk**: if the project-level Build/Output settings were overridden manually in the Vercel
  dashboard, they may win over the framework preset → check the preview build log; if needed
  the owner resets them to defaults in Project Settings → Build & Deployment.

## R11. Testing and quality gates

- **Decision**:
  - **Vitest** — unit tests for data validation, slugs, redirects map, continent filter.
  - **Playwright** — e2e journeys (Home → Hikes → hike → related hike → back; legacy redirects;
    404; continent filter; mobile 360px viewport) plus **@axe-core/playwright** accessibility
    scan of every page type (SC-004).
  - Lighthouse (mobile) on the Vercel preview for SC-002/SC-003.
  - GitHub Actions on pull requests: typecheck, lint, unit tests, build, e2e.
- **Rationale**: Constitution quality gates; replaces the broken CRA default test.

## R12. Dependencies removed

`react-scripts`, `localforage`, `match-sorter`, `sort-by`, `web-vitals`, the testing-library
CRA set, Bootstrap CDN, Material Symbols font CDN.
