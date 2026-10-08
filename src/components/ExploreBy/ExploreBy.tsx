"use client";

import { useMemo, useState } from "react";

import { NO_FILTERS, matchesFilters, sortHikes, type HikeCardData, type HikeFilters } from "@/lib/hike-utils";
import { CONTINENTS } from "@/lib/schema";
import FilterBar from "../FilterBar/FilterBar";
import HikeGrid from "../HikeGrid/HikeGrid";
import PillButton from "../PillButton/PillButton";
import styles from "./ExploreBy.module.css";

const SHOWN = 8;

/** One hike per continent (the newest of each), so the default view differs from "Recently added". */
function aroundTheWorld(hikes: HikeCardData[]) {
  const latest = sortHikes(hikes, "latest");
  const picks = CONTINENTS.map((c) => latest.find((h) => h.continent === c.name)).filter(Boolean) as HikeCardData[];
  const rest = latest.filter((h) => !picks.includes(h));
  return [...picks, ...rest].slice(0, SHOWN);
}

/**
 * Landing "Explore by": dropdown filters with removable tags; the grid below updates in place.
 * No filter → "Around the world". "See all" opens /hikes with the same filters.
 */
export default function ExploreBy({ hikes }: { hikes: HikeCardData[] }) {
  const [filters, setFilters] = useState<HikeFilters>(NO_FILTERS);
  const filtered = Object.values(filters).some(Boolean);

  const list = useMemo(
    () => (filtered ? sortHikes(hikes.filter((h) => matchesFilters(h, filters)), "latest") : aroundTheWorld(hikes)),
    [hikes, filters, filtered],
  );
  const total = filtered ? list.length : hikes.length;
  const query = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <div className={styles.explore}>
      <FilterBar value={filters} onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))} />
      <p className={styles.count} aria-live="polite">
        {filtered ? `${total} ${total === 1 ? "hike" : "hikes"} match` : "Around the world"}
      </p>
      {list.length > 0 ? (
        <HikeGrid hikes={list.slice(0, SHOWN)} hideLandscape={(filters.landscape ?? undefined) as HikeCardData["landscapes"][number] | undefined} />
      ) : (
        <p className={styles.count}>No hikes match yet — remove a filter.</p>
      )}
      <div className={styles.actions}>
        <PillButton href={query ? `/hikes?${query}` : "/hikes"} variant="accent" icon="hiking">
          {filtered ? `See all ${total} matching hikes` : `See all ${hikes.length} hikes`}
        </PillButton>
        <PillButton href="/search" variant="outline" icon="search">
          Search hikes & guides
        </PillButton>
      </div>
    </div>
  );
}
