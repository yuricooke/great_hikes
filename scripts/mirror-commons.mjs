/**
 * Copies Wikimedia Commons gallery photos into our Supabase Storage bucket `media` (public), so the
 * site never hotlinks Commons (Wikimedia rate-limits image optimizers). Resized only (sips,
 * ≤ 1920 px, JPEG q76) — no editing. Credit and license stay as recorded. Also drops pictures that
 * aren't trail photos (satellite images, maps). Idempotent; saves after each hike. Don't run it
 * while fill-galleries.mjs is running (both write content/hikes.json).
 *
 * Usage: node scripts/mirror-commons.mjs
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

config({ path: ".env.local", quiet: true });
const UA = "GreatHikes/1.0 (https://great-hikes.vercel.app; media mirror)";
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOT_TRAIL = /satellite|\bmap\b|aerial view from space|diagram/i;
const tmp = mkdtempSync(path.join(tmpdir(), "gh-media-"));

const { data: buckets } = await admin.storage.listBuckets();
if (!buckets?.some((b) => b.id === "media")) {
  const { error } = await admin.storage.createBucket("media", { public: true, fileSizeLimit: "8MB", allowedMimeTypes: ["image/jpeg"] });
  if (error) throw error;
}

async function download(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429) {
      await sleep(5000 * (attempt + 1));
      continue;
    }
    throw new Error(`${res.status} ${url}`);
  }
  throw new Error(`rate-limited: ${url}`);
}

const hikes = JSON.parse(await readFile("content/hikes.json", "utf8"));
let copied = 0;
let dropped = 0;
for (const hike of hikes) {
  const next = [];
  for (const [i, photo] of (hike.gallery ?? []).entries()) {
    if (!/wikimedia\.org/.test(photo.src)) {
      next.push(photo);
      continue;
    }
    if (NOT_TRAIL.test(`${photo.alt} ${photo.src}`)) {
      dropped++;
      continue;
    }
    const file = path.join(tmp, `${hike.slug}-${i}.jpg`);
    writeFileSync(file, await download(photo.src));
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "76", "-Z", "1920", file, "--out", file], { stdio: "ignore" });
    const key = `gallery/${hike.slug}/${path.basename(new URL(photo.sourceUrl).pathname).replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 80)}.jpg`;
    const { error } = await admin.storage.from("media").upload(key, readFileSync(file), { contentType: "image/jpeg", upsert: true });
    if (error) throw error;
    next.push({ ...photo, src: admin.storage.from("media").getPublicUrl(key).data.publicUrl });
    copied++;
    await sleep(1200); // be gentle with Wikimedia
  }
  hike.gallery = next;
  // Save after every hike so a stopped run keeps its progress (re-runs skip mirrored photos).
  await writeFile("content/hikes.json", `${JSON.stringify(hikes, null, 2)}\n`);
  console.log(`${hike.slug}: ${next.length} photos`);
}
console.log(`copied ${copied} Commons photos to Supabase media, dropped ${dropped} non-trail images`);
