# Contract: Public Routes

The site's external interface is its URLs, their metadata and redirects.

| Route | Content | Status | Metadata |
|-------|---------|--------|----------|
| `/` | Home: video/poster background, glass welcome panel, "Let's Hike!" → `/hikes` | 200 | Site title + tagline; OG image = brand image |
| `/hikes` | Hikes browser: background = selected hike, glass info panel, hike list, continent filter | 200 | "Hikes · Great Hikes"; OG = first hike photo |
| `/hikes?continent=<key>` | Same, list filtered (`key` from data-model Continent table); unknown key → empty state with "All hikes" link | 200 | Same as `/hikes` (canonical `/hikes`) |
| `/hikes/<slug>` | Hike page (story, photo + credit, map, related hikes) | 200 | `<title>` = "<Hike title> · Great Hikes"; description = hike `description`; canonical; OG/Twitter image = hike photo |
| `/hikes/<unknown>` | Branded "trail not found" | 404 | noindex |
| any other unknown path | Branded "trail not found" | 404 | noindex |
| `/Hikes` | — | 308 → `/hikes` | — |
| `/Hikes/<id>` (known id) | — | 308 → `/hikes/<slug>` | — |
| `/Hikes/<id>` (unknown id) | Branded "trail not found" | 404 | — |
| `/sitemap.xml` | All public URLs above (no query variants) | 200 | — |
| `/robots.txt` | Allow all; points to sitemap | 200 | — |

## Global UI contract

- Every page renders the menu with labeled links: Home (`/`), Hikes (`/hikes`), Instagram
  (`https://www.instagram.com/great_hikes/`, opens in new tab with `rel="noopener"`).
- Every displayed hike photo renders a credit: "Photo: <author>" linking to `photo.sourceUrl`.
- No control is rendered without an action.
