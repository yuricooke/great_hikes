# Database Design

Status: draft · 2026-10-07 · Implemented incrementally: spec 003 creates the first tables.

## Choices

- **Supabase** (managed Postgres + Auth + Storage), free tier to start (constitution VI).
  - Auth: passwordless email link + Google (owner decision 2026-10-07).
  - Row Level Security (RLS) on every table: users only read/write their own private rows; public
    content is read-only to everyone; the owner role curates.
- **Local development**: Supabase CLI runs Postgres, Auth and a mail catcher (Inbucket) in
  Docker. A **seeded test user** (spec 003, `supabase/seed.sql`) lets us sign in locally — the
  magic-link email lands in the local mail catcher, never a real inbox. No production data or
  real credentials in the repo.
- **Editorial content stays in files for now** (`content/*.json`, later MDX for the journal):
  versioned in git, reviewed in pull requests, no CMS cost. Hikes are referenced from the
  database by `hike_slug` (stable, constitution IV). Moving hikes into Postgres is a later option
  if non-developers need to edit them.

## Entity overview

```
auth.users (Supabase)
   │ 1:1
profiles ─────────────┬──────────────┬───────────────┬────────────────┐
   │ 1:n              │ 1:n          │ 1:n           │ 1:n            │
favorites          reviews        tips          submissions      (owner) curation
 (hike_slug)      (hike_slug)   (hike_slug)     (photos, story)        │
                                                                       ▼
instagram_posts ── 1:1 ── features (published on site) ── n:1 ── photographers
       │                        │
       └──── consents ──────────┘           affiliate_clicks (shop analytics)
```

## Tables

### Spec 003 — accounts & favorites

| Table | Columns | Notes |
|-------|---------|-------|
| `profiles` | `id uuid PK → auth.users.id`, `display_name text`, `instagram_handle text null`, `avatar_url text null`, `role text check in ('member','owner') default 'member'`, `created_at timestamptz` | Created by trigger on sign-up. RLS: user reads/updates own row; public read of `display_name`, `avatar_url` only via view. |
| `favorites` | `user_id uuid → profiles.id`, `hike_slug text`, `created_at timestamptz`, **PK (`user_id`, `hike_slug`)** | RLS: owner of the row only. Slug validated in the app against `content/hikes.json`. |

### Spec 005 — shop (affiliates)

| Table | Columns | Notes |
|-------|---------|-------|
| `affiliate_clicks` | `id bigint PK`, `product_id text`, `partner text`, `page text`, `user_id uuid null`, `created_at` | Insert-only, anonymous allowed; feeds O-5 revenue metrics. Products themselves live in `content/products.json`. |

### Spec 006 — Instagram import & curation

| Table | Columns | Notes |
|-------|---------|-------|
| `instagram_posts` | `id text PK (IG id)`, `source text ('account','hashtag')`, `permalink`, `media_url`, `sizes jsonb`, `caption`, `posted_at`, `parsed_place text`, `photographer_handle text null`, `quality_score real`, `status text ('new','proposed','approved','rejected','skipped_no_credit')`, `hike_slug text null`, `imported_at` | Filled by the import agent. Posts without a photographer handle → `skipped_no_credit`. |
| `photographers` | `handle text PK`, `display_name`, `profile_url`, `first_featured_at` | Public credit pages. |
| `consents` | `id`, `photographer_handle`, `post_id`, `channel text ('instagram_dm','site_submission','email')`, `requested_at`, `granted_at null`, `evidence_url text`, `scope text`, `revoked_at null` | Constitution III evidence; takedown = set `revoked_at` → feature unpublished. |
| `features` | `id`, `post_id`, `hike_slug`, `published_at`, `unpublished_at null`, `approved_by uuid → profiles.id` | Only with a granted, non-revoked consent (DB check via trigger). |

### Specs 008–009 — reviews, tips, submissions

| Table | Columns | Notes |
|-------|---------|-------|
| `reviews` | `id`, `user_id`, `hike_slug`, `rating smallint 1–5`, `body`, `hiked_on date null`, `status ('pending','published','hidden')`, `created_at` | One review per user per hike (unique). |
| `tips` | `id`, `user_id`, `hike_slug`, `body (≤ 280)`, `upvotes int`, `status`, `created_at` | |
| `submissions` | `id`, `user_id`, `hike_slug null`, `place_text`, `story`, `photo_paths text[]` (Storage), `license_accepted_at`, `status`, `created_at` | Contributor license acceptance recorded. |

## Security & privacy

- RLS default-deny; explicit policies per table.
- Service-role key only on the server (Vercel env vars), never in the browser or repo.
- Personal data kept minimal (email in `auth.users`, display name, optional IG handle).
- Account deletion cascades favorites/reviews/tips; published features keep the photographer
  credit (it belongs to the post, not the account) unless consent is revoked.
