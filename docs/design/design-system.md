# Design system (B4, v1 2026-10-08)

Source of truth for values: `src/styles/tokens.css`. Identity rules: constitution I (photo/video
backgrounds, frosted glass, pill buttons, logo — evolve, never replace).

## Foundations
| Token group | Values (key ones) | Rules |
|---|---|---|
| **Page** | `--gh-page #000`, `--gh-surface #171717` | Pure black page on landing/first-level pages; fixed photo background on hike & trail pages |
| **Glass** | `--gh-glass rgba(0,0,0,.6)`, `--gh-glass-strong .74`, `--gh-glass-home .6`; blur 3.5/16/24 px; border `rgba(255,255,255,.19)` | Text panels use *strong* over bright photos; never below .6 under body text (readability fix 2026-10-08) |
| **Accent** | `--gh-accent #1f7a43` (5.4:1 with white) | Primary actions, active states, best-month cells |
| **Text** | `--gh-text #f1f1f1`, muted `rgba(241,241,241,.78)` | Body ≥ 16 px; muted only for secondary info |
| **Type** | Exo 2 (headings, 500–600), Mukta (body 300–500) | Never "GREAT HIKES" in all caps; caps only for small labels with tracking |
| **Radius** | pill 999px, panel 30px, card ~20px, sm 12px | Buttons are pills; panels rounded |
| **Spacing** | `--gh-space-1…7` (4→48 px) | Page side padding 16 px phones, 48 px desktop |
| **Photo grade** | `--gh-photo-filter` (light vintage/fade) + edge vignette | Applied in CSS only — the photo files are never edited |
| **Motion** | parallax hero, hover zoom 1.03, smooth scroll | All disabled with `prefers-reduced-motion` |
| **Tap targets** | `--gh-tap` 44 px | Every control ≥ 44 × 44 px |

## Components (inventory)
| Component | Where | Notes |
|---|---|---|
| Menu (floating bar + card) | all pages | Hides on scroll down; phones: shop, favorites, account, menu icons |
| Hero / ListingHeader | landing, first-level pages | Video hero on landing (all screen sizes, off with reduced motion/data saver) |
| BackgroundImage | hike/trail pages | Fixed photo + scrim |
| GlassPanel (light/regular/strong) | everywhere | See glass rules |
| PillButton (dark/accent/outline) | everywhere | Icon + label |
| Rail (bleeding slider) | landing, journal, explore | Bleeds to the right edge |
| PhotoCard / HikeCard / HikeGrid | lists | Credit on every photo |
| HikeGallery + Lightbox | hike pages, journal | 3+peek desktop, 2 tablet, 1 phone; full-screen viewer with credit |
| HikeInfo (facts, season bar, weather, map) | hike pages | Metric + imperial |
| Trail (map line, elevation profile, list) | trail pages | Leaflet + SVG |
| MapExplorer | /map | MapLibre dark style |
| Community (reviews, tips) | hike/trail pages | Owner moderation inline |
| Forms (login, share, contact) | auth/share/contact | Labels always visible; errors in `role=alert` |
| AdBanner, ProductCard, ShopBrowser | shop/landing/hike | Labelled "Sponsored/Partner/Sample" |
| PhotoCredit | everywhere | "Photo by X on Unsplash/Pexels", "Photo: X · CC BY-SA 4.0" |

## Do / don't
- Do: photo first; one primary action per panel; credits visible; dark glass under text.
- Don't: new colours outside tokens; light/white panels; text directly on bright photos without
  shade; all-caps brand name; edited photos.

## Next (B4 backlog)
Visual component sheet (screenshots per component/state), dark-map and share-card templates,
social templates (Instagram carousel, Permit Watch, story card).
