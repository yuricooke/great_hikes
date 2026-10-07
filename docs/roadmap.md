# Great Hikes — Relaunch Roadmap

Started 2026-10-07. Each phase becomes one or more Spec Kit features (`specs/NNN-name/`).
Principles: `.specify/memory/constitution.md`. Integration research:
`docs/research/apis-and-integrations.md`.

## The core loop

```
Hiker posts on Instagram / submits on site
        → curated & featured on Great Hikes (with credit)
        → hiker shares "I'm featured" with their followers
        → new visitors discover hikes, follow @great_hikes, contribute
```

Everything we build should strengthen this loop.

## Specs, in order (updated 2026-10-07, evening)

Each row is one Spec Kit feature (`specs/NNN-name/`). Discovery behind the order: `docs/discovery/`.

| Spec | Name | Outcome | Status |
|------|------|---------|--------|
| 000 | Foundation | Spec Kit, constitution, agents/skills, research | ✅ Done |
| 001 | Platform rebuild (O-1) | Next.js/TS, design tokens, readable URLs, SEO, tests/CI | ✅ Live |
| 002 | Landing & navigation (O-1) | Video hero + logo (parallax), top 10, today's feature, community features, journal/shop/explore rails, search, topic pages, floating menu, footer, ad slots; demo sign-in & favorites (preview only) | ✅ Live (samples hidden in production); spec docs need a catch-up of the later layout changes |
| 003 | Accounts & favorites (O-4, O-6) | Supabase Auth (email link, then Google), profiles/favorites tables with RLS, seeded test user, favorites on any device; sign-in live in production | Next — waiting on owner: `vercel env pull` + Supabase redirect URLs |
| 004 | Trust pages & analytics (O-5, O-6) | About, affiliate disclosure, privacy policy, terms, contact; Vercel Web Analytics; needed before applying to affiliates | Planned |
| 005 | Journal content (O-1, O-6) | 10+ real guides (MDX), editorial workflow, replace samples | Planned (content from owner + drafts) |
| 006 | Shop with partner feeds (O-5) | AvantLink feeds → nightly import (Vercel Cron) → Supabase `products`; curated SKUs, licensed images & prices, `/go` click logging, gear per hike; merch (Printful) later | Planned — after affiliate approval |
| 007 | Ads management (O-5) | Ads from the database, click/impression counts, frequency caps, targeting by favorites/search; partner campaigns | Planned |
| 008 | Hike enrichment (O-3) | Coordinates, OSM trail data, distance/elevation/difficulty/season, interactive map, elevation profile, weather | Planned |
| 009 | Reviews & tips (O-4) | Ratings, reviews and tips from signed-in users, moderation | Planned |
| 010 | Community submissions (O-4) | "Share your hike" with contributor license, moderation, contributor profiles | Planned |
| 011 | Instagram curation agents (O-2) | AI-prepared approval inbox | Paused by owner |
| 012 | International relaunch | Languages and per-country affiliates (Spain, France, Greece, Brazil, Turkey, Thailand…) | Later |

**Launch gate:** no fixed date. Launch when specs 001–006 are live and the go-to-market
plan (marketing track below) is approved.

### Marketing track (runs in parallel with code)

| Item | Outcome |
|------|---------|
| M1 · Go-to-market plan | Positioning, audiences, channels, content calendar, launch campaign |
| M2 · Investment & return plan | Budget per phase, target cost per engaged visitor/follower, payback rules |
| M3 · Ads test | Small-budget test campaigns validating H7 before scaling |
| M4 · Launch campaign | Coordinated launch across Instagram, featured photographers, ads |

Notes from the Instagram prototype (2026-10-07):
- @great_hikes captions follow "Place | @photographer" → title + credit can be parsed automatically.
- Instagram strips photo GPS/EXIF and Behold doesn't expose the post's location tag, so a hike's
  location comes from the caption place name (geocoded) and is confirmed by the owner during
  curation.
- Hashtag results don't include the author; credit for #great_hikes posts must be added in curation.

## Instagram plan

What we know (research doc, sections 5–6):
- Meta's official APIs need a Meta developer app, which needs a Facebook login → not available to
  the owner, and creating a new Facebook account would breach Meta's terms.
- Behold.so (authorize with Instagram only) can display the @great_hikes feed. Confirm with
  Behold that no Facebook account is needed before paying.
- Automatically discovering posts that **tag** @great_hikes requires API endpoints that may not be
  available through these services → **verify before committing to it**.
- The community already uses the hashtag **#great_hikes**. Instagram's Hashtag Search API is part
  of the Facebook-login API, so automating it hinges on the account recovery / Behold checks.
  The hashtag is open to anyone, so it's a discovery signal, not consent.

Decided approach (owner decisions 2026-10-07):
1. **Agents curate, owner approves** (spec 006): collect feeds → AI quality score → place +
   geocode → credit → consent request → enrichment (spec 007) → publish → repost.
2. **No credit, no feature:** a post without an identifiable @photographer is discarded.
3. **Consent by Instagram DM** (no consent hashtag): the agent drafts a personalized DM asking the
   photographer to reply "yes"; the owner sends it with one tap (opens the DM with the text
   ready). Instagram's messaging API does not let businesses start conversations, so the first
   DM stays one tap even with developer access; with access, the reply can be detected
   automatically. The owner marks consent (with a screenshot/link as evidence) otherwise.
4. **Repost automation** (Content Publishing API) once the owner gets Meta developer access.
5. **Close the loop:** each featured photographer gets a page and a "Featured on Great Hikes"
   story card to share.
6. **Own the submission channel** later (spec 009): bio link → `/share` with contributor license.

## Idea backlog

- Featured Hiker of the Week (home hero rotates community photos).
- Contributor profiles with their hikes, photos and "summits" count; badges.
- "Hiked it" stamps and a personal bucket list / passport map.
- Best-right-now discovery: hikes in season this month, by hemisphere.
- Filters: continent, country, biome, difficulty, duration, multi-day vs day hike.
- Practical tips per hike from the community (water, permits, transport, huts), upvoted.
- Climbing routes near each hike (OpenBeta).
- Leave No Trace and safety notes per hike.
- Newsletter: monthly "great hikes" digest featuring community photos.
- Groups/meetups — later; needs safety and liability review.
- Merch drops with community photography (revenue share with featured photographers).

## Open decisions

- Backend for UGC (Supabase vs. Neon + Vercel Blob + Auth.js) — decide in phase 3 plan.
- Custom domain name.
- Whether Behold (or another authorized service) supports tagged-post discovery without Facebook.
