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

/** The slim hike shape list/filter UIs need (keeps client payloads small). */
export type HikeCardData = Pick<Hike, "id" | "slug" | "title" | "country" | "continent" | "landscapes" | "biome" | "description"> & {
  photo: { src: string };
  difficulty: string | null;
  bestMonths: number[];
};

/** Filters shared by the landing "Explore by" and All hikes (keys match the URL params). */
export type HikeFilters = { landscape: string | null; continent: string | null; difficulty: string | null; month: string | null };
export const NO_FILTERS: HikeFilters = { landscape: null, continent: null, difficulty: null, month: null };

export function matchesFilters(h: HikeCardData, f: HikeFilters): boolean {
  const continentName = CONTINENTS.find((c) => c.key === f.continent)?.name;
  if (f.continent && h.continent !== continentName) return false;
  if (f.landscape && !h.landscapes.includes(f.landscape as Hike["landscapes"][number])) return false;
  if (f.difficulty && h.difficulty !== f.difficulty) return false;
  if (f.month && !h.bestMonths.includes(Number(f.month))) return false;
  return true;
}

export type HikeSort = "latest" | "az";

/** Latest added first (ids grow as hikes are added), or alphabetical. */
export function sortHikes<T extends Pick<Hike, "id" | "title">>(hikes: T[], sort: HikeSort = "latest"): T[] {
  const copy = [...hikes];
  return sort === "az" ? copy.sort((a, b) => a.title.localeCompare(b.title)) : copy.sort((a, b) => b.id - a.id);
}
