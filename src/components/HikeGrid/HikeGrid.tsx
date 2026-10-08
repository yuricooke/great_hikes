import { hikeFacts, hikePath, type HikeCardData } from "@/lib/hike-utils";
import { LANDSCAPES, type Hike, type LandscapeKey } from "@/lib/schema";

/** Any hike-like object with what a card needs (full Hike or HikeCardData). */
type CardHike = Pick<Hike, "slug" | "title" | "country" | "continent" | "landscapes"> & {
  photo: { src: string };
} & Partial<Pick<HikeCardData, "distanceKm" | "duration" | "difficulty" | "trailCount">>;
import PhotoCard from "../PhotoCard/PhotoCard";
import styles from "./HikeGrid.module.css";

type Props = {
  hikes: CardHike[];
  /** Show rank badges (#1, #2…) for ranked topics. */
  ranked?: boolean;
  /** Don't badge with the landscape the page is already about. */
  hideLandscape?: LandscapeKey;
};

export function landscapeBadge(hike: Pick<Hike, "landscapes">, hide?: LandscapeKey) {
  const key = hike.landscapes.find((l) => l !== hide);
  return key ? LANDSCAPES.find((l) => l.key === key)?.label : undefined;
}

/** Responsive grid of hike cards for first-level pages. */
export default function HikeGrid({ hikes, ranked = false, hideLandscape }: Props) {
  return (
    <ul className={styles.grid} aria-label="Hikes">
      {hikes.map((hike, i) => (
        <li key={hike.slug}>
          <PhotoCard
            href={hikePath(hike)}
            image={hike.photo.src}
            title={hike.title}
            subtitle={`${hike.country} · ${hike.continent}`}
            badge={ranked ? `#${i + 1}` : landscapeBadge(hike, hideLandscape)}
            facts={hikeFacts({
              distanceKm: hike.distanceKm ?? null,
              duration: hike.duration ?? null,
              difficulty: hike.difficulty ?? null,
              trailCount: hike.trailCount ?? 0,
            })}
            favoriteSlug={hike.slug}
            sizes="(min-width: 1200px) 25vw, (min-width: 768px) 33vw, (min-width: 576px) 50vw, 100vw"
            priority={i < 2}
          />
        </li>
      ))}
    </ul>
  );
}
