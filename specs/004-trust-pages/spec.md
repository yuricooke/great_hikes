# Spec 004 — Trust pages & analytics

**Outcomes served:** O-5 (income: affiliate approval), O-6 (trust / personal brand).
**Status:** implemented on `004-trust-pages`.

## Pages

- `/about` — who runs Great Hikes, how hikes are chosen, photo consent & credit, fact checking,
  AI-assisted journal disclosure, how the site is funded.
- `/affiliate-disclosure` — FTC-style plain-language disclosure; linked from the footer and shop.
- `/privacy` — data collected (accounts, favorites, messages, cookieless analytics, server logs),
  processors (Vercel, Supabase, Google sign-in), third-party content (OpenStreetMap, Behold,
  MET Norway), rights, children, changes. No tracking cookies → no cookie banner.
- `/terms` — use, hiking-at-your-own-risk, photo ownership & takedown, accounts, links/partners.
- `/contact` — form (name, email, topic, message; honeypot) → Supabase `contact_messages`
  (service role only, RLS on, no public policies). Owner reads messages in Supabase → Table editor.

## Analytics

Vercel Web Analytics (`@vercel/analytics`), cookieless. **Owner:** enable it in Vercel →
project → Analytics.

## Owner review

The policies are plain-language templates matching what the site actually does — not legal
advice. Review the operator name ("run by Yuri Cooke") and have them checked before scaling.
Update the pages when new data uses appear (reviews, submissions, newsletter).
