---
name: add-hike
description: Add or update a hike in Great Hikes with complete, verified data, licensed imagery and credits — including turning new @great_hikes Instagram features into draft hikes. Use when the user asks to add a hike, fill in missing hike details, or process Instagram features.
---

# Add or update a hike

Data lives in `content/hikes.json`, validated by `HikeSchema` in `src/lib/schema.ts` (the build
fails on invalid data). Check for an existing record (slug/title, or a `location` within ~25 km)
before adding.

## From an Instagram feature (the usual path)

1. Run `npm run hikes:sync-instagram`. It links new @great_hikes posts to nearby existing hikes and
   writes the rest to `content/hike-candidates.json` (post, `@photographer`, place, geocode).
   Posts without an @photographer are never used (owner rule).
2. For each candidate, research the place (step "Facts" below) and add a hike with
   `"status": "draft"`, `"instagram": ["<postId>"]`, and the post image as the photo:
   `photo.src` = the Behold image URL, `author` = `@handle`, `sourceUrl` = the post permalink,
   `license` = "Featured on @great_hikes with the photographer's permission".
3. Remove the candidate from `hike-candidates.json`.
4. Drafts appear in previews with a "Draft — awaiting approval" badge and are hidden in
   production. The owner approves → set `"status": "published"`.

## Facts (every hike)

From official sources (park authority, tourism board, government site) — record each in `sources`:
- `location` {lat, lng} of the trailhead or main viewpoint (verify on OpenStreetMap).
- `details` for the signature route: `route`, `distanceKm`, `elevationGainM`, `maxAltitudeM`
  (null if unknown — never guess), `duration`, `difficulty` (easy | moderate | challenging |
  strenuous), `routeType`, `bestMonths` (1–12, mind the hemisphere), `permit` (null = none),
  `gettingThere`, 2–3 practical `tips`.
- `checkedAt` = today. `officialUrl` when one exists.
- Copy: `description` (1–2 sentences) and `hikingExplained` (1–3 plain-text paragraphs).

## Imagery

Community photos need recorded permission (see `ugc-curation`) and always credit the creator.
Otherwise Unsplash/Pexels/Wikimedia with a compatible license. No AI or automated photo editing.

## Validate and report

`npm run typecheck && npm test && npm run build`. Tell the owner what was added, the sources, and
anything you could not verify.
