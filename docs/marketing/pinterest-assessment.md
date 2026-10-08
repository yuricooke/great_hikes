# Pinterest assessment — is it worth it for Great Hikes?

**Status:** draft v1 (2026-10-08). Answers the owner's question: *"Is Pinterest necessary? Does it
have a large number of hikers?"* Context: `ads-test-plan.md` reserves **US$40 for Pinterest Ads**;
`gtm-plan.md` gives Pinterest **1 h/week** organic. Facts marked **(unverified)** or
**(anecdotal)** are secondary or self-reported.

## Short answer
- **Necessary? No.** Google (SEO) and Instagram matter more for us.
- **Big enough? Yes.** ~106M monthly users in the US & Canada, and travel/outdoor planning is a
  core use — with a planning peak in Dec–Jan, right on our launch.
- **But:** Pinterest sends fewer outbound clicks to sites than it used to, and US$40 of ads is too
  little to learn anything reliable.
- **Recommendation:** **keep Pinterest organic (light, automated), postpone Pinterest Ads, and
  move the US$40 to a Reddit Ads test** (fallback: add it to the Instagram reserve). See §7.

---

## 1. Audience size and who is on it
| Fact | Number | Source |
|---|---|---|
| Global monthly active users (Q2 2026) | **640M** (+11% y/y) | [Pinterest Q2 2026 results (SEC 8-K)](https://www.sec.gov/Archives/edgar/data/0001506293/000150629326000102/q2-26xpressrelease.htm) |
| US & Canada MAU (Q2 2026) | **106M** (+4% y/y) | same |
| Europe MAU (Q2 2026) | 157M | same |
| US adults who use Pinterest (2025) | **37%** (Instagram 50%, Reddit 25%) | [Pew Research, social media fact sheet, Nov 2025](https://www.pewresearch.org/internet/fact-sheet/social-media/) |
| Gender | **~70% women** (global audience) | [Statista](https://www.statista.com/statistics/248168/gender-distribution-of-us-pinterest-users), [Hootsuite](https://blog.hootsuite.com/pinterest-statistics/) **(secondary)** |
| Age | Gen Z is the largest, fastest-growing cohort — **"more than half" of users** per Pinterest's 2026 earnings commentary | [Quartr Q2 2026 summary](https://quartr.com/events/pinterest-inc-pins-q2-2026_o0uP7eSe) **(secondary)** |
| US reach by age | ~46% of 18–24, ~40% of 25–34, ~39% of 35–44 | [Hootsuite](https://blog.hootsuite.com/pinterest-statistics-for-business/) **(unverified, ad-tool data)** |

**Reading:** big US reach, strongly **female and young**. Our primary audience (US trip planners
25–45) is well covered, but the platform under-indexes on men. Check our own Instagram Insights
gender split — if our followers are mostly men, Pinterest fits less.

## 2. Is there hiking / outdoor demand?
- **Pinterest Summer 2024 Travel Report:** searches for *hiking trails* **+94%**, *national park*
  **+250%**, *adventure camping* +44%, *mountaineering* +40%; "8 in 10 weekly Pinners" use it to
  plan summer travel ([Pinterest newsroom](https://newsroom.pinterest.com/en-gb/news/the-pinterest-summer-2024-travel-report/),
  summarised by [RV PRO](https://rv-pro.com/news/pinterest-travel-report-spotlights-outdoor-wellness-travel-trends/)).
- **Pinterest Predicts 2026:** "Darecations" (adventure travel; *adventure tourism* +75%, *river
  rafting* +35%) and "Mystic Outlands" (*scotland highlands aesthetic* +465%, *faroe islands
  aesthetic* +95%) — moody, nature-first destinations that match our photo style
  ([NBC News](https://www.nbcnews.com/select/shopping/pinterest-predicts-2026-trend-report-rcna248706),
  [PPC Land](https://ppc.land/pinterest-unveils-21-consumer-trends-for-2026-advertising-campaigns/)).
  Pinterest claims 88% accuracy for past Predicts (self-reported).
- **Timing:** travel searches jumped **~300% between 10 Dec 2025 and 8 Jan 2026** (Pinterest data
  via [fvw, Feb 2026](https://www.fvw.de/international/travel-news/top-source-for-travel-inspiration-pinterest-reveals-where-young-travelers-are-heading-258588)) —
  the same window as our soft launch → launch.
- **Gap:** Pinterest publishes growth percentages, not absolute hiking search volumes. Check real
  volumes for our keywords in **Pinterest Trends** (trends.pinterest.com, free) before investing.

**Verdict:** yes, there are many hikers and trip planners on Pinterest — mostly in an *inspiration*
mindset ("Scotland aesthetic", "national park itinerary"), less in a *booking* mindset ("Half Dome
permit lottery dates"), which is where Google and Reddit are stronger.

## 3. How Pinterest traffic behaves for travel/outdoor sites
- **Historically strong:** travel and outdoor bloggers listed Pinterest as a top traffic source;
  some small blogs report most of their traffic from it ([Believe in a Budget](https://believeinabudget.com/get-first-100k-pageviews-using-pinterest/)) **(anecdotal)**.
- **Since late 2024–2025, organic clicks fell for many publishers:** reports of 30–90% drops in
  impressions/outbound clicks on Pinterest's own business forum, attributed to Pinterest keeping
  users on-platform (shopping, in-app content) ([community.pinterest.biz — traffic drop](https://community.pinterest.biz/t/pinterest-traffic-drop/33587),
  [80% drop thread](https://community.pinterest.biz/t/sudden-80-drop-in-impressions-and-outbound-clicks-anyone-seeing-something-similar/49623)) **(anecdotal)**.
- **Meanwhile paid clicks grow:** Pinterest reported ~40% y/y growth in outbound clicks *to
  advertisers* (Q3 2025, via [Quartr](https://quartr.com/events/pinterest-inc-pins-q2-2026_o0uP7eSe)) **(secondary)**.
  The platform is steering site traffic towards ads.
- **Behaviour:** pins live for months (long tail, unlike an Instagram post's 48 h), but visitors are
  early-stage planners — expect lower pages/visit and fewer click-outs than Google visitors.
  Measure in Vercel Analytics before scaling.

## 4. Effort
| Option | Effort | Notes |
|---|---|---|
| Organic, automated | **~1 h/week** | Business account + claim the site; vertical 2:3 pins generated from each hike/guide (title, photo, credit); 5–10 pins/week; boards per region/permit topic; keywords in titles. Product work is already in gtm-plan §8 (Pinterest-ready images). |
| Organic, manual | 3–5 h/week | Custom designs, Idea pins — not worth it at our capacity. |
| Ads | +1 h/week while running | Campaign setup, conversion tag, checks. |

**Consent:** every community photo we pin needs the photographer's **Pinterest** permission (it is
a separate use) — the DM in `instagram-warmup.md` asks for it explicitly.

## 5. Ads costs and what US$40 buys
| Platform | Typical CPC | Typical CPM | Source |
|---|---|---|---|
| Pinterest | US$0.10–1.50 | US$2–10; travel ~US$4–8 | [Trackbee 2026](https://trackbee.io/blog/pinterest-ads-cost), [Hubfluence 2026](https://www.hubfluence.io/resources/pinterest-cpm-rates) **(third-party benchmarks)** |
| Reddit | US$0.10–0.80 consumer | ~US$3.50–15 (median ~US$6.50) | [Stackmatix 2026](https://stackmatix.com/blog/reddit-ads-cost-guide-2026), [Adwave](https://adwave.com/resources/reddit-ad-costs-targeting-smb) **(third-party)**; min. ~US$5/day |
| Instagram (Meta) | — | Pinterest CPMs ~26–50% lower than Meta (claimed) | [Hubfluence](https://www.hubfluence.io/resources/pinterest-cpm-rates) **(third-party)** |

US$40 on Pinterest ≈ **5–10k impressions and ~30–80 clicks** — below the ads-test-plan rule of
"≥ 1,000 impressions per ad, ≥ 4 days" across 3 pins only barely, and too few clicks to judge cost
per engaged visitor or per member. Pinterest's ads also need time to learn and its users convert
slowly (long consideration window), so a 3-week test underrates it.

## 6. Pinterest vs alternatives for our audience
| | Pinterest | Reddit | Google (SEO / Ads) |
|---|---|---|---|
| US reach | 37% of adults | 25% of adults; men 29% vs women 23%; 48% of 18–29 ([Pew](https://www.pewresearch.org/internet/fact-sheet/social-media/)) | Everyone |
| Hiking presence | Inspiration boards, national parks, "aesthetic" travel | r/hiking ~2.6M, r/backpacking ~5.5M members ([GummySearch](https://gummysearch.com/r/hiking/)) **(third-party)**; r/NationalPark, r/WildernessBackpacking, state hiking subs | Planning queries we target ("Half Dome permits 2027") |
| Intent | Early inspiration | Specific questions, gear, permits, trip reports | Highest (active planning) |
| Fit with our wedge (dated permits, comparisons) | Medium | **High** — exactly what people ask there | **High** — main channel |
| Organic effort | 1 h/week, automatable | 1 h/week, manual, strict self-promo rules (r/backpacking: participate non-commercially more often than you promote — read each sub's rules) | Already 4 h/week (guides) |
| Ads at our budget | Cheap CPM, slow to learn | Cheap CPC, interest/community targeting, but comments can be harsh | Paid search CPCs for travel are usually higher **(unverified)**; SEO is free |
| Side benefit | Long-lived pins | Reddit threads rank in Google and feed AI answers **(widely reported, unverified)** | Compounds |

## 7. Recommendation
1. **Keep Pinterest organic — light.** Set up a Business account in **November** (pins take weeks to
   be distributed, so start before the Dec–Jan planning peak), auto-generate vertical pins for every
   hike/guide, 5–10/week, ~1 h/week. Review in March: if Pinterest brings ≥ 5% of visits with
   pages/visit near the site average, keep investing; if < 2%, drop to maintenance.
2. **Postpone Pinterest Ads** to Phase 1 (after March), when organic pins show which topics get
   saves and clicks — then promote proven pins with a real budget (≥ US$150).
3. **Replace the US$40 with a Reddit Ads test** (US, interests/communities: hiking, backpacking,
   national parks, camping): promote 1–2 genuinely useful guides — "Half Dome permits 2027" and
   "Plan your 2027 permits" — weeks +1 to +3, same metrics as the ads-test-plan (cost per engaged
   visitor < US$0.40, cost per member < US$3), comments monitored daily. Why: higher planning
   intent, our permit/comparison wedge fits Reddit questions, cheap CPC, and the ads plan already
   names Reddit as the alternative. **Fallback:** if the owner can't monitor Reddit comments,
   add the US$40 to the Instagram reserve (one cleaner Meta test beats three thin ones).
4. Keep organic Reddit participation (gtm-plan: 1 h/week answering real questions, no link spam)
   regardless of the ad test.

**Decision needed from the owner:** approve "Pinterest organic only + US$40 to Reddit" (then
`ads-test-plan.md` gets updated), or keep the original split.
