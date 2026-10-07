# Great Hikes

Community-fed website for hikers and nature lovers, growing from the @great_hikes Instagram
collective. Live at https://great-hikes.vercel.app (Vercel auto-deploys `main`).

**Read first:** `.specify/memory/constitution.md` — the non-negotiable principles (visual
identity, community content, consent & attribution, performance, accessibility, lean ops).

## Current state (relaunch in progress)

- Legacy app: Create React App in `src/` (pages `Home`, `Hikes`, `HikeDetails`), data in
  `src/data/hikes.json` (32 hikes), images in `public/`. Many buttons are prototype placeholders.
- Target: Next.js (App Router) + TypeScript on Vercel. English only.
- Roadmap and ideas: `docs/roadmap.md`. API/integration research:
  `docs/research/apis-and-integrations.md`.

## Workflow

- Spec Kit: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` →
  `/speckit-implement`. Specs live in `specs/NNN-name/`.
- Work on a feature branch; verify build/tests before merging to `main` (= production).
- Don't commit build output (`build/`, `.next/`).

## Design identity (summary)

Full-bleed nature photo/video backgrounds, frosted-glass blur panels, dark pill buttons, the
Great Hikes logo. Improve UX/UI, never replace the identity. Text over imagery must meet WCAG AA.
Use the `design-guardian` agent to review UI changes.

## Community content

Never publish someone's photo/text without recorded permission; always credit the creator.
Use the `ugc-curation` skill when handling submissions or Instagram features.

## Project agents and skills

- Agents (`.claude/agents/`): `design-guardian`, `content-curator`, `trail-data-engineer`.
- Skills (`.claude/skills/`): `add-hike`, `ugc-curation`, plus the `speckit-*` skills.
