# Discovery → Delivery Flow

Great Hikes follows this loop. Every stage has a home in the repo, so each spec can be traced back
to a business problem and forward to a production metric.

```
BUSINESS PROBLEM ............ docs/discovery/01-business-problem.md
   ↓
AI DOMAIN DISCOVERY ......... docs/discovery/02-domain-discovery.md
   ↓
AI PRODUCT DISCOVERY ........ docs/discovery/03-product-discovery.md
   ↓
BUSINESS OUTCOME DEFINITION . docs/discovery/04-outcomes-and-metrics.md  (O-1…O-n)
   ↓
INTENT ...................... docs/roadmap.md (one line of intent per spec, linked to outcomes)
   ↓
SPECIFICATION ............... specs/NNN-name/spec.md        (/speckit-specify, /speckit-clarify)
   ↓
CONTRACTS ................... specs/NNN-name/contracts/, data-model.md (/speckit-plan)
   ↓
AI IMPLEMENTATION ........... specs/NNN-name/tasks.md → code (/speckit-tasks, /speckit-implement)
   ↓
AI VALIDATION ............... quickstart.md scenarios, tests, design-guardian review, preview check
   ↓
PRODUCTION METRICS .......... 04-outcomes-and-metrics.md (measured after release)
   │
   └──→ DISCOVERY ........... docs/discovery/learning-log.md → updates 01–04 and the roadmap
```

## Rules

- Every spec names the outcome(s) it serves (`O-n`) and how it will be measured in production.
- After each release, record the measured metrics and what we learned in `learning-log.md`
  within 2 weeks; adjust outcomes, hypotheses and roadmap order accordingly.
- Hypotheses in 03 are tested cheaply (prototype, preview, Instagram poll) before they become
  big specs. Example: the Instagram import was validated with a prototype on
  `test/instagram-feed` before spec 006.
- "AI" stages: Claude agents do research, drafting and validation; the owner decides. Facts that
  reach the public site (trail data, credits) are verified against sources (constitution III).
