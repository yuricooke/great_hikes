import rawTrails from "@content/trails.json";

import { SHOW_SAMPLES } from "./flags";
import { hikeBySlug } from "./hikes";
import { TrailGeoSchema, TrailSchema, type Hike, type Trail, type TrailGeo } from "./schema";
import { TRAIL_GEO } from "./trail-geo.generated";

/** Validated at build; each trail must belong to a known place and be unique within it. */
function load(): Trail[] {
  const trails = TrailSchema.array().parse(rawTrails);
  const seen = new Set<string>();
  for (const t of trails) {
    const key = `${t.place}/${t.slug}`;
    if (seen.has(key)) throw new Error(`Duplicate trail ${key}`);
    seen.add(key);
  }
  return trails.filter((t) => (t.status === "published" || SHOW_SAMPLES) && hikeBySlug(t.place));
}

const TRAILS = load();

export function allTrails(): Trail[] {
  return TRAILS;
}

export function trailsFor(place: Hike | string): Trail[] {
  const slug = typeof place === "string" ? place : place.slug;
  return TRAILS.filter((t) => t.place === slug);
}

export function trailBySlug(place: string, slug: string): Trail | undefined {
  return TRAILS.find((t) => t.place === place && t.slug === slug);
}

export function trailPath(trail: Trail): string {
  return `/hikes/${trail.place}/${trail.slug}`;
}

/** Line + elevation profile imported from OpenStreetMap/SRTM, if available. */
export async function trailGeo(trail: Trail): Promise<TrailGeo | null> {
  const load = TRAIL_GEO[`${trail.place}--${trail.slug}`];
  if (!load) return null;
  return TrailGeoSchema.parse((await load()).default);
}
