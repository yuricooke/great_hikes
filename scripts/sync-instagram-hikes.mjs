/**
 * Instagram features → hikes (spec 008).
 *
 * Reads the @great_hikes feed (Behold), parses "Place | @photographer" captions and:
 *  - skips posts already linked to a hike (hikes.json `instagram`) or already a candidate;
 *  - skips posts without a photographer handle (owner rule: no credit, no feature) or without a
 *    place that geocodes (OpenStreetMap Nominatim, 1 request/second);
 *  - links the post to an existing hike when the place is within 25 km of it;
 *  - otherwise adds it to content/hike-candidates.json for the add-hike skill/agent to research
 *    and turn into a draft hike that the owner approves. The Instagram image is never the hike's main
 *    photo (low-res) — it's credited in the hike's "Featured on @great_hikes" section/gallery
 *    (docs/business/instagram-content-policy.md). The hashtag feed is never published.
 *
 * Usage: node scripts/sync-instagram-hikes.mjs   (idempotent; safe to re-run)
 */
import { readFile, writeFile } from "node:fs/promises";

const FEED = "https://feeds.behold.so/z6suMCUuC1CDmLXvx9RX";
const UA = "GreatHikes/1.0 (https://great-hikes.vercel.app)";
const HIKES = "content/hikes.json";
const CANDIDATES = "content/hike-candidates.json";
/** Nominatim classes that can be a hiking place (rejects shops, offices, homes…). */
const OUTDOOR = new Set(["natural", "boundary", "leisure", "tourism", "place", "waterway", "mountain_pass", "highway"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parse(post, own) {
  const caption = (post.prunedCaption ?? post.caption ?? "").split("\n")[0];
  const handle = (post.mentions ?? []).find((m) => m !== own);
  if (!handle || !caption.includes("|")) return null;
  const place = caption
    .split("|")
    .map((p) => p.replace(/@[\w.]+/g, "").replace(/[\s.]+$/, "").trim())
    .filter(Boolean)
    .join(", ");
  return place ? { place, handle } : null;
}

async function geocode(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  await sleep(1100);
  if (!res.ok) return null;
  const [hit] = await res.json();
  if (!hit || !OUTDOOR.has(hit.class)) return null;
  return { lat: Number(hit.lat), lng: Number(hit.lon), name: hit.display_name, type: `${hit.class}/${hit.type}` };
}

function km(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

const feed = await (await fetch(FEED)).json();
const hikes = JSON.parse(await readFile(HIKES, "utf8"));
let candidates = [];
try {
  candidates = JSON.parse(await readFile(CANDIDATES, "utf8"));
} catch {
  /* first run */
}

const linked = new Set(hikes.flatMap((h) => h.instagram ?? []));
const pending = new Set(candidates.map((c) => c.postId));
let linkedNow = 0;
let added = 0;

for (const post of feed.posts) {
  if (linked.has(post.id) || pending.has(post.id)) continue;
  const parsed = parse(post, feed.username);
  if (!parsed) {
    console.log(`skip ${post.permalink} — no "Place | @photographer" caption`);
    continue;
  }
  const geo = await geocode(parsed.place);
  if (!geo) {
    console.log(`skip ${post.permalink} — "${parsed.place}" not found on the map`);
    continue;
  }
  const near = hikes.find((h) => h.location && km(h.location, geo) < 25);
  if (near) {
    near.instagram = [...(near.instagram ?? []), post.id];
    linkedNow++;
    console.log(`link ${post.permalink} → ${near.slug}`);
    continue;
  }
  candidates.push({
    postId: post.id,
    permalink: post.permalink,
    handle: `@${parsed.handle}`,
    place: parsed.place,
    image: post.sizes?.large?.mediaUrl ?? post.mediaUrl,
    geocode: geo,
    foundAt: new Date().toISOString().slice(0, 10),
  });
  added++;
  console.log(`new  ${post.permalink} → candidate "${parsed.place}"`);
}

await writeFile(HIKES, `${JSON.stringify(hikes, null, 2)}\n`);
await writeFile(CANDIDATES, `${JSON.stringify(candidates, null, 2)}\n`);
console.log(`done: ${linkedNow} linked to existing hikes, ${added} new candidates, ${candidates.length} pending`);
