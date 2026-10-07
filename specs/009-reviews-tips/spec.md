# Spec 009 — Reviews & tips

**Outcomes served:** O-4 (returning, contributing members), O-3 (fresher trip info).
**Status:** built on `009-reviews-tips`. Posting needs sign-in (live in production once the owner
switches auth on); reading works now.

## What hikers get

- On every place and trail page, **Reviews & tips**: average rating, reviews (stars, author's
  display name, month hiked, text), and **Tips from hikers** grouped by type — water, permits &
  fees, getting there, huts & camping, gear, safety, other (competitor learning: typed tips beat
  free text).
- Signed-in members write a review (1–5 stars, optional date hiked, 20–2,000 characters, consent
  to publish) and add short tips (10–500 characters). They can delete their own posts.
- The owner (profile role `owner`) sees hidden posts and can **Hide/Show** or delete any post.
- Our own editorial tips are now labelled "Good to know".

## Data & security (Supabase, `supabase/migrations/20261007_003_reviews_tips.sql`)

- `reviews` and `tips` keyed by `hike_slug` + optional `trail_slug`.
- RLS: anyone reads visible rows; authenticated users insert their own (a trigger sets `user_id`,
  the public `author_name` from the profile, and `status = visible`); users delete their own;
  only owners update, and only the `status` column is updatable.
- Pages render reviews server-side (SEO) and refresh on the client.

## Policy

Privacy and terms updated: posts are public with the display name; members keep ownership and can
delete; we may hide posts that break the rules.

## Later

Report button, email digest of new posts for the owner, photos in reviews (with spec 010),
helpful votes, schema.org `AggregateRating` once there are enough real reviews.
