import { CONTINENTS, type ContinentKey, type ContinentName, type Hike } from "./schema";

// Pure helpers, safe to import from client components (no data, no validation library).

export function continentKey(name: ContinentName): ContinentKey {
  return CONTINENTS.find((c) => c.name === name)!.key;
}

export function continentByKey(key: string | null | undefined) {
  return CONTINENTS.find((c) => c.key === key);
}

export function filterByContinent<T extends Pick<Hike, "continent">>(
  hikes: T[],
  key: string | null | undefined,
): T[] {
  if (!key) return hikes;
  const continent = continentByKey(key);
  return continent ? hikes.filter((h) => h.continent === continent.name) : [];
}

export function hikePath(hike: Pick<Hike, "slug">): string {
  return `/hikes/${hike.slug}`;
}
