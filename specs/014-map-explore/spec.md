# Spec 014 — Find a hike on the map

**Outcomes served:** O-3 (discover hikes), O-1 (a signature, visual way to browse).
**Status:** specified — build later (owner, 2026-10-07).

## The experience

`/map` — a full-screen dark map (our identity: photo-forward, glass panels):
- Every place as a pin; zoomed in, its trails appear as coloured lines (by difficulty).
- Pins cluster when zoomed out (counts per region).
- Glass side panel (bottom sheet on phones) lists what's visible in the map view, synced with
  the map: photo, name, distance, difficulty; hover/tap highlights the pin.
- Filters (same as /search): landscape, continent, difficulty, length, best month ("good in
  March"), and "near me" (browser location, opt-in, never stored).
- Tapping a pin opens a glass preview card (photo, facts, Save, "Open hike").
- URL keeps the state (`/map?bbox=…&difficulty=easy`) so views can be shared.
- Entry points: menu ("Map"), hike pages ("See on the map"), search results ("Map view").

## Tech

- MapLibre GL JS with vector tiles for a styled dark basemap matching the identity (OpenFreeMap
  or MapTiler free tier — check limits), or Leaflet + raster tiles as a lighter first version.
- Data: a generated GeoJSON of places (points) and simplified trail lines (from
  `content/trail-geo`) — static, cached at the edge; < 300 KB for the first ~100 trails.
- Performance: load the map library only on /map; list renders server-side first.
- Accessibility: the list is the accessible equivalent of the map; keyboard navigation of pins;
  reduced-motion disables fly-to animations.

## Depends on

008 (coordinates — done), 008b (trail lines — pilot done). Later: 013 AI finder can open its
results in map view.
