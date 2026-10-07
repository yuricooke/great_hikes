# Data Model: Platform Rebuild with Preserved Identity

Source of truth: `content/hikes.json` (validated at build time). No database in this feature.

## Hike

| Field | Type | Rules | Notes |
|-------|------|-------|-------|
| `id` | integer | unique, ≥ 1 | Kept from legacy data; used only for legacy redirects |
| `slug` | string | unique, `^[a-z0-9]+(-[a-z0-9]+)*$` | URL segment `/hikes/<slug>`; never changes once published |
| `title` | string | 1–120 chars | |
| `continent` | Continent | one of the enum below | |
| `country` | string | 1–80 chars | |
| `biome` | string | 1–80 chars | |
| `description` | string | 1–300 chars, plain text | Teaser for cards, Hikes panel, meta description |
| `hikingExplained` | string | plain text | Long write-up on the hike page |
| `officialUrl` | string (URL) \| null | valid https URL or null | Legacy `link_to_site` (all empty today → null) |
| `map` | string | path under `/maps/` | Continent map image |
| `photo` | Photo | required | Main image |

Reserved for later features (not added now, but the schema must accept optional extension):
`coordinates`, `distanceKm`, `elevationGainM`, `difficulty`, `season`, `sources[]`,
`media[]` (community photos). Zod schema uses `.strict()` only on known fields so additions are
deliberate.

## Photo

| Field | Type | Rules |
|-------|------|-------|
| `src` | string | path under `/hikes/`, file must exist at build |
| `alt` | string | 1–200 chars, describes the scene (generated from title/country, refined later) |
| `author` | string | photographer name (legacy `imageAuthor`) |
| `sourceUrl` | string (URL) | legacy `authorLink` |
| `license` | string | `"Pexels License"` for current images |

## Continent (enum)

| Value | URL key (`?continent=`) |
|-------|-------------------------|
| Africa | `africa` |
| Asia | `asia` |
| Europe | `europe` |
| North America | `north-america` |
| Oceania | `oceania` |
| South America | `south-america` |

## Derived data

- **Related hikes**: same `continent`, excluding self, first 6 in data order.
- **Legacy redirect map**: `id → slug` for every hike.
- **Sitemap**: `/`, `/hikes`, and `/hikes/<slug>` for every hike.

## Migration from legacy JSON

`imageUrl` → `photo.src` (file moved to `/hikes/<slug>.jpg`), `imageAuthor` → `photo.author`,
`authorLink` → `photo.sourceUrl`, `link_to_site` → `officialUrl` (empty → `null`), wrapper
`{ hikesData: [...] }` → top-level array. Done once by a script; legacy file deleted afterwards.
