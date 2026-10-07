/**
 * Applies a chosen Unsplash/Pexels candidate (from content/photo-candidates.json) to a trail or place,
 * with the credit each service requires. For Unsplash it also calls the download endpoint, as the
 * Unsplash API guidelines require when a photo is used.
 *
 * Usage: node scripts/apply-photo.mjs <target> <number>
 *   e.g. node scripts/apply-photo.mjs yosemite-national-park/sentinel-dome 2
 */
import { config } from "dotenv";
import { readFile, writeFile } from "node:fs/promises";

config({ path: ".env.local" });
const [target, nArg] = process.argv.slice(2);
const n = Number(nArg);
const candidates = JSON.parse(await readFile("content/photo-candidates.json", "utf8"));
const pick = candidates[target]?.candidates[n - 1];
if (!pick) {
  console.error(`No candidate ${nArg} for ${target}`);
  process.exit(1);
}

const label = pick.provider === "unsplash" ? "Unsplash" : "Pexels";
const [place, trailSlug] = target.split("/");
const file = trailSlug ? "content/trails.json" : "content/hikes.json";
const items = JSON.parse(await readFile(file, "utf8"));
const item = trailSlug ? items.find((t) => t.place === place && t.slug === trailSlug) : items.find((h) => h.slug === place);
if (!item) throw new Error(`Unknown target ${target}`);

item.photo = {
  src: pick.src,
  alt: pick.alt ? pick.alt.charAt(0).toUpperCase() + pick.alt.slice(1) : item.name ?? item.title,
  author: pick.author,
  authorUrl: pick.authorUrl,
  sourceUrl: pick.sourceUrl,
  license: `${label} License`,
};
await writeFile(file, `${JSON.stringify(items, null, 2)}\n`);

if (pick.provider === "unsplash" && pick.downloadLocation) {
  const res = await fetch(pick.downloadLocation, { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } });
  console.log(`Unsplash download tracked: ${res.status}`);
}
console.log(`${target} → ${label} photo by ${pick.author}. Check the alt text in ${file}.`);
