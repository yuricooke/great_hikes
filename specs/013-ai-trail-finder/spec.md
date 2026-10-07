# Spec 013 — "Describe the hike you want" (AI trail finder)

**Outcomes served:** O-3 (find the right hike fast), O-4 (return visits), O-5 (gear and trip
suggestions in context).
**Status:** specified — depends on 008b (trail data) and an Anthropic API key (owner decision:
cost).

## The experience

A search box on the landing page and /search: *"A 2–3 day trek in South America in March with
glaciers, not too technical."* The finder answers with 3–6 trail/place cards, each with one line
on **why it fits** (season, length, difficulty, landscape), and follow-up chips ("shorter",
"fewer crowds", "in Europe instead"). No sign-in needed; signed-in users can save the result.

## How it works (grounded, not invented)

1. Claude (Haiku 4.5 — fast and cheap) turns the request into structured filters: continents,
   months, days/distance, difficulty, landscapes, must-haves (permit-free, huts, dogs…).
2. Our own data is filtered and ranked in code (`allHikes`, `allTrails`, best months, facts).
3. Claude writes the short "why it fits" lines **only from the facts we pass it**, and may only
   return slugs from that candidate list (validated server-side). No web search, no made-up trails.
4. Results show sources/links to the place and trail pages as usual.

Route: `POST /api/finder` (rate-limited per IP; prompt + candidates ≤ ~6k tokens). Cache identical
queries for a day. Log queries (no personal data) to learn what people want → new trails/journal.

## Costs & guardrails

- Rough cost with Haiku 4.5: well under 1 US cent per search; a monthly budget cap in the
  Anthropic console. Off when `ANTHROPIC_API_KEY` is missing.
- Safety: never present AI text as official conditions; every card links to sourced pages and
  "check current conditions" stays visible.
- Accessibility: results announced via `aria-live`; works without JavaScript as a plain search.

## Owner decisions needed

1. OK to add an Anthropic API key (Vercel env) with a monthly cap (suggest US$10)?
2. Launch with the 32 places + pilot trails, or wait for more trails per place?
