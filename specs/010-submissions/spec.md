# Spec 010 — Community submissions ("Share your hike")

**Outcomes served:** O-2 (community photos reach the site), O-4 (members contribute), O-6 (reach).
**Status:** built on `010-submissions`. Live for members once sign-in is switched on.

## Flow

1. `/share` (menu, footer, every hike page: "Share your photo of …"): signed-in member picks a
   photo, the hike (or "a place not on Great Hikes yet" + name + country), credit name, optional
   Instagram handle and story, and accepts the contributor license (own photo; consent of
   recognisable people; free non-exclusive license to show it on the site and @great_hikes with
   credit; copyright stays with them; removal on request).
2. The browser resizes to ≤ 2400 px JPEG — re-encoding strips EXIF/GPS — and uploads to the
   private `submissions` bucket under the member's own folder.
3. `/moderation` (owner only, not indexed): pending / approved / rejected tabs with a preview.
   **Approve** copies the photo to the public `community` bucket, publishes the row and refreshes
   the hike page. **Reject** deletes the photo (both buckets).
4. Hike pages show approved photos under **From the community**, credited (linked to Instagram
   when given), with the hiker's story.

New-place submissions stay in the queue as leads for the `add-hike` skill (draft hike → approval).

## Security (migration `20261007_004_submissions.sql`)

RLS: public reads only approved rows; members insert their own (trigger forces `user_id`,
`pending`), may delete their own pending rows; no client updates — approval runs server-side
after checking the owner role. Storage policies restrict uploads/reads to the member's folder;
owners can read all.

## Constitution III

Consent is recorded per photo (license checkbox, timestamp, account). Credit is mandatory.
No automated editing (resize/re-encode only).

## Later

Email the owner on new submissions; let members see their submissions' status; repost to
Instagram (needs Meta access); turn approved photos into trail photos.
