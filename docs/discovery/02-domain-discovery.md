# 02 · Domain Discovery (hiking & outdoor content)

Status: draft · 2026-10-07 · Sources for APIs/licensing: `docs/research/apis-and-integrations.md`

## Domain map

```
Places (parks, peaks, trails) ── Trail facts (distance, elevation, difficulty, season, permits)
        │                                   │
        ├── Media (photos by hikers) ───────┤── Conditions (weather, closures)
        │        └── Credit & consent       │
        └── Experiences (reviews, tips) ────┘── Gear (what to bring)
```

## Key concepts and vocabulary

| Term | Meaning for us |
|------|----------------|
| Hike / trail | A named route with a start, distance, elevation gain; may be a loop, out-and-back, point-to-point, or multi-day circuit (e.g. W Trek, Annapurna Circuit) |
| Destination | A place that contains several hikes (Torres del Paine, Zion). Many Instagram posts name a destination, not a trail → we must support both |
| Difficulty | No global standard (SAC scale in the Alps, YDS class in the US, local ratings). We need our own simple scale with the source noted |
| Season | Hemisphere- and altitude-dependent; best expressed as months |
| Credit | Photographer handle + link; consent recorded before featuring (constitution III) |

## Data reality (what's actually available)

- **Trail geometry:** OpenStreetMap hiking relations (ODbL, credit required); good in Europe/US,
  patchy elsewhere. National datasets (NPS, Parks Canada, USFS) where they exist. AllTrails,
  Komoot and Wikiloc have no usable public API.
- **Elevation:** derivable from geometry + elevation APIs (precompute at build time).
- **Climbing:** OpenBeta (CC0). Mountain Project API is dead.
- **Photos:** our own feed (credited), Unsplash/Pexels (licensed). Instagram strips GPS/EXIF;
  Behold doesn't expose location tags → location comes from caption place names + owner review.
- **Weather:** Open-Meteo (commercial use needs the paid plan).

## Actors and their incentives

| Actor | Wants | Risk to manage |
|-------|-------|----------------|
| Photographers | Credit, reach, link to their profile | Use without consent → trust & legal risk |
| Hike planners | Trustworthy, current facts | Wrong/outdated trail info → safety risk |
| Land managers / parks | Responsible visitation | Promoting fragile or closed areas; geotag overtourism |
| Platforms (Meta) | ToS compliance | Scraping/ToS breaks → account loss |
| Affiliate partners | Qualified traffic | Irrelevant gear pushing hurts trust |

## Domain risks and rules

- **Safety:** trail facts must cite a source and show "last checked"; never present AI-drafted
  facts unverified.
- **Leave No Trace / overtourism:** avoid precise coordinates for sensitive spots; link to
  official info on permits/closures.
- **Licensing:** OSM ODbL attribution, photo licenses, Instagram content only with consent.

## Competitive landscape (positioning, not features)

| Player | Strength | Gap Great Hikes can fill |
|--------|----------|--------------------------|
| AllTrails / Komoot / Wikiloc | Huge trail databases, navigation | Utilitarian, photos secondary, no curation/featuring of photographers |
| Big Instagram curators (nature/travel accounts) | Reach, beautiful imagery | No practical trail info, featuring is ephemeral |
| Travel blogs | Depth on specific hikes | Fragmented, ad-heavy, single author |

Positioning hypothesis: **"Where beautiful hikes meet the facts to do them — told by the hikers
who walked them."**
