# 05 · Domain & Competitor Analysis

Status: draft · 2026-10-07 · Builds on `02-domain-discovery.md` (competitive landscape) and
`docs/research/apis-and-integrations.md`. Facts were checked by web search on 2026-10-07; anything
marked **(unverified)** needs a second source before it is quoted publicly.

## TL;DR

- The trail-app market is owned by a few giants (AllTrails ~100M members, Komoot ~45M,
  Wikiloc ~16–20M, Outdooractive ~16.7M registered). They compete on **trail databases and
  navigation**, sold through subscriptions. We should not.
- Content sites (Earth Trekkers, Bearfoot Theory, Hiking Guy) win on **trusted, deep guides to
  famous hikes**, monetized by display ads + affiliates. That is our revenue model too, so they are
  our closest real competitors for search traffic.
- Nobody combines **credited community photography + practical facts for famous hikes worldwide +
  an Instagram-native loop**. That is the gap.
- Only **Outdooractive** offers a real (paid, licensed) content API. Komoot is partner-contract
  only; AllTrails has no public API but offers iframe embeds. OSM remains our open data base.

## 1. Competitor profiles

### Outdooractive (owner-named)

| | |
|--|--|
| What | German outdoor platform (web + app) for hiking, biking, ski touring; also the B2B content system behind many Alpine tourism boards. Absorbed ViewRanger (UK) and MountNpass (FR) ([Outdooractive blog](https://corporate.outdooractive.com/oa-blog-en/the-family-keeps-growing-outdooractive-acquires-viewranger)). |
| Audience | Mostly DACH/Alps/Europe; tourism destinations as B2B clients. 16.7M registered users per its corporate site ([corporate.outdooractive.com](https://corporate.outdooractive.com/press/about)); "1M+ tours in 180 countries" ([Awin merchant profile](https://ui.awin.com/merchant-profile/17149)). |
| Features | Route planner, offline maps, navigation, tours/POIs, conditions, community tour uploads, embeddable maps (FlexView). |
| Model | Freemium: Pro €29.90/yr, Pro+ €59.90/yr ([gpsradler.de](https://gpsradler.de/news/outdooractive-pro-neues-geschaeftsmodell/)); B2B software/licensing to tourism regions; affiliate program via Awin. |
| Content source | Mix: **official** (tourism boards, clubs, parks write into the platform), editorial, and UGC. Strong source/author attribution per item. |
| Data/API | **Yes, but licensed.** Data API + FlexView (embeddable map/list widget) + Map/PDF APIs ([developers.outdooractive.com](https://developers.outdooractive.com/API-Reference/Data-API.html)). You must **purchase an API license** and accept API terms; test keys exist for evaluation ([Guidelines](https://developers.outdooractive.com/Overview/Guidelines.html)). Strict attribution: source, author, photographer and license on every detail page; third-party content must be `noindex`. Also runs an open-data tourism portal, opentourism.net ([Outdooractive blog](https://corporate.outdooractive.com/oa-blog-en/?p=9404)). Pricing not public. |
| Strengths | Official, authoritative data in Europe; trusted by destinations; very rigorous attribution model. |
| Weaknesses | Dense, utilitarian UI; weak outside Europe; photos are illustrative, not the point. |
| Learn / copy / avoid | **Copy** the attribution rules (source + author + license on every page). **Learn** that official sources = trust. **Avoid** relying on licensed content for SEO: the `noindex` rule means API content would not earn us search traffic. A realistic use is a FlexView embed or official-data link for European relaunches (spec 012). |

### AllTrails

| | |
|--|--|
| What | The dominant US trail app and website. |
| Audience | Mass market, US-first, global. **100M+ members** as of 25 Aug 2026; 500k routes, ~72M reviews, 117M photos ([AllTrails press](https://www.alltrails.com/press/alltrails-community-reaches-100-million-members), [OIA](https://outdoorindustry.org/press-release/alltrails-community-reaches-100-million-members/)). |
| Features | Trail search/filters, reviews, photos, offline maps, navigation, AI "custom routes", condition forecasts, heatmaps (Peak tier) ([TechCrunch](https://techcrunch.com/2025/05/12/alltrails-debuts-a-80-year-membership-that-includes-ai-powered-smart-routes)). Bookable experiences tie-in with Travel + Leisure GO ([Business Wire](https://businesswire.com/news/home/20240402856267/en/5623107/Travel-Leisure-GO-and-AllTrails-Team-Up-on-Bookable-Outdoor-Experiences-in-Honor-of-National-Parks-Week)). |
| Model | Freemium: AllTrails+ ~$35.99/yr, Peak ~$79.99/yr ([We Are Explorers](https://weareexplorers.co/is-alltrails-peak-worth-it/)). |
| Content source | UGC (reviews, photos, recordings) on top of a staff-curated trail base. |
| Data/API | **No public API.** Scrapers have been shut down at AllTrails' request ([Apify listing note](https://apify.com/crawlerbros/alltrails-scraper)). **Official iframe embed** via Share → Embed ([TouchStay help](https://help.touchstay.com/en/articles/13715393-how-to-embed-alltrails-in-your-guide)). |
| Strengths | Brand = "the hiking app"; massive review volume; owns US search for "[trail] hike". |
| Weaknesses | Photos are user snapshots, uncredited and uncurated; feels like a database; many features paywalled; facts sometimes out of date. |
| Learn / copy / avoid | **Copy** the review structure (rating, date hiked, conditions) for spec 009. **Avoid** competing on trail count or navigation. **Use** "Open in AllTrails" outbound links or embeds rather than rebuilding navigation. |

### Komoot

| | |
|--|--|
| What | German route planner/navigator, strong in cycling and hiking. Acquired by Bending Spoons in March 2025; ~85% of staff laid off ([BikeRadar](https://www.bikeradar.com/news/komoot-redesign-2025)). ~45M users ([pedelec-elektro-fahrrad.de](https://pedelec-elektro-fahrrad.de/news/bending-spoons-uebernimmt-outdoor-plattform-komoot/645203)). |
| Features | Planning, navigation, "Highlights" (community-recommended spots with photos), Collections (editorial/brand guides). 2025 redesign put more weight on photo content ([BikeRadar](https://www.bikeradar.com/news/komoot-redesign-2025)). |
| Model | Shift from one-time map purchases to subscription: Premium ~$4.99/mo or $59.99/yr; new users need Premium to send routes to devices ([BikeRadar](https://www.bikeradar.com/news/new-komoot-users-send-to-devices)). Brand partnerships via Collections **(unverified current status)**. |
| Content source | UGC (tours, Highlights, photos) plus partner Collections. |
| Data/API | **Partner contract only** (OAuth, "profile" and "tour-upload" scopes; partners like Garmin, Wahoo) ([Komoot API docs](https://static.komoot.de/doc/external-api/v007/index.html)). Embeddable tour iframes exist ([TouchStay help](https://help.touchstay.com/en/articles/13715509-how-to-embed-a-komoot-trail-in-your-guide)). |
| Strengths | Beautiful route planning; Highlights = crowd-curated photo spots; strong in Europe. |
| Weaknesses | Post-acquisition paywalling and community trust erosion; little trip-planning context (permits, season, getting there). |
| Learn / copy / avoid | **Copy** "Highlights" (photo spot + tip) as a model for featured photos on trail pages. **Watch**: its photo-first redesign moves toward our turf. **Avoid** paywalling basics. |

### Wikiloc

| | |
|--|--|
| What | Spanish (Girona) GPS-track sharing platform, founded 2006; Miura Partners took a 40% stake in 2023 ([Product for Everyone](https://productforeveryone.substack.com/p/product-analysis-wikiloc)). |
| Audience | Huge in Spain/Latin America; ~16M users and tens of millions of tracks (Jan 2025) per the same source; "20M+ members" in later company messaging **(unverified)**. |
| Features | Upload/download GPS tracks, navigation, photos, waypoints, story-format share images for Instagram ([App Store](https://apps.apple.com/app/432102730)). |
| Model | Freemium; Premium raised to €19.99/yr in 2024 (same source). |
| Content source | Almost entirely UGC tracks; quality varies widely. |
| Data/API | No public API **(unverified, none found)**. Track embed widget for websites is widely reported **(unverified: official docs not reachable, 403)**. |
| Strengths | Unmatched coverage in Spain/Brazil — two of our relaunch markets. Cheap. |
| Weaknesses | Duplicate, messy tracks; little editorial; weak design. |
| Learn / copy / avoid | **Learn**: for Spain and Brazil (spec 012), Wikiloc is the default; link out or embed rather than compete. **Copy** the Instagram-Story share image (map + elevation) for our "Featured on Great Hikes" card. |

### Gaia GPS

Backcountry navigation app owned by Outside Inc. (acquired 2021). Premium $59.90/yr; bundled with
Outside+ $89.90/yr per App Store listing ([App Store](https://apps.apple.com/us/app/1201979492)).
Audience: serious backpackers, overlanders, hunters. Content: map layers (public land, USFS, satellite)
plus Outside editorial. No public API **(unverified)**. **Lesson:** bundling app + media
subscription (Outside+) is how a publisher monetizes; not our model. Not a direct competitor.

### FATMAP — shut down

Acquired by Strava (2023); **closed on 1 October 2024**, with 3D maps and Flyover folded into Strava
premium ([TechCrunch](https://techcrunch.com/2024/06/26/strava-to-shutter-3d-mapping-platform-fatmap-18-months-after-acquisition)).
**Lesson:** beautiful niche outdoor products get absorbed or closed when they can't stand alone.
Our moat must be community and content, not a map feature.

### Hiking Project (Adventure Projects)

Community trail guide in the Mountain Project family. REI bought Adventure Projects in 2015, then
**onX acquired it on 30 Dec 2020** ([onX blog](https://www.onxmaps.com/blog/onx-acquires-adventure-projects-inc)).
Content is volunteer-written, guidebook style. Its public API has been closed for years
**(unverified for Hiking Project specifically; Mountain Project API is dead per our research doc)**.
**Lesson:** a contributor model with "admins" and guidebook-quality text works, but traffic
stagnates without a consumer brand. Trailforks (MTB) is out of scope.

### Content sites: Earth Trekkers, Bearfoot Theory, HikingGuy

| Site | What | Model | Lesson |
|------|------|-------|--------|
| [Earth Trekkers](https://www.earthtrekkers.com/disclosure/) | Family travel blog; very detailed hike guides (national parks, Alps, Patagonia) | Affiliates: Amazon, Booking.com, GetYourGuide + display ads | Exactly our target queries ("how to hike X"). Their depth (maps, day-by-day, photos) is the bar to meet. |
| [Bearfoot Theory](https://bearfoottheory.com/about/disclosures/) | US outdoor adventure blog, ~2.2M US readers/yr, 3.5M pageviews/yr | Raptive display ads, affiliates, sponsored content, newsletter ([services](https://bearfoottheory.com/about/services/)) | Newsletter + sponsorships matter as much as affiliates. Confirms our ads + affiliates mix (specs 006, 007). |
| [HikingGuy](https://hikingguy.com) (Cris Hazzard) | Turn-by-turn hike guides + YouTube videos, SW US focus | Ads, affiliates; states he takes no sponsored gear | Trust comes from one credible voice and "no sponsored picks". |

Shared strengths: SEO authority, first-hand depth, trust. Shared weaknesses: single author (slow
coverage), ad-heavy pages, photos not from the community. **Our angle:** many credited
photographers + structured facts across the world's famous hikes.

### Instagram hiking collectives

Verified examples of the "tag us to be featured" model: NPS's @naturenps featuring **#HikeNPS**
([nps.gov](https://www.nps.gov/subjects/trails/hikenps.htm)); @dogsthathike ([Sierra Club](https://sierraclub.org/sierra/green-life/mans-best-hiking-buddy));
Travel Alberta's "Instahikes" account ([Johnny Jet](https://johnnyjet.com/instahikes-from-travel-alberta-reinvents-hiking-in-alberta/)).
Specific large feature accounts (e.g. "@hikingtheworld"-style) could not be verified by search;
**(unverified)**, so check on Instagram before naming them.

Pattern: huge reach, credit in the caption only, no trail facts, no permanent page, no website
monetization. **That is the gap Great Hikes fills:** a permanent, credited, shareable page per
feature.

### Destination guides: Lonely Planet

Owned by Red Ventures since 2020 (also owns The Points Guy) ([Publishers Weekly](https://www.publishersweekly.com/pw/by-topic/industrynews/publisher-news/article/85029-lonely-planet-acquired-by-red-ventures.html)).
Publishes trekking books (e.g. *Epic Hikes of the World*) and web articles. Strong brand and
editorial, but static, no community and no live facts. **Lesson:** a "world's great hikes" list is a
proven editorial format, and our 32 places are exactly that list, made living and community-fed.

## 2. Feature comparison

| Feature | Great Hikes | AllTrails | Komoot | Wikiloc | Outdooractive | Blogs (Earth Trekkers etc.) | IG collectives |
|---------|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Curated famous hikes worldwide | ✅ (32, growing) | ➖ all trails | ➖ | ➖ | ➖ Europe-heavy | ✅ | ➖ |
| Credited community photography | ✅ core | ❌ | ➖ Highlights | ❌ | ➖ attribution, not curation | ❌ | ✅ caption only |
| Trip facts (permits, season, transport) | ✅ | ➖ | ❌ | ❌ | ➖ via official sources | ✅ | ❌ |
| Trail line + elevation | ✅ pilot (008b) | ✅ | ✅ | ✅ | ✅ | ➖ static images | ❌ |
| GPS navigation / offline | ❌ by design | ✅ paid | ✅ paid | ✅ paid | ✅ paid | ❌ | ❌ |
| Reviews / tips | Planned (009) | ✅ massive | ✅ | ✅ comments | ✅ | Comments | Comments |
| Community submissions | Planned (010) | ✅ | ✅ | ✅ | ✅ | ❌ | Tag/hashtag |
| AI trip finder | Planned (013) | ✅ AI routes (Peak) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Map explore | Planned (014) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Gear affiliate | ✅ (shop) | ➖ | ➖ | ❌ | ✅ (Awin) | ✅ core | ➖ |
| Public API | — | ❌ (embeds only) | Partner contract | ❌ (embeds unverified) | Paid license | — | — |
| Price to user | Free | $0–80/yr | $0–60/yr | €0–20/yr | €0–60/yr | Free | Free |

## 3. Positioning — where Great Hikes can win

**"The world's great hikes, photographed and credited by the hikers who walked them, with the
facts to go do them."**

1. **Photo-first community curation with credit.** No trail app curates or credits photographers;
   IG collectives credit but give nothing durable. A permanent feature page is our unique asset.
2. **Trip-planning facts for famous hikes.** Apps cover every trail thinly; we cover bucket-list
   hikes deeply (permits, season, transport, multi-day logistics). Blogs do this too, but single
   author and slow.
3. **Instagram-native loop.** Feature → share → follow. Nobody else is built around this.
4. **Not a navigation app.** Hand off to AllTrails/Komoot/Wikiloc/Gaia for GPS. That removes the
   most expensive feature category and lets us partner instead of compete.
5. **International relaunches.** Per-market editions (Spain, Brazil, France…) with local photographers
   and local affiliates. Big apps are global but generic; blogs are rarely multilingual.

## 4. Threats

| Threat | Likelihood | Mitigation |
|--------|-----------|------------|
| AllTrails or Komoot adds curated, credited photo features (Komoot's 2025 redesign already leans photo-first) | Medium | Move fast on the photographer relationship; it's people, not features. |
| Blogs and AllTrails dominate SEO for "[famous hike]" queries | High | Target long-tail and visual queries ("best time to hike X", "X photos"), rich structured data, IG-driven traffic. |
| AI search answers trip questions directly, reducing clicks | High | Own content AI cannot copy: original credited photos, community tips, fresh facts with "last checked". |
| Instagram/Meta dependency (reach, account risk) | Medium | Newsletter + accounts (O-6); on-site submissions (010). |
| Licensed data terms (Outdooractive `noindex`, OSM ODbL) limit SEO value | Medium | Keep OSM + official sources as the indexed base; use licensed content only as embeds. |
| Safety/liability from wrong facts | Low–Med | Source + "last checked" on every fact (02 domain rules). |

## 5. Recommendations (mapped to roadmap)

1. **008b Places & trails — stay OSM-first, add "Open in…" handoffs.** Keep OSM + SRTM as the
   indexed base. On each trail page add outbound buttons to AllTrails / Komoot / Wikiloc /
   Gaia for navigation (plain links; embeds only where they don't slow pages — constitution IV).
   Copy Outdooractive's attribution standard: source, author and license visible on every trail.
2. **009 Reviews & tips — structured, AllTrails-style but trip-focused.** Fields: date hiked,
   conditions, rating, and a typed tip (water, permits, transport, huts). Typed tips are what
   apps lack and what planners need (O-3, O-4).
3. **010 Submissions — "Highlights" model, credit first.** Each submission = photo + spot + one tip,
   with contributor license and profile. Add a Wikiloc-style Story share image (photo + map line +
   elevation) as the "Featured on Great Hikes" card — directly drives the north-star metric.
4. **013 AI trail finder — grounded and honest.** AllTrails already sells AI routes in its $80 tier.
   Our angle: free, conversational, grounded only in our curated places/trails, and always showing
   the photographer credit and source of facts. Never invent trails.
5. **014 Map explore — curated layer, not a trail atlas.** Show our places and featured photos
   on the map (photo pins), not every OSM path. Differentiates from every app in the table.
6. **005 Journal / SEO — beat blogs on breadth + community.** Model guides on Earth Trekkers' depth
   (day-by-day, permits, costs) but illustrate with credited community photos and multiple voices.
   Add a monthly newsletter early (Bearfoot Theory shows its sponsorship value).
7. **012 International — partner, don't rebuild.** For Spain/Brazil, link to Wikiloc; for France/Alps,
   evaluate an Outdooractive FlexView license for official regional content; recruit local
   photographers before launching each market.
8. **006/007 Revenue — copy the blog stack.** Affiliates (gear now; GetYourGuide/Booking-style
   tours later, as Earth Trekkers does), display ads, and sponsored collections. AllTrails' T+L GO
   tie-in shows tours/experiences fit hike pages.

## 6. Partnership opportunities

| Partner | Status (verified 2026-10-07) | Next step |
|---------|-----------------------------|-----------|
| Outdooractive | Paid API license + FlexView embeds; Awin affiliate program for Pro/Pro+ | Ask sales for price of a small FlexView license (Europe pages); join Awin affiliate if it pays. |
| Komoot | API is partner-contract only (`partner@komoot.de`); tour embeds available | Not worth a contract now; use links/embeds. |
| AllTrails | No public API; official iframe embed; affiliate program **(unverified)** | Use outbound links; check whether an AllTrails+ affiliate offer exists. |
| Wikiloc | Embed widget **(unverified)**; no API found | Verify embed terms before spec 012. |
| OpenStreetMap / opentourism.net | Open data (ODbL; CC licenses per item) | Keep as data base; check opentourism.net for Alpine trail data. |
| Park agencies (NPS #HikeNPS etc.) | Public hashtag feature programs | Link official pages; follow their LNT/safety messaging. |
| Bloggers (Earth Trekkers-style) | — | Guest guides / link swaps; they are also potential featured contributors. |
