# Learning Log (Production Metrics → Discovery)

Newest first. Each entry: what we measured or observed, what we learned, what changes.

## 2026-10-07 · Instagram import prototype (`test/instagram-feed`)

- **Observed:** Behold feeds work without Meta developer access (advanced source via Business
  Portfolio). Own feed captions follow "Place | @photographer" → title and credit parse
  automatically for 6/6 posts. Hashtag results have no author field; free plan = 1 active feed,
  6 posts; "Top" hashtag posts are from 2017–2019.
- **Learned:** credit is solvable for our own feed; hashtag posts need manual credit in curation.
  Location must come from caption place names (no GPS/location tag).
- **Changes:** spec 006 includes curation with credit/consent; spec 007 geocodes place names with
  owner confirmation; Behold Starter plan needed before launch (2 feeds, 50 posts).
