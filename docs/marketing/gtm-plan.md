# Go-to-market plan (B3 draft v1, 2026-10-08)

Built on `docs/business/strategy.md` (positioning, audiences, OKRs), the competitor research
(B2, `docs/discovery/05-competitors.md` + v2) and the owner's capacity: **~2 h/day (~14 h/week),
small budget, scale on evidence**.

## 1. Timing — launch into "trip-planning season"
US hikers plan summer trips (national parks, Patagonia's southern summer, the Alps) from
**January to March**; permits and lotteries open then (Half Dome lottery: March, TMB refuges:
mid-October, Milford Track: May). So:

| Phase | Dates (proposal) | Goal |
|---|---|---|
| **Pre-launch** | now → mid-Dec 2026 | Fix the basics, build content depth, warm up Instagram |
| **Soft launch** | mid-Dec 2026 | Live with domain; tell friends, featured photographers; fix what breaks |
| **Launch** | **mid-Jan 2027** | Launch video, Instagram campaign, ads test, press/communities |
| **Growth** | Feb → Jun 2027 | Weekly content rhythm, SEO compounding, partnerships |

## 2. Pre-launch checklist (launch gate)
- [ ] Domain bought and connected (+ Supabase/Google/Search Console updated) — B1/B6
- [ ] Vercel Pro (commercial use) once affiliate links earn — model.md
- [ ] Resend email (confirmations/resets reliable) — step 4
- [ ] Legal notice page (LSSI), terms/privacy reviewed — B6
- [ ] Content minimum: **60 hikes, 25 guides, 60 trails**, every hike with gallery and facts
- [ ] Google Search Console + sitemap submitted; schema.org data on hikes/guides (B4)
- [ ] AvantLink applications (after content minimum) — shop shows real products
- [ ] Launch video (script ready) + 6 launch posts/reels prepared
- [ ] Analytics goals defined (KPIs below)

## 3. Channels (in order of return for a solo founder)
| Channel | Why | What we do | Weekly time |
|---|---|---|---|
| **Instagram @great_hikes** | Existing 4k community, credit culture | 3 features/week (credited), 1 reel/week, stories linking to hike pages; "Featured on Great Hikes" share card; reply to tags | 4 h |
| **SEO (journal + hike pages)** | Compounds; competitors are blogs & AllTrails | 1 guide/week answering a planning question (permits, best time, itinerary); internal links hike ↔ guide ↔ trail; freshness (dated facts) | 4 h (approving agent drafts) |
| **Pinterest** | Trip planners save ideas; long-lived pins | Vertical pins per hike/guide (auto-generated from our photos + titles) | 1 h |
| **Newsletter** | Owned audience, not dependent on Meta/Google | Monthly "Where to hike this month" + new guides | 1 h |
| **Communities** (Reddit r/hiking, r/backpacking, FB groups via partner) | Trust, early users | Answer real questions; link only when it truly helps (no spam) | 1 h |
| **Partnerships** | Reach + credibility | Featured photographers, small tour operators, tourism boards (later) | 1 h |
| **Community loop** | Growth engine | Tag → feature → credited page → share card → more tags; approve shared photos weekly | 2 h |

## 4. The community loop (our edge — B2)
1. Hiker tags @great_hikes / #great_hikes or uses **Share your hike**.
2. We feature the photo (consent by DM, credit always) and add it to the hike page.
3. The hiker gets a **"Featured on Great Hikes" card** (image with their photo, credit, link) to
   share in stories → their followers discover us.
4. New visitors sign up to save hikes and share their own.
*To build:* share card generator (Next.js OG image) — add to spec 010/010b.

## 5. Launch campaign (mid-Jan 2027)
- **Week −2:** teaser reels ("The trail went quiet for 6 years…"), DM 30 featured photographers
  with their credited page link.
- **Launch day:** video (no first person, `launch-video-script.md`), carousel "5 hikes to plan for
  2027", link in bio → landing; stories with the map and the gallery.
- **Week +1:** "Plan your 2027 permits" guide series (Half Dome, Inca Trail, Milford, TMB);
  community challenge "#great_hikes 2027 — share the hike you're planning".
- **Ads test** runs weeks +1 to +3 (`ads-test-plan.md`).
- **PR/communities:** share the story (Instagram collective → credited community guide) on
  r/hiking (rules permitting), Hacker News "Show HN" (tech angle), 2–3 outdoor newsletters.

## 6. Weekly routine (~14 h)
| Day | Task (≈2 h) |
|---|---|
| Mon | Approve agent drafts (guides, hike facts) and publish |
| Tue | Instagram: 2 features + stories; reply to tags/DMs |
| Wed | Moderation (/moderation, reviews), community replies |
| Thu | Instagram: 1 feature + reel; Pinterest pins |
| Fri | Partnerships / outreach; newsletter (monthly) |
| Sat | New hikes/trails (approve agent research), photos |
| Sun | Look at the numbers (KPIs), learning log, plan next week |

## 7. KPIs (weekly review; targets = year-one OKRs)
| Area | Metric | Source |
|---|---|---|
| Reach | Visitors/week, % from Google / Instagram / Pinterest | Vercel Analytics |
| Engagement | Pages/visit, hike→trail→guide clicks, time on page | Vercel Analytics |
| Community | Members, favorites, reviews/tips, shared photos approved | Supabase |
| Instagram | Followers, tags/week, reach of features, link clicks | Instagram insights |
| Money | Shop/partner click-outs per 1,000 visits, commissions | `/go` logs (spec 006/007), AvantLink |
| Cost | Ads cost per engaged visitor / follower / member | Ads managers |

## 8. Product work this plan needs
- Share card ("Featured on Great Hikes") — spec 010.
- Newsletter sign-up + monthly send — new small spec (Resend audiences).
- Pinterest-ready vertical images + schema.org/SEO pass — B4.
- `/go` click logging (spec 006/007) to measure money per page.
- Content scale-up to the launch minimum — agents + owner approval (B5 workflow).
