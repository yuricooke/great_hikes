# Tasks: Landing & Navigation

- [x] T001 Add `landscapes[]` to hikes and `content/topics.json` (top 10, 5 landscapes, 6 continents, landing order)
- [x] T002 Zod schemas for landscapes/topics; `src/lib/topics.ts` with build-time validation
- [x] T003 Daily featured-hike rotation `src/lib/featured.ts` (+ unit tests: daily change, no repeats, credited photos only)
- [x] T004 [P] `PhotoCard`, `Rail`, `HikeGrid`, `Breadcrumb`, `ListingHeader` components
- [x] T005 [US1] Landing `/`: hero + rails in landing order, ISR hourly
- [x] T006 [US2] Rail controls: snap scrolling, prev/next with disabled ends, keyboard, reduced motion
- [x] T007 [US3] Topic pages `/explore/[topic]` (static params, metadata, empty state)
- [x] T008 [US5] `/hikes` all-hikes grid with topic shortcuts; remove `HikeBrowser`
- [x] T009 [US4] Breadcrumb on hike pages; continent links to topic pages
- [x] T010 `/hikes?continent=` → `/explore/<continent>` redirect in proxy; sitemap includes topics
- [x] T011 Menu: Hikes, Explore, Instagram
- [x] T012 Tests: unit (topics, featured), e2e (landing, rails, topics, all hikes, redirects), axe on new pages
## Scope added 2026-10-07 (owner: "build everything requested, then ask for approval")

- [x] T014 Hero scrolls with the page (no fixed background); pure black page; rails sit directly on the page
- [x] T015 Today's feature card with date (UTC) and Save button
- [x] T016 Landing order: top 10 for you → today's community features (@great_hikes feed, credited) → our content (guides) → shop → explore-by tags → hikers' experiences
- [x] T017 `/search` with continent/landscape/text filters in the URL; explore-by tags link to it
- [x] T018 Journal: `/journal` index and `/journal/<slug>` article (hero, reading column, inline hike link-cards, gallery, quote, related rails) — sample articles flagged and hidden in production
- [x] T019 Shop: `/shop` + landing rail with partner categories (Patagonia; REI removed), disclosure — samples hidden in production
- [x] T020 `/our-feed` and `/community` (Behold feeds, server-fetched hourly, lightbox, credits)
- [x] T021 Demo sign-in (test accounts in `fixtures/test-users.json`), sign-in pop-up (intercepted `/login`) + full `/login` page with video, menu sign-in/account, favorites hearts + `/favorites` — off in production until Supabase (spec 003)
- [x] T022 Tests: 19 unit, 87 e2e incl. sign-in → favorite flow and axe on 12 page types
- [ ] T013 Owner review on the Vercel preview (top 10 order, landscape tags, look & feel) → merge
