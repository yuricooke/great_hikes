# UX/UI audit (B4, v1 2026-10-08)

Method: production build, phone (Pixel 7) + desktop (1440 px), key journeys; lab metrics (LCP,
CLS, page weight) measured locally with Playwright — field data comes from Vercel Analytics /
Speed Insights later. Severity: **H** fix before launch · **M** soon · **L** nice to have.

## Fixed during the audit (2026-10-08)
| Issue | Fix |
|---|---|
| Shop & Search jumped while loading (CLS 0.28 / 0.31 desktop — "poor") and sent empty lists to Google | Server now renders the full unfiltered list; filters apply after load → CLS 0.000 |
| Hike hero teaser hard to read over bright skies/snow | Stronger text shadow on the teaser |
| Glass panels too transparent over bright photos | Darker, blurrier glass tokens |
| Credit "Jaime Reimer:" with stray colon | Data clean-up |
| Gallery image tap felt slow in dev (592 ms) | Production measured: 64 ms (good) — dev-only |

## Open issues
| # | Sev | Area | Issue | Proposal |
|---|---|---|---|---|
| 1 | **H** | Performance | Hero video ~2 MB; /login ~2 MB page weight on phones | Compress (720p H.264 + WebM/AV1, ≤ 800 KB), poster first, lazy start |
| 2 | **H** | Content | 32 original hike descriptions are generic ("A paradise for outdoor enthusiasts…") | Rewrite with specifics (agents + owner approval) — B5 |
| 3 | **H** | SEO | No schema.org structured data; no Search Console yet | Add `TouristTrip/Place`, `Article`, `BreadcrumbList`, `ImageObject` (credits); submit sitemap |
| 4 | M | IA | "Hikes" mixes places (parks) and hikes; trails only for 2 places | Naming: "Places & hikes"; show trail count on cards; roll out trails (008b) |
| 5 | M | Lists | Hike cards on phones are very tall (1 card ≈ 1 screen) | Shorter card ratio (4:3) or 2-column compact list toggle |
| 6 | M | Share | No "share this hike" (link/Instagram story) on hike pages | Native share button + story card (B3 community loop) |
| 7 | M | Trust | Hike pages don't show *who* wrote/checked the facts | "Checked by Great Hikes on <date>" + sources (exists) moved near the facts |
| 8 | M | Navigation | No "See on the map" from hike pages/search | Link to /map centred on the hike; map view toggle on search |
| 9 | M | Accessibility | Gallery/lightbox and map need a screen-reader pass | Manual NVDA/VoiceOver test (B4 accessibility audit) |
| 10 | L | Engagement | No newsletter sign-up | Footer + end of guides (B3) |
| 11 | L | Shop | Sample products only | Real feeds after affiliate approval (006) |
| 12 | L | Performance | Map pages load MapLibre/Leaflet (~200 KB) | Already lazy; consider static map preview until interaction |

## Lab metrics (local production build, 2026-10-08)
| Page | Phone weight | Desktop weight | CLS |
|---|---|---|---|
| Landing | 731 KB (+ video stream) | 1.15 MB | 0 |
| Hike page | 210 KB | 416 KB | 0 |
| Trail page | 197 KB | 344 KB | 0 |
| Map | 509 KB | 485 KB | 0.048 / 0.007 |
| Journal article | 153 KB | 165 KB | 0 |
| Shop / Search | 477 / 301 KB | 540 / 313 KB | **0 (was 0.28 / 0.31)** |
| Login | **1.99 MB** | **2.27 MB** | 0 |

## Usability test plan (before launch)
5 US hikers (remote, 30 min each). Tasks: find a 1-day hike in Utah for April; decide between two
treks; save a hike; share a photo; find permit info for Half Dome; click to buy a rain jacket.
Measure success, time, confusion points → backlog.

## Performance budget (to enforce in CI)
LCP < 2.5 s (p75, phone), INP < 200 ms, CLS < 0.1; page weight < 500 KB without hero media;
hero video ≤ 1 MB.
