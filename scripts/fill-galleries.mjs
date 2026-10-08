/**
 * Tops up each hike's `gallery` (content/hikes.json) with extra credited photos, per source:
 *   --source unsplash  (hotlinked as Unsplash requires, download tracked; respects the hourly limit)
 *   --source commons   (Wikimedia Commons, free licenses only; served from upload.wikimedia.org)
 *   --target N         photos wanted from that source per hike (default 3)
 * Saves after every hike, so it can be stopped and re-run; never duplicates a photo.
 * Unsplash photos are kept first in the gallery (owner preference).
 *
 * After a Commons run, copy the photos to our storage: node scripts/mirror-commons.mjs
 *
 * Usage: node scripts/fill-galleries.mjs --source commons --target 4 [slug…]
 */
import { config } from "dotenv";
import { readFile, writeFile } from "node:fs/promises";

config({ path: ".env.local", quiet: true });
const KEY = process.env.UNSPLASH_ACCESS_KEY;
const UA = "GreatHikes/1.0 (https://great-hikes.vercel.app)";
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv.splice(i, 2)[1] : fallback;
};
const SOURCE = opt("source", "commons");
const TARGET = Number(opt("target", "3"));
const only = argv;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const FREE = /^(public domain|pd|cc0|cc by(-sa)? [0-9.]+)$/i;
const NOT_PHOTO = /\b(map|logo|flag|diagram|chart|plan|coat of arms|stamp|poster|sign|satellite)\b/i;
let remaining = 50;

async function unsplashFetch(url) {
  if (remaining < 4) {
    console.log("Unsplash hourly limit — waiting 61 minutes…");
    await sleep(61 * 60 * 1000);
    remaining = 50;
  }
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${KEY}`, "Accept-Version": "v1" } });
  remaining = Number(res.headers.get("x-ratelimit-remaining") ?? remaining - 1);
  return res;
}

async function unsplash(hike, n, skip) {
  if (!KEY || n <= 0) return [];
  const q = encodeURIComponent(`${hike.title} ${hike.country}`);
  const res = await unsplashFetch(`https://api.unsplash.com/search/photos?query=${q}&orientation=landscape&per_page=10&content_filter=high`);
  if (!res.ok) return [];
  const { results } = await res.json();
  const picked = results.filter((p) => p.width >= 3000 && !skip.some((src) => src.includes(p.urls.raw.split("?")[0]))).slice(0, n);
  for (const p of picked) await unsplashFetch(p.links.download_location); // required "download" tracking
  return picked.map((p) => ({
    src: `${p.urls.raw}&w=2400&q=80&fm=jpg&fit=max`,
    alt: `${hike.title}: ${p.alt_description ?? "landscape"}`.slice(0, 200),
    author: p.user.name,
    authorUrl: `${p.user.links.html}?utm_source=great_hikes&utm_medium=referral`,
    sourceUrl: `${p.links.html}?utm_source=great_hikes&utm_medium=referral`,
    license: "Unsplash License",
  }));
}

async function commons(hike, n, skip) {
  if (n <= 0) return [];
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=50" +
    `&gsrsearch=${encodeURIComponent(`${hike.title} filetype:bitmap`)}&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1920`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return [];
  const pages = Object.values((await res.json()).query?.pages ?? {}).sort((a, b) => a.index - b.index);
  return pages
    .map((p) => ({ title: p.title, info: p.imageinfo?.[0] }))
    .filter(({ title, info }) => info && info.mime === "image/jpeg" && info.width >= 2000 && info.width > info.height * 1.2 && !NOT_PHOTO.test(title))
    .map((x) => ({ ...x, license: strip(x.info.extmetadata?.LicenseShortName?.value) }))
    .filter((x) => FREE.test(x.license) && !skip.includes(x.info.thumburl))
    .slice(0, n)
    .map(({ title, info, license }) => ({
      src: info.thumburl,
      alt: `${hike.title}: ${strip(info.extmetadata?.ImageDescription?.value) || title.replace(/^File:|\.jpe?g$/gi, "")}`.slice(0, 200),
      author: strip(info.extmetadata?.Artist?.value).slice(0, 80) || "Unknown",
      sourceUrl: info.descriptionurl,
      license: /^pd$/i.test(license) ? "Public domain" : license,
    }));
}

const hikes = JSON.parse(await readFile("content/hikes.json", "utf8"));
const isUnsplash = (p) => p.license === "Unsplash License";
for (const hike of hikes) {
  if (only.length && !only.includes(hike.slug)) continue;
  const gallery = hike.gallery ?? [];
  const have = gallery.filter((p) => (SOURCE === "unsplash" ? isUnsplash(p) : !isUnsplash(p))).length;
  const skip = [hike.photo.src, ...gallery.map((p) => p.src)];
  const added = SOURCE === "unsplash" ? await unsplash(hike, TARGET - have, skip) : await commons(hike, TARGET - have, skip);
  if (!added.length) continue;
  const all = [...gallery, ...added];
  hike.gallery = [...all.filter(isUnsplash), ...all.filter((p) => !isUnsplash(p))];
  await writeFile("content/hikes.json", `${JSON.stringify(hikes, null, 2)}\n`);
  console.log(`${hike.slug}: +${added.length} ${SOURCE} → ${hike.gallery.length} photos${SOURCE === "unsplash" ? ` (Unsplash left: ${remaining})` : ""}`);
  await sleep(SOURCE === "unsplash" ? 500 : 300);
}
console.log("done");
