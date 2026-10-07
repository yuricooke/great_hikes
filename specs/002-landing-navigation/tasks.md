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
- [ ] T013 Owner review on the Vercel preview (top 10 order, landscape tags, look & feel) → merge
