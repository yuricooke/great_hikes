"use client";

import { useMemo, useState } from "react";

import { sortHikes, type HikeCardData } from "@/lib/hike-utils";
import { CONTINENTS, LANDSCAPES } from "@/lib/schema";
import HikeGrid from "../HikeGrid/HikeGrid";
import PillButton from "../PillButton/PillButton";
import styles from "./ExploreBy.module.css";

type Filter = { key: "latest" } | { key: "landscape" | "continent"; value: string; label: string };

const SHOWN = 8;

/**
 * Landing "Explore by": tags filter the hikes right below (default: latest added) without leaving
 * the page; "See all" opens /hikes with the same filter.
 */
export default function ExploreBy({ hikes }: { hikes: HikeCardData[] }) {
  const [filter, setFilter] = useState<Filter>({ key: "latest" });

  const list = useMemo(() => {
    let out = hikes;
    if (filter.key === "landscape") out = hikes.filter((h) => h.landscapes.includes(filter.value as never));
    if (filter.key === "continent") out = hikes.filter((h) => h.continent === filter.label);
    return sortHikes(out, "latest");
  }, [hikes, filter]);

  const seeAll =
    filter.key === "latest" ? "/hikes" : `/hikes?${filter.key}=${encodeURIComponent(filter.value)}`;
  const isActive = (key: string, value?: string) =>
    filter.key === key && (!value || ("value" in filter && filter.value === value));

  const tag = (f: Filter, label: string) => {
    const active = f.key === "latest" ? filter.key === "latest" : isActive(f.key, (f as { value: string }).value);
    return (
      <li key={`${f.key}-${label}`}>
        <button type="button" className={styles.tag} aria-pressed={active} onClick={() => setFilter(f)}>
          {label}
        </button>
      </li>
    );
  };

  return (
    <div className={styles.explore}>
      <div className={styles.groups}>
        <div className={styles.group} role="group" aria-label="Show">
          <ul className={styles.tags}>{tag({ key: "latest" }, "Latest added")}</ul>
        </div>
        <div className={styles.group} role="group" aria-label="Landscape">
          <p className={styles.label}>Landscape</p>
          <ul className={styles.tags}>
            {LANDSCAPES.map((l) => tag({ key: "landscape", value: l.key, label: l.label }, l.label))}
          </ul>
        </div>
        <div className={styles.group} role="group" aria-label="Continent">
          <p className={styles.label}>Continent</p>
          <ul className={styles.tags}>
            {CONTINENTS.map((c) => tag({ key: "continent", value: c.key, label: c.name }, c.name))}
          </ul>
        </div>
      </div>

      <p className={styles.count} aria-live="polite">
        {filter.key === "latest" ? "Latest added" : filter.label} · {list.length} {list.length === 1 ? "hike" : "hikes"}
      </p>
      <HikeGrid hikes={list.slice(0, SHOWN)} />
      <div className={styles.actions}>
        <PillButton href={seeAll} variant="accent" icon="hiking">
          {filter.key === "latest" ? `See all ${hikes.length} hikes` : `See all ${list.length} · ${filter.label}`}
        </PillButton>
        <PillButton href="/search" variant="outline" icon="search">
          Search hikes & guides
        </PillButton>
      </div>
    </div>
  );
}
