# Great Hikes: APIs and Integrations Research

_Researched 2026-10-07. Prices and limits change often, so check each source before you commit to one._

## 1. Hiking trail / route data

| Source | Coverage and data | Auth / limits | License / commercial use |
|---|---|---|---|
| **OSM via Overpass** (`route=hiking` relations) | Worldwide. Geometry, name, `network` (iwn/nwn/rwn), `sac_scale`, `distance` (sometimes). No elevation. | No key. Public instance: under 10k queries/day and 1 GB/day; continuous apps should use about 1/100 of that. The server is often overloaded. [wiki](https://wiki.openstreetmap.org/wiki/Overpass_API) | ODbL. Credit "© OpenStreetMap contributors". A derived database is share-alike. The wiki says **commercial use should be self-hosted or use a paid Overpass**. [attribution](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines) |
| **Waymarked Trails** | Worldwide OSM hiking routes, with GPX/KML download per route | No documented public API | Site code is GPL v3; data is OSM (ODbL). [wiki](https://wiki.openstreetmap.org/wiki/Waymarked_Trails) |
| **NPS API** | US national parks: parks, things to do, alerts, photos, visitor centers. Few trail geometries. | Free key, 1,000 req/hour rolling. [guides](https://www.nps.gov/subjects/developer/guides.htm) | US federal data, allowed. [dev](https://www.nps.gov/subjects/developer/index.htm) |
| **Recreation.gov RIDB** | US federal recreation areas, facilities, activities, permits | Free key, about 50 req/min. [airbyte](https://docs.airbyte.com/integrations/sources/recreation) | Public data. [docs](https://ridb.recreation.gov/docs) |
| **USFS Trails layer** | US National Forest trail centerlines and attributes (download or ArcGIS REST) | None | CC BY per data.gov. [data.gov](https://catalog.data.gov/dataset/national-forest-system-trails-feature-layer-f51e8) |
| **Parks Canada "Trails APCA"** | Canadian national park trails (GeoJSON/SHP/KML/REST), updated weekly | None | Open Government Licence – Canada, attribution required. [open.canada.ca](https://open.canada.ca/data/en/dataset/64a90e8d-5bc0-4027-8645-b5881b4068d4) |
| **AllTrails** | No public developer API (scraping only, which is not acceptable) | n/a | [ref](https://www.rapidevelopers.com/md/clone/alltrails) |
| **Komoot** | API only for **contracted partners** (Garmin, Suunto…). Unauthorized use is prohibited. | partner@komoot.de | [docs](https://static.komoot.de/doc/external-api/v007/index.html) |
| **Wikiloc** | No public API found. Bulk download and re-hosting are prohibited. | n/a | [wiki](https://en.wikipedia.org/wiki/Wikiloc) |

**Practical approach:** curate the roughly 100 famous hikes by hand. Get the GPX/geometry once from OSM (Overpass or Waymarked Trails export), simplify it, and store it as static GeoJSON in the repo with ODbL attribution. Add elevation profiles from section 4. Use national open datasets (NPS, USFS, Parks Canada) where they are richer.

## 2. Climbing route data

| Source | Status / access | License |
|---|---|---|
| **OpenBeta** | Live GraphQL at `https://api.openbeta.io`, no key needed (verified today: a query for "Yosemite" returned 2,387 climbs). Grades, areas, coordinates, descriptions. [GitHub](https://github.com/OpenBeta/openbeta-graphql) | Data **CC0** (public domain), code AGPL v3. Commercial use is fine. [docs](https://github.com/OpenBeta/docs.openbeta.io/blob/develop/docs/introduction/overview.md) |
| **theCrag** | Key requires a signed legal agreement. Default is non-commercial only; commercial use is typically a **50/50 revenue share**. Caching/storing is not allowed by default. [api](https://www.thecrag.com/en/article/api) | Proprietary |
| **Mountain Project** | Data API deprecated in late 2020; onX declines new requests. [Hiking Project data](https://hikingproject.com/data), [Wikipedia](https://en.wikipedia.org/wiki/Mountain_Project) | n/a |
| **27crags** | No public developer API found | n/a |

**Use OpenBeta.** Cache responses and credit OpenBeta even though CC0 doesn't require it.

## 3. Photo APIs

| API | Limits | Rules |
|---|---|---|
| **Unsplash** | 50 req/h (demo), 1,000 req/h (production) | Must **hotlink** the returned URLs, credit the photographer and Unsplash, and call `/download` on use. Must not replicate Unsplash. [docs](https://unsplash.com/documentation) |
| **Pexels** | 200 req/h, 20k/month (more on request) | Prominent Pexels link, credit photographers. Free commercial use. [docs](https://www.pexels.com/api/documentation/) |
| **Flickr** | API keys are **Pro-only since 2025**; commercial vs non-commercial key | Each photo has its own license, so filter to CC licenses that allow commercial use. [help](https://www.flickrhelp.com/hc/en-us/articles/4404070036884-Flickr-API), [news](https://www.cantoni.org/2025/12/12/downsizing-flickr-library-free-tier/) |
| **Wikimedia Commons** | Free MediaWiki API | License per file (CC BY/BY-SA/PD), so give attribution per file. Downloading and self-hosting is recommended over hotlinking. [reuse](https://www.mediawiki.org/wiki/Wikimedia_APIs/Content_reuse) |
| **Mapillary** | Free access token | Imagery is CC BY-SA 4.0 (commercial use OK with attribution and share-alike). Street-level, not hero photos. [Wikipedia](https://en.wikipedia.org/wiki/Mapillary) |
| **Google Places Photos** | 1,000 free/month, then about $7/1k | `authorAttributions` must be shown. **Photo names cannot be cached**, so each use costs a lookup. [docs](https://developers.google.com/maps/documentation/places/web-service/place-photos), [pricing](https://developers.google.com/maps/billing-and-pricing/pricing) |

**Best fit:** Unsplash or Pexels for hero images. Wikimedia Commons for specific landmarks (self-host with credits). Avoid Google Photos because of cost and no caching.

## 4. Maps, elevation, weather

| Service | Free tier | Paid | Notes |
|---|---|---|---|
| **MapLibre GL JS** | OSS (BSD) | n/a | Renderer. Pair it with a tile provider. |
| **MapTiler Cloud** | 5k sessions + 100k req/month | Flex $30/month (25k sessions) | Outdoor/topo styles plus terrain. The free tier is aimed at non-commercial use. [pricing](https://www.maptiler.com/cloud/pricing/) |
| **Stadia Maps** | 200k credits, **no commercial use** | Starter $20/month (commercial) | [pricing](https://stadiamaps.com/pricing/) |
| **Thunderforest** (Outdoors) | 150k tiles/month "hobby" | Solo $125/month (1.5M) | Attribution cannot be removed. [pricing](https://www.thunderforest.com/pricing/) |
| **OpenTopoMap** | Donation-funded, non-commercial, under about 500k tiles/month | n/a | Don't use for a commercial site. [policy](https://openmaps.fr/tile-usage-policy.html) |
| **Mapbox GL JS** | 50k map loads/month | $5/1k after that | Proprietary SDK. [pricing](https://docs.mapbox.com/accounts/guides/pricing.md) |
| **Open-Meteo** (weather + elevation) | 10k calls/day, **non-commercial** | Standard about $29/month (1M calls) | Data is CC BY 4.0, so attribution is required. [pricing](https://open-meteo.com/en/pricing), [blog](https://openmeteo.substack.com/p/api-subscriptions-for-commercial) |
| **OpenTopoData** (elevation) | 1,000 calls/day, 100 points/call, 1 req/s | Self-host | [site](https://opentopodata.org/) |

Precompute elevation profiles at build time, since hike geometry is static. Fetch weather at runtime through a Vercel function with caching (for example 1 hour per hike).

## 5. Instagram without a Facebook account

- **Basic Display API is gone** (shut down 2024-12-04). Only Business/Creator accounts can be accessed via API. [Zapier](https://help.zapier.com/hc/en-us/articles/32429170578317-Instagram-app-deprecation-on-Dec-4-2024)
- **"Instagram API with Instagram Login"**: the *Instagram account* does **not** need a Facebook Page or Facebook login. It works for Business/Creator accounts and goes through `graph.instagram.com`. [Meta docs](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login)
- **But the developer app itself** must be created in the Meta App Dashboard. Registering as a Meta developer is done "while logged into your Facebook account". [register](https://developers.facebook.com/docs/development/register/), [create app](https://developers.facebook.com/documentation/instagram-platform/create-an-instagram-app). Meta's Terms say that if Meta disabled your account, you agree not to create another one without permission. [terms](https://www.facebook.com/legal/terms) **A new Facebook account for the owner is therefore a ToS violation.**
- **oEmbed** also needs a Meta app with the "Meta oEmbed Read" feature (App Review). Since 2025-11-03 the responses no longer include thumbnails. [features](https://developers.facebook.com/docs/features-reference/oembed-read), [Bluehost](https://www.bluehost.com/blog/meta-oembed-read-explained/)

**Realistic options:**
1. **Behold.so (recommended).** The owner clicks "Connect" and authorizes on **Instagram** (Business/Creator account). Behold's own Meta app does the API work. Its "advanced" sources are the ones that use Facebook, so the basic Instagram-login source should avoid Facebook (Behold's docs don't state this outright; confirm with hello@behold.so before paying). Offers a JSON feed and a React widget. Free plan: 1.2k views/month, 6 posts, daily refresh. Starter: $10/month, 15k views, hourly refresh. [docs](https://behold.so/docs/getting-started), [pricing](https://behold.so/pricing), [React](https://behold.so/docs/react)
2. **Elfsight, SnapWidget, Juicer**: similar idea. Elfsight states it can display a public *personal* account "without login", which implies non-API access. Avoid tools that don't use the official API. [Elfsight](https://elfsight.com/instagram-feed-instashow/)
3. **A collaborator's Meta app**: a trusted developer with their own Facebook account owns the app, and @great_hikes authorizes via Instagram Login (Standard Access is enough for accounts you manage). This is legitimate but means dependence on that person.
4. **Manual curation**: export 12–24 favorite photos with the owner's own rights, host them on the site, and link to @great_hikes. No API and zero ToS risk.

**Never** scrape or use unofficial private APIs.

## 6. Online shop

| Option | Cost | Effort | Notes |
|---|---|---|---|
| **Shopify Starter + Buy Button** | $5/month + **5% transaction fee** | Very low | Product links and buy buttons inside the existing React site. [review](https://www.stylefactoryproductions.com/blog/shopify-starter-plan-review) |
| **Shopify Basic** (+ Storefront API / Hydrogen / Next.js Commerce) | $39/month ($29/month yearly), 2.9% + 30¢; 2% extra if you use a third-party gateway | Medium–high for headless | Best long-term. Printful, Printify and Gelato all have native apps. [pricing](https://www.shopify.com/pricing) |
| **Stripe Checkout + POD API** | Stripe fees only, no monthly fee | Medium: you build order sync, shipping and tax | POD: Printful (no monthly fee, Growth $24.99/month), Printify (Premium $29/month), Gelato (Gelato+ $24/month, local production in 30+ countries). [comparison](https://www.gelato.com/blog/printful-vs-printify) |
| **Medusa / Saleor** | MIT / BSD free, plus hosting (Medusa Cloud from $29/month) | High | Overkill for a solo founder. [Medusa](https://www.buildwithmatija.com/blog/md/medusajs-pricing-cloud-self-host-costs-2026), [Saleor](https://docs.saleor.io/overview/why-saleor/open-source) |
| **Lemon Squeezy** | Merchant-of-record for **digital** goods; being folded into Stripe Managed Payments | Low | Fits digital guides or GPX packs only, not apparel. [ref](https://fungies.io/lemon-squeezy-stripe-acquisition-saas-founders-2026/) |
| **Affiliates** | Free | Low | REI 5%, 15-day cookie (AvantLink/Impact). Backcountry about 4–12%, 30 days (AvantLink). Patagonia via Impact (rates vary by region). Amazon Sports & Outdoors about 3%. [REI](https://affilimate.com/programs/rei-affiliate-program/), [Backcountry](https://affilimate.com/programs/backcountry-affiliate-program/), [Patagonia](https://eu.patagonia.com/se/en/affiliates.html), [Amazon](https://getlasso.co/amazon-affiliate-commission-rate/) |

**Phased plan:**
1. **Launch:** affiliate "gear for this hike" links on each hike page, with an FTC disclosure.
2. **First merch:** Shopify Starter Buy Button + Printful, 3–5 designs. No inventory.
3. **Traction (over about $1–2k/month):** Shopify Basic (cuts the 5% fee), then optionally a headless storefront via the Storefront API.
4. **Later:** digital products (premium GPX packs or guides) through Shopify Digital Downloads or Stripe.

## Recommended stack

- **Trail data:** curated static GeoJSON from OSM (self-run Overpass queries at build time) plus NPS/USFS/Parks Canada. Credit ODbL.
- **Climbing:** OpenBeta GraphQL (CC0), cached.
- **Photos:** Unsplash/Pexels (hotlinked, credited) plus Wikimedia Commons (self-hosted, credited).
- **Maps:** MapLibre GL JS + MapTiler (Flex once commercial) or Stadia Starter; OSM attribution visible.
- **Elevation/weather:** profiles precomputed via OpenTopoData/Open-Meteo. Open-Meteo Standard (about $29/month) once commercial, with a cached Vercel function.
- **Instagram:** Behold.so via Instagram Login (no Facebook account), or manual curation as fallback. No scraping.
- **Shop:** affiliates → Shopify Starter Buy Button + Printful → Shopify Basic.
