# Spec 008 — Hike pages: trip facts, map, weather, Instagram features

**Outcomes served:** O-3 (hikers find what they need to plan a trip), O-2 (community photos
reach the site).
**Status:** implemented on `008-hike-enrichment`.

## What hikers get on /hikes/<slug>

- Hero chips: distance, time, difficulty, best months, biome.
- **At a glance:** signature route, distance, elevation gain, highest point (metric + imperial),
  time, difficulty, route type.
- **Plan your trip:** 12-month best-season strip, permits & fees, getting there, tips.
- **Weather this week:** 5-day forecast from MET Norway (free, commercial use allowed, CC BY 4.0),
  refreshed hourly.
- **Location:** OpenStreetMap embed with the spot marked + "Open in Google Maps".
- **Featured on @great_hikes:** the Instagram posts of this place, credited and linked.
- **Sources** with the date the facts were checked, and a "confirm before you go" note.

## Instagram feature → hike

`npm run hikes:sync-instagram` (`scripts/sync-instagram-hikes.mjs`) reads the @great_hikes feed:
posts near an existing hike are linked to it; new places become candidates; the `add-hike` skill
researches each candidate into a **draft** hike that uses the featured photo (credited). Drafts
show only in previews until the owner approves (`status: "published"`).

First run (2026-10-07): 4 drafts — Refugio Laguna Negra (@where_is_will), Mount Hood National
Forest (@50shadesofpnw), Zion National Park (@helloalyx), Jumbo Pass (@ryanlegroulx). Two posts
skipped (no place in the caption).

## Not in this spec

- Elevation profile and the trail line on the map need a GPX/OSM route per hike — a data job
  for the `trail-data-engineer` agent (next step).
- Running the sync on a schedule (GitHub Action opening a PR) once Behold's paid plan gives more
  than the latest 6 posts.

## Data notes

Facts for the 32 original hikes were compiled from the official sources listed on each page and
need the owner's spot-check; figures are for the named route, not the whole park.
