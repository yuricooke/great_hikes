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
| 002 | Instagram import & curation (O-2, O-6) | Behold feeds (@great_hikes posts + #great_hikes) imported into the site; owner curates each post, links it to a hike, records credit/consent; "Our selection" + "From the community" pages; lightbox | Prototype on `test/instagram-feed` (2026-10-07) |
| 003 | Hike enrichment (O-3) | From a curated post's place name: geocode → coordinates; trail data (OSM/national datasets) → distance, elevation gain, difficulty, season; interactive map + elevation profile; weather; description drafted from sourced facts and approved by the owner | Planned |
| 004 | Reviews & tips (O-4) | On-site reviews/ratings and practical tips per hike; Instagram comments shown only if API access allows (Behold gives counts, not comments) | Planned |
| 005 | Community submissions (O-4) | Accounts, "Share your hike" upload with contributor license, moderation queue, contributor profiles | Planned (needs backend, e.g. Supabase) |
| 006 | Gear (affiliates) (O-5) | Gear lists per hike/season with affiliate links | Planned |
| 007 | Launch readiness (O-6, metrics) | Custom domain, analytics, privacy/terms/contributor license, performance + accessibility audit | Planned |

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

Proposed approach (works regardless of the API outcome):
1. **Show the feed** on the site via Behold (featured posts link back to the creator).
2. **Own the submission channel**: bio link + story highlights point to
   `greathikes…/share`. Contributors upload original photos + story + tips and accept the
   contributor license. This gives full-resolution images, structured data and clear consent.
3. **Consent-based import of tagged posts**: when someone tags @great_hikes, the owner replies
   "We'd love to feature this on great-hikes — reply #yesgreathikes to agree". In the admin,
   the owner pastes the post URL; the import is recorded with that consent evidence. Automate
   discovery later if an authorized API path is confirmed.
4. **Close the loop**: each featured item gets a page and a downloadable "Featured on Great
   Hikes" story card the creator can post, tagging @great_hikes.

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
