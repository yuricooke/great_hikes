/**
 * Applies a chosen candidate (from content/photo-candidates.json) to a trail or place, with the
 * credit each source requires. Commons photos are downloaded to /public/trails (resized only). For Unsplash it also calls the download endpoint, as the
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

const label = { unsplash: "Unsplash", pexels: "Pexels", commons: "Wikimedia Commons" }[pick.provider];
const [place, trailSlug] = target.split("/");
const file = trailSlug ? "content/trails.json" : "content/hikes.json";
const items = JSON.parse(await readFile(file, "utf8"));
const item = trailSlug ? items.find((t) => t.place === place && t.slug === trailSlug) : items.find((h) => h.slug === place);
if (!item) throw new Error(`Unknown target ${target}`);

let src = pick.src;
if (pick.provider === "commons") {
  // Commons has no image CDN for our domain list: store a 2400 px copy locally (no editing).
  const { execFileSync } = await import("node:child_process");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const slug = target.replace("/", "--");
  mkdirSync("public/trails", { recursive: true });
  const file = `public/trails/${slug}.jpg`;
  const thumb = `https://commons.wikimedia.org/w/index.php?title=Special:FilePath/${encodeURIComponent(pick.id.replace(/^File:/, ""))}&width=2400`;
  const res = await fetch(thumb, { headers: { "User-Agent": "GreatHikes/1.0 (https://great-hikes.vercel.app)" } });
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "75", "-Z", "2400", file, "--out", file], { stdio: "ignore" });
  src = `/trails/${slug}.jpg`;
}

item.photo = {
  src,
  alt: pick.alt ? pick.alt.charAt(0).toUpperCase() + pick.alt.slice(1) : item.name ?? item.title,
  author: pick.author,
  authorUrl: pick.authorUrl,
  sourceUrl: pick.sourceUrl,
  license: pick.provider === "commons" ? pick.license : `${label} License`,
};
await writeFile(file, `${JSON.stringify(items, null, 2)}\n`);

if (pick.provider === "unsplash" && pick.downloadLocation) {
  const res = await fetch(pick.downloadLocation, { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } });
  console.log(`Unsplash download tracked: ${res.status}`);
}
console.log(`${target} → ${label} photo by ${pick.author}. Check the alt text in ${file}.`);
