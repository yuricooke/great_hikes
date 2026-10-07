# Spec 008b — Places & trails

**Outcomes served:** O-3 (plan a trip), O-2 (community photos attach to the exact trail).
**Status:** pilot built on `008b-places-trails` — Yosemite (5 trails) and Annapurna (3 treks).

## Model

- **Place** = today's hike entry (`content/hikes.json`, `/hikes/<place>`): story, season, weather,
  getting there, permits, Instagram features, and a **Trails** list filtered by difficulty. Its
  `details` stay as the "Signature route".
- **Trail** (`content/trails.json`, `/hikes/<place>/<trail>`): official facts, OpenStreetMap line on
  an interactive map (Leaflet + OSM tiles), elevation profile (inline SVG), season, permits,
  getting there, tips, trailhead weather, Instagram features, sources, other trails in the place.

## Data pipeline

`npm run trails:import` (`scripts/import-trails.mjs`):
1. OpenStreetMap hiking-route relation(s) via Overpass (+ optional named connecting ways).
2. Stitch ways into one line; Douglas–Peucker simplify for the web.
3. Elevation from NASA SRTM 30 m via OpenTopoData; length, gain, min/max, profile.
4. Writes `content/trail-geo/<place>--<trail>.json` and the static import map
   `src/lib/trail-geo.generated.ts` (bundled — no runtime file reads).

Official figures (NPS, DOC, park authorities) win; fields left `null` fall back to the map
measurement and are labelled as such. Attribution: © OpenStreetMap contributors (ODbL); SRTM.

## Rolling out

- Agent (`trail-data-engineer` + `add-hike` skill): per place, list OSM hiking relations
  (Overpass bbox query) → pick the top 5–10 → fill official facts → import → owner approves
  (`status: draft` → `published`).
- US parks: the NPS API (free key, `NPS_API_KEY`) lists official "things to do" hikes — owner to
  request a key at https://www.nps.gov/subjects/developer/.
- Move trails to a Supabase `trails` table when they pass a few hundred.

## Not yet

Trail-level Instagram matching in the sync script (posts → nearest trail line), GPX download.
