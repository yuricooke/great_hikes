import rawHikes from "@content/hikes.json";
import rawTrails from "@content/trails.json";

import { SHOW_SAMPLES } from "./flags";
import { HikesSchema, type Hike } from "./schema";

/** Validated once at build time; invalid data or duplicate slugs fail the build. */
function load(): Hike[] {
  const hikes = HikesSchema.parse(rawHikes);
  for (const field of ["slug", "id"] as const) {
    const seen = new Set<string | number>();
    for (const hike of hikes) {
      if (seen.has(hike[field])) throw new Error(`Duplicate hike ${field}: ${hike[field]}`);
      seen.add(hike[field]);
    }
  }
  return hikes;
}

/** Drafts are visible in local dev and previews only, never in production. */
const HIKES = load().filter((h) => h.status === "published" || SHOW_SAMPLES);

export function allHikes(): Hike[] {
  return HIKES;
}

export function hikeBySlug(slug: string): Hike | undefined {
  return HIKES.find((h) => h.slug === slug);
}

export function hikeByLegacyId(id: number): Hike | undefined {
  return HIKES.find((h) => h.id === id);
}

/** Other hikes in the same continent, in data order. */
export function relatedHikes(hike: Hike, limit = 6): Hike[] {
  return HIKES.filter((h) => h.continent === hike.continent && h.id !== hike.id).slice(0, limit);
}

export { continentByKey, continentKey, filterByContinent, hikePath } from "./hike-utils";

// Trail pages per place (read raw here to avoid a hikes ↔ trails import cycle).
const TRAIL_COUNT = new Map<string, number>();
for (const t of rawTrails as { place: string; status?: string }[]) {
  if ((t.status ?? "published") === "published" || SHOW_SAMPLES) TRAIL_COUNT.set(t.place, (TRAIL_COUNT.get(t.place) ?? 0) + 1);
}

/** Slim copy for client-side lists and filters. */
export function toHikeCard(h: Hike): import("./hike-utils").HikeCardData {
  return {
    id: h.id,
    slug: h.slug,
    title: h.title,
    country: h.country,
    continent: h.continent,
    landscapes: h.landscapes,
    biome: h.biome,
    description: h.description,
    photo: { src: h.photo.src },
    difficulty: h.details?.difficulty ?? null,
    bestMonths: h.details?.bestMonths ?? [],
    distanceKm: h.details?.distanceKm ?? null,
    duration: h.details?.duration ?? null,
    trailCount: TRAIL_COUNT.get(h.slug) ?? 0,
  };
}
