# 04 · Business Outcomes & Production Metrics

Status: draft targets — owner to confirm (see 01, Q1–Q3) · 2026-10-07

## North-star metric

**Featured hikes shared per month** — number of times featured photographers/visitors share a
Great Hikes page. It captures the whole loop: curation → value to photographers → reach.

## Outcomes

| ID | Outcome (6 months after launch) | Metric | Target (proposed) | Specs |
|----|-------------------------------|--------|-------------------|-------|
| O-1 | The site becomes a destination for the community | Monthly visitors; % from Instagram | 3,000/month; 40% from IG | 001, 002 |
| O-2 | Photographers value being featured | Featured posts with consent; shares of feature pages | 100 featured; 30% shared | 002 |
| O-3 | Planners find what they need | Hike pages with full facts; clicks on map/official site per visit | 80% enriched; ≥ 0.5 clicks/visit | 003 |
| O-4 | The community contributes beyond Instagram | Reviews/tips per month; submissions | 30 reviews/tips; 10 submissions | 004, 005 |
| O-5 | The project covers its running costs | Affiliate revenue vs. monthly costs | ≥ 100% of costs (≈ $40–70/month) | 006 |
| O-6 | Great Hikes owns its audience | Newsletter subscribers / IG followers growth | 500 subscribers; +30% followers | 002, 007 |

## Quality guardrails (must not regress)

- Core Web Vitals "good" on mobile (constitution IV).
- 0 serious/critical accessibility issues.
- 0 photos published without recorded consent.
- Takedown requests handled within 48 h.

## Instrumentation (added in spec 007, basics in 001)

- Privacy-friendly analytics (e.g. Vercel Web Analytics) with UTM tags on the Instagram bio link
  and feature share links.
- Events: share clicks, map/official-site clicks, affiliate clicks, consent status changes.

## Review cadence

Monthly: compare metrics to targets → write `learning-log.md` entry → adjust hypotheses (03) and
roadmap order.
