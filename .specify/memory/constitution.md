<!--
Sync Impact Report
- Version change: 1.2.0 → 1.3.0 (MINOR: new Principle VII "Red Lines" — owner approved the
  14 content & business red lines on 2026-10-08; full text in docs/business/red-lines.md)
- Previous (1.2.0): Principle III gains a scoped exception for embedding the @great_hikes
  Instagram feed; owner approved going live with it 2026-10-07
- Previous (1.1.0): discovery & outcomes added to the workflow
- Modified sections: Development Workflow & Quality Gates (discovery, outcome traceability,
  production-metrics feedback loop)
- Templates: no edits required; specs reference outcomes in their Context section
- Previous report (1.0.0): initial ratification of Principles I–VI
- Principles defined: I. Visual Identity Is the Brand; II. Community-Fed Content;
  III. Consent & Attribution (NON-NEGOTIABLE); IV. Fast, Findable Pages;
  V. Accessible & Mobile-First; VI. Lean Solo Operations
- Added sections: Technology & Data Constraints; Development Workflow & Quality Gates; Governance
- Removed sections: none
- Templates: plan/spec/tasks templates read this file at runtime; no edits required
- Deferred TODOs: none
-->

# Great Hikes Constitution

Great Hikes is a community-fed website for hikers and nature lovers: famous and lesser-known
trails around the world, told and illustrated by the people who walked them. It grows from the
@great_hikes Instagram collective, where hikers tagged the account and were featured.

## Core Principles

### I. Visual Identity Is the Brand

- Every screen MUST keep the established identity: full-bleed nature photography or video as the
  background, frosted-glass (backdrop blur) panels, dark rounded "pill" controls, and the
  Great Hikes logo.
- UX/UI work MUST evolve this identity (layout, typography, spacing, motion, contrast,
  navigation) and MUST NOT replace it with a different aesthetic.
- Design tokens (colors, blur strength, radii, spacing, type scale) MUST live in one shared
  place so the identity stays consistent across pages, including the shop.

Rationale: the owner designed this look and it is the product's recognizable brand.

### II. Community-Fed Content

- The site MUST be designed to grow from user contributions: photos, trip reports, tips,
  ratings and comments.
- Every new feature spec MUST state how it captures, features, or credits community content,
  or explicitly justify why it does not.
- Being featured MUST feel rewarding: contributors get visible credit (name/handle, link to
  their Instagram or profile) wherever their content appears.
- Editorial curation (approve/feature/reject) MUST exist before any contribution is public.

Rationale: the project's growth loop is "hikers share → get featured → share the site → more
hikers contribute".

### III. Consent & Attribution (NON-NEGOTIABLE)

- No third-party photo or text MAY be published without the creator's explicit, recorded
  permission (on-site submission with license acceptance, or a logged opt-in such as a reply or
  hashtag confirmation). A tag or mention alone is NOT permission.
- Every published item MUST store: source, creator handle, permission evidence, date, and
  license scope; and MUST be removable on request (takedown path visible to users).
- Integrations MUST use official APIs or authorized services within their terms. Scraping,
  unofficial APIs, and creating accounts that violate a platform's terms are forbidden.
- Data and image licenses (e.g., OSM ODbL, Unsplash/Pexels, CC licenses) MUST be honored with
  the required attribution.
- Exception — Instagram embed: the site MAY show posts published by the @great_hikes account itself
  through its authorized feed (official API via Behold), unedited, with the photographer's credit
  and a link to the original post. Posts without an identifiable photographer MUST NOT be shown.
  Anything beyond the embed (standalone feature pages, edits, crops for other uses, shop/merch)
  still requires recorded permission.

Rationale: featuring people's work without consent destroys the community trust the project
depends on, and creates legal risk.

### IV. Fast, Findable Pages

- Each hike, region, and featured story MUST be a server-rendered or statically generated page
  with its own URL, title, description, and social preview image.
- Images MUST be responsive and optimized (modern formats, correct sizes, lazy-loaded below the
  fold); background media MUST NOT block first render.
