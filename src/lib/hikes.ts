import rawHikes from "@content/hikes.json";

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

const HIKES = load();

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
