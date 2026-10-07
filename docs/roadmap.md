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

## Phases

| # | Phase | Outcome | Notes |
|---|-------|---------|-------|
| 0 | Foundation | Spec Kit, constitution, agents/skills, research | Done on `relaunch/foundation` |
| 1 | Next.js migration + design system | Same identity, rebuilt in Next.js/TS; design tokens; real hike URLs (slugs), SEO metadata, optimized images; mobile-first navigation | First spec (001) |
| 2 | Rich hike pages | Data model (coords, distance, elevation, difficulty, season, permits, sources); MapLibre trail map from OSM GeoJSON; elevation profile; weather; photo gallery with credits; search & filters | OSM at build time; MapTiler free tier |
| 3 | Community submissions (UGC core) | "Share your hike" flow: photos + story + tips, contributor license; accounts; moderation queue; contributor profile pages | Needs backend — proposed Supabase (auth, Postgres, storage) |
| 4 | Instagram bridge | Show @great_hikes feed; consent-based import of tagged posts; "featured" badges and share cards | See Instagram plan below |
| 5 | Reviews, tips & favorites | Ratings, short tips per hike ("bring water at km 12"), comments, bucket list | Moderation + spam protection |
| 6 | Gear (affiliates) | Gear lists per hike & season linking to affiliate partners; a "Gear" section in the identity | Shop phase 1; merch later via Shopify + Printful |
| 7 | Launch readiness | Custom domain, analytics, privacy policy, terms, contributor license, sitemap, OG images, performance audit | — |

## Instagram plan (no Facebook account)

What we know (research doc, sections 5–6):
- Meta's official APIs need a Meta developer app, which needs a Facebook login → not available to
  the owner, and creating a new Facebook account would breach Meta's terms.
- Behold.so (authorize with Instagram only) can display the @great_hikes feed. Confirm with
  Behold that no Facebook account is needed before paying.
- Automatically discovering posts that **tag** @great_hikes requires API endpoints that may not be
  available through these services → **verify before committing to it**.

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
