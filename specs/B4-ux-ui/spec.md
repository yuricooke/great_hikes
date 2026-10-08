# B4 — UX/UI: design system & experience audit

**Status:** to do. Identity is fixed (constitution I: photo backgrounds, glass panels, pill
buttons, logo) — this spec makes it consistent and measurable.

## Scope
1. **Design system doc** — tokens (colour, glass, type, spacing, radius, motion), components
   inventory (Hero, Rail, cards, glass panels, pills, gallery, lightbox, forms, map), states,
   do/don't with screenshots. Source of truth: `src/styles/tokens.css`.
2. **UX audit** — key journeys on phone/tablet/desktop: discover → hike → trail → save; sign-up;
   share a photo/hike; review; shop click-out; map. Heuristic review + issues list with severity.
3. **Information architecture** — menu, footer, page hierarchy, naming (Hikes vs Places vs Trails).
4. **Accessibility audit** — WCAG 2.2 AA beyond automated axe tests (screen reader, keyboard,
   contrast over photos, motion).
5. **Performance budget** — LCP, INP, CLS targets per page type; image/video budgets (hero video
   compression pending).
6. **Usability testing** — 5 hikers (US), task-based, before launch.
7. **Brand assets** — logo variants, social templates, share cards.

## Deliverables
`docs/design/design-system.md`, `docs/design/ux-audit.md` (prioritised issues → specs),
Figma or screenshots library, performance budget in CI.
