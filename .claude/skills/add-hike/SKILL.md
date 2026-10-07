---
name: add-hike
description: Add or update a hike in Great Hikes with complete, verified data, licensed imagery and credits. Use when the user asks to add a new hike/trail/route or fill in missing hike details.
---

# Add or update a hike

1. **Locate the data store.** Until the Next.js migration lands, hikes live in
   `src/data/hikes.json` (`hikesData` array). After migration, use the location documented in
   `CLAUDE.md`. Check for an existing record (by title/slug) to avoid duplicates.
2. **Gather facts from official sources** (park authority, tourism board, government site):
   region, country, coordinates of the trailhead, distance, elevation gain, typical duration,
   difficulty, best season, permits/fees, official URL. Record every source URL.
3. **Imagery.** Prefer community photos with recorded permission (see `ugc-curation`). Otherwise
   use Unsplash/Pexels/Wikimedia with a compatible license. Store `author`, `authorUrl`,
   `source`, `license` for every image. Optimize: max 2400px wide, modern format.
4. **Write copy.** `description` (1–2 sentences, card/teaser) and `hikingExplained` (1–3
   paragraphs). Plain text — no HTML.
5. **Optional enrichment.** Ask the `trail-data-engineer` agent for trail GeoJSON (OSM) or
   climbing routes (OpenBeta) when relevant.
6. **Validate.** Unique id/slug, all required fields present, image file exists, JSON parses,
   app builds.
7. **Summarize** to the user: what was added, sources, and anything unverified.
