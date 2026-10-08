# Spec 010b — Share a hike (full submissions)

**Outcomes served:** O-2 (community content), O-4 (contributors), O-3 (more hikes with facts).
**Status:** specified (owner request 2026-10-08) — build later. Extends spec 010 ("Share your
photo"), which stays for adding photos to existing hikes.

## Goal

Let hikers submit a **whole hike** — the same fields a hike page shows — so the catalogue grows
from the community. Only the photo is mandatory; everything else is optional and helps us
publish faster. Every submission is reviewed, may be edited, and is approved by the owner.

## Form (`/share` → "Add a new hike", multi-step, saves a draft as you go)

| Step | Fields (required in bold) |
|---|---|
| 1. Photos | **1–6 photos** (first = cover); per photo: optional caption; resize ≤ 2400 px in browser, EXIF/GPS stripped |
| 2. Place | **Place / hike name**, country (select), region; pin on a map (MapLibre, optional) → lat/lng; landscapes (multi-select) |
| 3. The route | Route name, distance (km/mi toggle), elevation gain, highest point, duration, difficulty (4 levels), route type, best months (12-month picker), permit/fees, getting there |
| 4. Story & tips | Short description (≤ 300), your story (≤ 2,000), tips (up to 5, typed like spec 009: water, permits, transport, stay, gear, safety), useful links (official site) |
| 5. Credit & license | Credit name (prefilled), Instagram handle, **contributor license** checkbox |

**Notice shown on step 5 and on the confirmation screen:**
> Every hike is reviewed by the Great Hikes team before it's published. We may edit, shorten or
> correct the text and facts (for accuracy, safety and style) and choose which photos to show,
> as described in our [Terms](/terms). You keep the copyright of your photos and words; you can
> ask us to remove them at any time.

Existing-hike photos keep the quick spec-010 flow ("Add photos to an existing hike").

## Data

- `submissions` gains `kind` (`photo` | `hike`) and a `details jsonb` validated server-side with
  the same Zod schema as hikes (`DetailsSchema`, all optional), plus `photos` (array of paths,
  max 6) and `links`.
- A submission never writes to `content/hikes.json` directly.

## Moderation (`/moderation`)

- New tab **New hikes**: preview the submission rendered like a hike page (draft badge).
- Actions: **Approve photos only** (gallery of an existing hike), **Convert to draft hike**
  (runs the add-hike flow: our agent fills gaps from official sources, flags conflicts with the
  submitter's facts, writes a draft with credit + sources), **Request changes** (email/DM template),
  **Reject**.
- Publishing remains `status: draft → published` after the owner reviews.

## Terms & privacy updates

- Terms: contributor license covers text and facts as well as photos; right to edit; removal on
  request; no guarantees of publication.
- Privacy: submission data kept while under review; rejected submissions deleted within 30 days.

## Acceptance

- A hiker can submit a hike with only a photo + name; validation explains missing optional
  fields as "helps us publish faster", never blocks.
- Mobile-first: each step fits a 360 px screen; progress saved if the tab closes.
- e2e: submit → owner converts to draft → draft hike page shows submitter credit.

## Later

Contributor profiles (count of featured hikes, badges), "Featured on Great Hikes" share card,
automatic duplicate detection (same place within 25 km).
