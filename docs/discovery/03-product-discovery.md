# 03 · Product Discovery

Status: draft · 2026-10-07

## Personas

| Persona | Description | Job to be done |
|---------|-------------|----------------|
| **Lia, the hiker-photographer** | Posts trail photos, tags #great_hikes, 1–10k followers | "When I share a great hike, I want lasting credit and visibility so my work is recognized." |
| **Marco, the trip dreamer-planner** | Saves Instagram photos of places he'd like to go | "When a photo inspires me, I want to know where it is and whether I can do the hike, so I can plan it." |
| **The owner (approver)** | Runs @great_hikes, wants curation automated | "When agents find a great post, I want it fully prepared (credit, place, facts, consent message) so I only approve or reject." |

## Value propositions

- Lia: a permanent, credited feature page she can share ("Featured on Great Hikes").
- Marco: photo → place → map, distance, elevation, season, tips → plan.
- Owner: curation queue + automated enrichment (map, facts, draft description).

## Core loop (the product's engine)

Post with #great_hikes → owner curates (consent + credit) → featured hike page (photo + facts) →
photographer shares their feature → followers visit & follow → more posts.

## Hypotheses to validate (cheapest test first)

| ID | Hypothesis | Test | Signal of success |
|----|------------|------|-------------------|
| H1 | Photographers will share their feature page | Feature 10 photographers on the preview/new site, DM them the link | ≥ 5 of 10 share it (story/post) |
| H2 | Photographers give consent when asked | Comment/DM consent request to 20 posters | ≥ 60% reply yes within 7 days |
| H3 | Visitors from Instagram explore beyond the first page | Bio link to site; analytics | ≥ 40% of IG visitors view 2+ pages |
| H4 | Practical facts (map/km/elevation) increase engagement vs photo-only | Compare hike pages with vs. without enrichment | Longer time on page, more clicks to map/official site |
| H5 | Followers want gear suggestions | Instagram story poll; affiliate click-through on gear lists | Poll ≥ 50% yes; CTR ≥ 2% |
| H6 | Automated curation needs ≤ 30 min/week of owner approval | Run the agent-prepared approval queue for 4 weeks | Owner time log; ≥ 70% of proposals approved without edits |
| H7 | Paid promotion acquires engaged community members at an acceptable cost | Small test budget on Instagram ads to a featured-hike page | Cost per engaged visitor / per follower within the target set in 04 |

## Prioritization (what this means for the roadmap)

1. Foundation that makes pages shareable and beautiful (001).
2. UX shell: landing (002), accounts & favorites (003), journal (004), shop (005).
3. Featuring with credit/consent (006) — drives H1/H2/H3, the engine.
4. Enrichment (007) — answers Marco's job (H4).
5. Reviews/tips (008), submissions (009) — after the loop shows traction.

## Risks

- Consent friction slows featuring (H2) → mitigate with a simple reply-to-consent flow.
- Enrichment accuracy (place → trail matching) → owner confirms in curation.
- Dependence on Behold/Meta → keep imported data in our own store; feeds are swappable.
