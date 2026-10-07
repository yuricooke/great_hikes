/**
 * Photo suggestions from Unsplash and Pexels (free APIs) for trails/places without their own photo.
 *
 * Needs UNSPLASH_ACCESS_KEY and/or PEXELS_API_KEY in .env.local (never commit keys).
 * Writes content/photo-candidates.json and a contact sheet at photo-candidates.html (gitignored)
 * so the owner can pick, then `npm run photos:apply -- <target> <number>` sets the photo with credit.
 *
 * Usage: node scripts/suggest-photos.mjs                 (all trails using the place photo)
 *        node scripts/suggest-photos.mjs yosemite-national-park/sentinel-dome  (one target)
 */
import { config } from "dotenv";
import { readFile, writeFile } from "node:fs/promises";

config({ path: ".env.local" });
const UNSPLASH = process.env.UNSPLASH_ACCESS_KEY;
const PEXELS = process.env.PEXELS_API_KEY;
if (!UNSPLASH && !PEXELS) {
  console.error("Add UNSPLASH_ACCESS_KEY and/or PEXELS_API_KEY to .env.local first.");
  process.exit(1);
}
const PER = 4;
const only = process.argv[2];

async function unsplash(query) {
  if (!UNSPLASH) return [];
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=${PER}&content_filter=high`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${UNSPLASH}`, "Accept-Version": "v1" } });
  if (!res.ok) throw new Error(`Unsplash ${res.status}`);
  const { results } = await res.json();
  return results.map((p) => ({
    provider: "unsplash",
    id: p.id,
    thumb: p.urls.small,
    src: `${p.urls.raw}&w=2400&q=80&fm=jpg&fit=max`,
    alt: p.alt_description ?? "",
    author: p.user.name,
    authorUrl: `${p.user.links.html}?utm_source=great_hikes&utm_medium=referral`,
    sourceUrl: `${p.links.html}?utm_source=great_hikes&utm_medium=referral`,
    downloadLocation: p.links.download_location,
    width: p.width,
    height: p.height,
  }));
}

async function pexels(query) {
  if (!PEXELS) return [];
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=${PER}`;
  const res = await fetch(url, { headers: { Authorization: PEXELS } });
  if (!res.ok) throw new Error(`Pexels ${res.status}`);
  const { photos } = await res.json();
  return photos.map((p) => ({
    provider: "pexels",
    id: String(p.id),
    thumb: p.src.medium,
    src: `${p.src.original}?auto=compress&cs=tinysrgb&w=2400`,
    alt: p.alt ?? "",
    author: p.photographer,
    authorUrl: p.photographer_url,
    sourceUrl: p.url,
    width: p.width,
    height: p.height,
  }));
}

const hikes = JSON.parse(await readFile("content/hikes.json", "utf8"));
const trails = JSON.parse(await readFile("content/trails.json", "utf8"));
const targets = [
  ...trails.map((t) => ({ target: `${t.place}/${t.slug}`, query: `${t.name} ${hikes.find((h) => h.slug === t.place)?.title ?? ""}`, has: Boolean(t.photo) })),
  ...hikes.map((h) => ({ target: h.slug, query: `${h.title} ${h.country}`, has: !h.photo.src.startsWith("/hikes/") ? true : false })),
].filter((t) => (only ? t.target === only : !t.has && t.target.includes("/")));

const out = {};
for (const { target, query } of targets) {
  const [u, p] = await Promise.all([unsplash(query), pexels(query)]);
  out[target] = { query, candidates: [...u, ...p] };
  console.log(`${target}: ${u.length} Unsplash + ${p.length} Pexels`);
}
await writeFile("content/photo-candidates.json", `${JSON.stringify(out, null, 2)}\n`);

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const html = `<!doctype html><meta charset="utf-8"><title>Photo candidates</title>
<style>body{font-family:system-ui;background:#111;color:#eee;margin:24px}h2{margin-top:40px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
figure{margin:0;background:#1d1d1d;border-radius:10px;overflow:hidden}img{width:100%;aspect-ratio:3/2;object-fit:cover;display:block}
figcaption{padding:8px 10px;font-size:13px}b{font-size:18px;color:#7fd39b}a{color:#9cc}</style>
<h1>Pick a photo: tell Claude "target: number"</h1>
${Object.entries(out)
  .map(
    ([target, { query, candidates }]) => `<h2>${esc(target)}</h2><p>search: "${esc(query)}"</p><div class="g">${candidates
      .map(
        (c, i) =>
          `<figure><img src="${esc(c.thumb)}" alt="${esc(c.alt)}"><figcaption><b>${i + 1}</b> · ${esc(c.provider)} · <a href="${esc(c.sourceUrl)}">${esc(c.author)}</a> · ${c.width}×${c.height}<br>${esc(c.alt)}</figcaption></figure>`,
      )
      .join("")}</div>`,
  )
  .join("")}`;
await writeFile("photo-candidates.html", html);
console.log("Open photo-candidates.html to choose.");
