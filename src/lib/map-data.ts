import { allHikes, hikePath } from "./hikes";
import type { LandscapeKey } from "./schema";
import { allTrails, trailGeo, trailPath } from "./trails";

/** One pin or line on /map — everything the list, filters and preview card need. */
export type MapItem = {
  id: string;
  kind: "place" | "trail";
  href: string;
  title: string;
  subtitle: string;
  continent: string;
  landscapes: LandscapeKey[];
  difficulty: string | null;
  distanceKm: number | null;
  duration: string | null;
  bestMonths: number[];
  image: string;
  lat: number;
  lng: number;
  /** Trail line as [lng, lat] pairs. */
  line?: [number, number][];
};

export async function mapItems(): Promise<MapItem[]> {
  const places: MapItem[] = allHikes()
    .filter((h) => h.location)
    .map((h) => ({
      id: h.slug,
      kind: "place",
      href: hikePath(h),
      title: h.title,
      subtitle: `${h.country} · ${h.continent}`,
      continent: h.continent,
      landscapes: h.landscapes,
      difficulty: h.details?.difficulty ?? null,
      distanceKm: h.details?.distanceKm ?? null,
      duration: h.details?.duration ?? null,
      bestMonths: h.details?.bestMonths ?? [],
      image: h.photo.src,
      lat: h.location!.lat,
      lng: h.location!.lng,
    }));

  const trails = await Promise.all(
    allTrails().map(async (t): Promise<MapItem | null> => {
      const place = allHikes().find((h) => h.slug === t.place);
      const geo = await trailGeo(t);
      const start = geo ? { lng: geo.line[0][0], lat: geo.line[0][1] } : place?.location;
      if (!place || !start) return null;
      return {
        id: `${t.place}/${t.slug}`,
        kind: "trail",
        href: trailPath(t),
        title: t.name,
        subtitle: place.title,
        continent: place.continent,
        landscapes: place.landscapes,
        difficulty: t.details.difficulty,
        distanceKm: t.details.distanceKm ?? geo?.lengthKm ?? null,
        duration: t.details.duration,
        bestMonths: t.details.bestMonths,
        image: (t.photo ?? place.photo).src,
        lat: start.lat,
        lng: start.lng,
        line: geo?.line,
      };
    }),
  );
  return [...places, ...trails.filter((t): t is MapItem => t !== null)];
}
