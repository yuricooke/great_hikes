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

## Specs, in order

Each row is one Spec Kit feature (`specs/NNN-name/`). Order matters: each builds on the previous.
Discovery behind this order: `docs/discovery/` (problem, domain, product, outcomes O-1…O-6).

| Spec | Name | Outcome | Status |
|------|------|---------|--------|
| 000 | Foundation | Spec Kit, constitution, agents/skills, API research | Done (`relaunch/foundation`) |
| 001 | Platform rebuild (O-1, guardrails) | Next.js/TS, design tokens, new layout system with the same identity, readable hike URLs, SEO, optimized media, mobile nav | Spec + plan done; next: tasks → build |
| 002 | Landing & navigation (O-1) | `/` becomes the landing: today's featured hike as full-bleed hero + horizontal topic rails (Our top 10, landscapes, continents) with "See all"; first-level grid pages per topic; hike page as second level; slots for Journal and Shop sections | Built on preview (2026-10-07), incl. UI for journal, shop, feeds, sign-in & favorites |
| 003 | Accounts, database & favorites (O-4, O-6) | Supabase (Postgres + Auth): passwordless email link + Google; sign-in as glass modal from any page and full `/login` page with the video; seeded test user for local dev; favorites (heart on cards/hike pages) + `/favorites` page; owner role | Planned |
| 004 | Journal (O-1, O-6) | Articles ("stories") with full-bleed hero, glass reading column, inline hike link-cards, photo gallery rail, "hikes in this story" and related stories (ref: hellstrom.no journal); Journal section on landing | Planned |
| 005 | Shop — affiliates (O-5) | Gear pages and a Shop section on the landing with curated products from affiliate partners (REI, Patagonia, Backcountry…), disclosure, click tracking; gear per hike/season | Planned (owner signs up to affiliate programs) |
| 006 | Instagram import & AI curation (O-2, O-6) | Behold feeds imported; **agents propose, owner only approves** in the inbox (needs 003): quality score, place, credit, DM consent draft; publish; Instagram rails on the landing (IG features, photographers, community) | Prototype on `test/instagram-feed` |
| 007 | Hike enrichment (O-3) | Place → coordinates; trail data (OSM/national datasets) → distance, elevation gain, difficulty, season; interactive map + elevation profile; weather; sourced description drafts approved by the owner | Planned |
| 008 | Reviews & tips (O-4) | On-site reviews/ratings and practical tips per hike (signed-in users); Instagram comments only if API access allows | Planned |
| 009 | Community submissions (O-4) | "Share your hike" upload with contributor license, moderation queue, contributor profiles | Planned |
| 010 | Launch readiness (O-6, metrics) | Custom domain, analytics, privacy/terms/contributor license, performance + accessibility audit | Planned |

Order note (2026-10-07): the owner prioritized the UX shell (landing, accounts, journal, shop)
before the Instagram engine. Trade-off: the growth loop (H1–H3) is validated later; the
Instagram prototype keeps that risk low.

**Launch gate:** no fixed date. Launch when product specs 001–007 are live and the go-to-market
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
