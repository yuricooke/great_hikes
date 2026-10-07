![Great Hikes logo](public/great_hikes.svg "Great Hikes")

# Great Hikes

Great hikes from hikers for hikers — a community-fed website for hikers and nature lovers,
growing from the [@great_hikes](https://www.instagram.com/great_hikes/) Instagram collective.

Live: **https://great-hikes.vercel.app**

Originally an MVP for the PUC-Rio postgraduate course in Full-Stack Development
([Figma prototype](https://www.figma.com/file/M9rx0jiaPSyYfFKNZ3Njl5/great_hikes-mvp),
[presentation video](https://www.youtube.com/watch?v=orzSUKWyznQ)); now being relaunched.

## Stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript, statically generated
- Plain CSS Modules with design tokens (`src/styles/tokens.css`) — photo backgrounds and
  frosted-glass panels are the visual identity
- Hike data in `content/hikes.json`, validated with Zod at build time
- Hosted on Vercel; `main` deploys to production

## Getting started

Requires Node ≥ 20.9.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Quality checks

```bash
npm run typecheck
npm run lint
npm test           # unit tests (Vitest)
npm run build
npm run test:e2e   # end-to-end + accessibility (Playwright + axe); run after build
```

CI runs all of these on every pull request (`.github/workflows/ci.yml`).

## Project docs

- Principles: `.specify/memory/constitution.md`
- Discovery (problem, domain, product, outcomes): `docs/discovery/`
- Roadmap: `docs/roadmap.md`
- Feature specs (Spec Kit): `specs/`
- API & integration research: `docs/research/apis-and-integrations.md`