- Target Core Web Vitals "good" on mobile: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms.
- External data that changes rarely (trail geometry, elevation) MUST be fetched at build or
  ingestion time, not on every page view.

Rationale: visitors arrive from Instagram links and search on phones; slow or invisible pages
lose them.

### V. Accessible & Mobile-First

- Layouts MUST be designed for phones first, then scaled up.
- Text over photos or blur MUST meet WCAG 2.2 AA contrast; interactive elements MUST be real
  buttons/links, keyboard-reachable, with visible focus and accessible names.
- Motion and background video MUST respect `prefers-reduced-motion`.

Rationale: beautiful backgrounds must not cost readability or exclude users.

### VI. Lean Solo Operations

- Prefer managed services and free/low tiers that a solo founder can run; every recurring cost
  MUST be named in the plan that introduces it.
- Start with the simplest thing that works (YAGNI); new infrastructure MUST be justified in the
  plan's complexity section.
- Commerce starts with affiliate links; holding inventory or building a custom store requires a
  constitution amendment.

Rationale: the project must be sustainable by one person before it has revenue.

### VII. Red Lines (NON-NEGOTIABLE)

The owner-approved red lines in `docs/business/red-lines.md` bind every spec, agent and partner
deal. In short, Great Hikes MUST NOT:

- publish explicit, hateful or shock content, or anyone's work without permission and credit;
- present AI-generated or AI-edited images as real places;
- promote unsafe or illegal behaviour, or expose sensitive locations that authorities or
  communities ask to keep private;
- publish fake, bought or incentivised reviews, or hide honest negative ones;
- sell placement inside guides, rankings or the top 10, or leave affiliate/sponsored content
  unlabelled;
- sell or rent personal data, track without consent, or use dark patterns.

Rationale: community trust is the asset the business is built on (strategy B1).

## Technology & Data Constraints

- Language: all user-facing content, code, and docs in English.
- Stack: Next.js (App Router) + TypeScript, deployed on Vercel. Styling MUST implement the shared
  design tokens from Principle I.
- Data: hikes are structured records (id/slug, title, region, country, coordinates, distance,
  elevation gain, difficulty, season, biome, description, sources, media with credits).
- Integrations (see `docs/research/apis-and-integrations.md`): OpenStreetMap/Overpass and national
  open datasets for trails; OpenBeta for climbing; Unsplash/Pexels/Wikimedia for photos; MapLibre
  for maps; Instagram only via authorized services usable without a Facebook account.
- Secrets MUST live in Vercel environment variables, never in the repo.

## Development Workflow & Quality Gates

- Work happens on feature branches; `main` is production (Vercel auto-deploys it).
- Work flows from discovery to delivery (`docs/discovery/README.md`): business problem → domain
  discovery → product discovery → outcomes → intent → Spec Kit (specify → clarify → plan →
  tasks → implement) → validation → production metrics → back to discovery.
- Every spec MUST name the business outcome(s) it serves (`O-n` in
  `docs/discovery/04-outcomes-and-metrics.md`) and how success is measured in production.
- Risky or uncertain ideas SHOULD be validated with a cheap prototype or test before a full spec.
- After each production release, measured results MUST be recorded in
  `docs/discovery/learning-log.md` and fed back into discovery and the roadmap.
- Before merging to `main`: type-check, lint, tests, and a production build MUST pass, and the
  Vercel preview MUST be checked on mobile and desktop.
- UI changes MUST be reviewed against Principles I and V.
- Generated build output (`build/`, `.next/`) MUST NOT be committed.

## Governance

This constitution supersedes other practices in this repository. Amendments are made by editing
this file with a Sync Impact Report, bumping the version (MAJOR: principle removed or redefined;
MINOR: principle or section added or materially expanded; PATCH: clarification), and updating
dependent docs. Every plan MUST include a Constitution Check against these principles; violations
MUST be justified in the plan's complexity tracking or the feature changed. Runtime guidance for
agents lives in `CLAUDE.md`.

**Version**: 1.3.0 | **Ratified**: 2026-10-07 | **Last Amended**: 2026-10-08
