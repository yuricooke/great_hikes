/**
 * One-off migration (spec 001, T011): legacy CRA data → content/hikes.json.
 *
 * Usage: npm run migrate:legacy -- <path-to-legacy-hikes.json>
 *
 * - Adds a stored slug, a structured `photo` object and `officialUrl`.
 * - Moves public/NN.jpg → public/hikes/<slug>.jpg (skips files already moved).
 * - Validates the result with the same Zod schema the site uses.
 * Re-running is safe: it rewrites content/hikes.json from the legacy file.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import { HikesSchema, type Hike } from "../src/lib/schema";
import { slugify } from "../src/lib/slug";

type LegacyHike = {
  id: number;
  title: string;
  continent: string;
  country: string;
  biome: string;
  description: string;
  link_to_site: string;
  imageUrl: string;
  imageAuthor: string;
  authorLink: string;
  hikingExplained: string;
  map: string;
};

const legacyPath = process.argv[2];
if (!legacyPath) {
  console.error("Usage: npm run migrate:legacy -- <path-to-legacy-hikes.json>");
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const legacy: LegacyHike[] = JSON.parse(readFileSync(legacyPath, "utf8")).hikesData;

function license(sourceUrl: string): string {
  if (sourceUrl.includes("unsplash.com")) return "Unsplash License";
  if (sourceUrl.includes("pexels.com")) return "Pexels License";
  return "Unknown — replace this photo";
}

mkdirSync(path.join(root, "public/hikes"), { recursive: true });

const hikes: Hike[] = legacy.map((h) => {
  const slug = slugify(h.title);
  const ext = path.extname(h.imageUrl);
  const newSrc = `/hikes/${slug}${ext}`;
  const from = path.join(root, "public", h.imageUrl);
  const to = path.join(root, "public", newSrc);
  if (existsSync(from) && !existsSync(to)) renameSync(from, to);

  const author = h.imageAuthor && h.imageAuthor.toLowerCase() !== "unknown" ? h.imageAuthor : "Unknown";
  return {
    id: h.id,
    slug,
    title: h.title.trim(),
    continent: h.continent as Hike["continent"],
    country: h.country.trim(),
    biome: h.biome.trim(),
    description: h.description.replace(/<[^>]+>/g, "").trim(),
    hikingExplained: h.hikingExplained.replace(/<[^>]+>/g, "").trim(),
    officialUrl: h.link_to_site ? h.link_to_site : null,
    map: h.map,
    photo: {
      src: newSrc,
      alt: `${h.title.trim()}, ${h.country.trim()}`,
      author,
      sourceUrl: h.authorLink || null,
      license: license(h.authorLink),
    },
  };
});

const parsed = HikesSchema.parse(hikes);
writeFileSync(path.join(root, "content/hikes.json"), JSON.stringify(parsed, null, 2) + "\n");
console.log(`Migrated ${parsed.length} hikes → content/hikes.json`);
for (const h of parsed.filter((x) => !x.photo.sourceUrl)) {
  console.warn(`⚠ ${h.slug}: photo has no source/credit — replace it (constitution III).`);
}
