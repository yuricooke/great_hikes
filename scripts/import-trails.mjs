/**
 * Trail lines and elevation profiles (spec 008b).
 *
 * For each trail in content/trails.json with an `osmRelation` (one id, or several joined in order), fetches the hiking route from
 * OpenStreetMap (Overpass API), stitches its ways into one line, simplifies it for the web, samples
 * elevation from SRTM 30 m (OpenTopoData public API) and writes content/trail-geo/<place>--<slug>.json.
 * Attribution: © OpenStreetMap contributors (ODbL); elevation: NASA SRTM via OpenTopoData.
 *
 * Usage: node scripts/import-trails.mjs [--force] [slug…]   (skips trails already imported)
 */
import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

const UA = "GreatHikes/1.0 (https://great-hikes.vercel.app)";
const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
const OUT = "content/trail-geo";
const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const R = 6371000;
const rad = (d) => (d * Math.PI) / 180;
function dist([lng1, lat1], [lng2, lat2]) {
  const h = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function overpass(query) {
  for (const url of [...OVERPASS, ...OVERPASS, ...OVERPASS]) {
    try {
      const res = await fetch(url, { method: "POST", headers: { "User-Agent": UA }, body: new URLSearchParams({ data: query }) });
      if (res.ok) return await res.json();
    } catch {
      /* try the next mirror */
    }
    await sleep(10000);
  }
  throw new Error("Overpass unavailable");
}

/** Joins ways end to end, starting from the longest and growing at both ends (gaps up to maxGap metres). */
function stitch(ways, maxGap = 300) {
  const pool = ways.map((w) => w.geometry.map((p) => [p.lon, p.lat])).filter((l) => l.length > 1);
  const len = (l) => l.reduce((s, p, i) => (i ? s + dist(l[i - 1], p) : 0), 0);
  pool.sort((a, b) => len(b) - len(a));
  let line = pool.shift();
  for (;;) {
    let best = null;
    for (let i = 0; i < pool.length; i++) {
      const w = pool[i];
      const options = [
        [dist(line.at(-1), w[0]), "tail", w],
        [dist(line.at(-1), w.at(-1)), "tail", [...w].reverse()],
        [dist(line[0], w.at(-1)), "head", w],
        [dist(line[0], w[0]), "head", [...w].reverse()],
      ];
      for (const [d, end, seg] of options) if (!best || d < best.d) best = { d, end, seg, i };
    }
    if (!best || best.d > maxGap) break;
    pool.splice(best.i, 1);
    line = best.end === "tail" ? [...line, ...best.seg.slice(1)] : [...best.seg.slice(0, -1), ...line];
  }
  return line;
}

/** Douglas–Peucker in metres (local equirectangular projection). */
function simplify(points, tolerance) {
  const lat0 = rad(points[0][1]);
  const xy = points.map(([lng, lat]) => [rad(lng) * Math.cos(lat0) * R, rad(lat) * R]);
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = xy[a];
    const [bx, by] = xy[b];
    const L = Math.hypot(bx - ax, by - ay) || 1;
    let max = 0;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((bx - ax) * (ay - xy[i][1]) - (ax - xy[i][0]) * (by - ay)) / L;
      if (d > max) [max, idx] = [d, i];
    }
    if (max > tolerance) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/** Evenly spaced samples along the line: [{ km, point }]. */
function sample(line, n) {
  const cum = [0];
  for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + dist(line[i - 1], line[i]));
  const total = cum.at(-1);
  const out = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const target = (total * k) / (n - 1);
    while (j < line.length - 1 && cum[j] < target) j++;
    const t = (target - cum[j - 1]) / (cum[j] - cum[j - 1] || 1);
    const [a, b] = [line[j - 1], line[j]];
    out.push({ km: target / 1000, point: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] });
  }
  return { total, out };
}

async function elevations(points) {
  const result = [];
  for (let i = 0; i < points.length; i += 100) {
    const chunk = points.slice(i, i + 100);
    const locations = chunk.map(([lng, lat]) => `${lat.toFixed(5)},${lng.toFixed(5)}`).join("|");
    const res = await fetch(`https://api.opentopodata.org/v1/srtm30m?locations=${locations}`, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`OpenTopoData ${res.status}`);
    const json = await res.json();
    result.push(...json.results.map((r) => r.elevation));
    await sleep(1100);
  }
  return result;
}

const trails = JSON.parse(await readFile("content/trails.json", "utf8"));
mkdirSync(OUT, { recursive: true });

for (const trail of trails) {
  if (!trail.osmRelation || (only.length && !only.includes(trail.slug))) continue;
  const file = `${OUT}/${trail.place}--${trail.slug}.json`;
  if (existsSync(file) && !force) continue;

  const ids = [trail.osmRelation].flat();
  // Optional named ways (e.g. a connecting section that isn't part of any route relation).
  const extra = (trail.osmWays ?? []).map((w) => `way["name"="${w.name}"](${w.bbox.join(",")});`).join("");
  const data = await overpass(
    `[out:json][timeout:180];(${ids.map((id) => `relation(${id});`).join("")})->.r;(way(r.r);${extra});out geom;`,
  );
  const ways = data.elements.filter((e) => e.type === "way" && e.geometry);
  if (!ways.length) {
    console.log(`skip ${trail.slug}: relation ${trail.osmRelation} has no ways`);
    continue;
  }
  const line = stitch(ways, trail.maxGapM ?? 300);
  const { total, out } = sample(line, Math.max(40, Math.min(300, Math.round(total0(line) / 100))));
  const ele = await elevations(out.map((s) => s.point));
  const smooth = ele.map((e, i) => (ele[Math.max(0, i - 1)] + e + ele[Math.min(ele.length - 1, i + 1)]) / 3);
  let gain = 0;
  for (let i = 1; i < smooth.length; i++) gain += Math.max(0, smooth[i] - smooth[i - 1]);
  const web = simplify(line, total > 50000 ? 40 : 8);

  const geo = {
    relation: trail.osmRelation,
    attribution: "© OpenStreetMap contributors (ODbL); elevation: NASA SRTM via OpenTopoData",
    lengthKm: Math.round(total / 100) / 10,
    gainM: Math.round(gain),
    minM: Math.round(Math.min(...ele)),
    maxM: Math.round(Math.max(...ele)),
    line: web.map(([lng, lat]) => [+lng.toFixed(5), +lat.toFixed(5)]),
    profile: out.map((s, i) => [+s.km.toFixed(2), Math.round(ele[i])]),
  };
  await writeFile(file, `${JSON.stringify(geo)}\n`);
  console.log(`${trail.slug}: ${geo.lengthKm} km, +${geo.gainM} m, ${geo.minM}–${geo.maxM} m, ${web.length} points (${ways.length} ways)`);
  await sleep(1500);
}

function total0(line) {
  return line.reduce((s, p, i) => (i ? s + dist(line[i - 1], p) : 0), 0);
}

// Static import map so the app bundles every trail file (no runtime file reads on Vercel).
{
  const { readdir } = await import("node:fs/promises");
  const files = (await readdir(OUT)).filter((f) => f.endsWith(".json")).sort();
  const body = files.map((f) => `  "${f.replace(/\.json$/, "")}": () => import("@content/trail-geo/${f}"),`).join("\n");
  await writeFile(
    "src/lib/trail-geo.generated.ts",
    `// Generated by scripts/import-trails.mjs — do not edit.\nexport const TRAIL_GEO: Record<string, () => Promise<{ default: unknown }>> = {\n${body}\n};\n`,
  );
  console.log(`index: ${files.length} trail files`);
}
