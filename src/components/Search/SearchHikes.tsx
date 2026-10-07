"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo } from "react";

import { CONTINENTS, LANDSCAPES, type Hike } from "@/lib/schema";
import HikeGrid from "../HikeGrid/HikeGrid";
import Icon from "../Icon";
import styles from "./SearchHikes.module.css";

type Props = { hikes: Hike[] };

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Filters live in the URL (?q=&continent=&landscape=) so results are shareable. */
export function filterHikes(hikes: Hike[], q: string, continent: string | null, landscape: string | null) {
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  const continentName = CONTINENTS.find((c) => c.key === continent)?.name;
  return hikes.filter((h) => {
    if (continentName && h.continent !== continentName) return false;
    if (landscape && !h.landscapes.includes(landscape as Hike["landscapes"][number])) return false;
    const text = normalize(`${h.title} ${h.country} ${h.continent} ${h.biome} ${h.description}`);
    return terms.every((t) => text.includes(t));
  });
}

export default function SearchHikes({ hikes }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const inputId = useId();
  const q = params.get("q") ?? "";
  const continent = params.get("continent");
  const landscape = params.get("landscape");
  const results = useMemo(() => filterHikes(hikes, q, continent, landscape), [hikes, q, continent, landscape]);

  const hrefWith = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value === null || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    const s = next.toString();
    return s ? `${pathname}?${s}` : pathname;
  };

  return (
    <div className={styles.search}>
      <form role="search" className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <label htmlFor={inputId} className="visually-hidden">
          Search hikes
        </label>
        <Icon name="search" size={22} className={styles.icon} />
        <input
          id={inputId}
          type="search"
          className={styles.input}
          placeholder="Search by name, country or landscape"
          defaultValue={q}
          onChange={(e) => {
            const next = new URLSearchParams(params.toString());
            if (e.target.value) next.set("q", e.target.value);
            else next.delete("q");
            router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
          }}
        />
      </form>

      <nav aria-label="Filter by continent" className={styles.group}>
        <p className={styles.groupLabel}>Continent</p>
        <ul className={styles.chips}>
          {CONTINENTS.map((c) => (
            <li key={c.key}>
              <Link href={hrefWith("continent", c.key)} scroll={false} className={styles.chip} aria-current={continent === c.key ? "true" : undefined}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Filter by landscape" className={styles.group}>
        <p className={styles.groupLabel}>Landscape</p>
        <ul className={styles.chips}>
          {LANDSCAPES.map((l) => (
            <li key={l.key}>
              <Link href={hrefWith("landscape", l.key)} scroll={false} className={styles.chip} aria-current={landscape === l.key ? "true" : undefined}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.summary}>
        <p aria-live="polite">
          {results.length} {results.length === 1 ? "hike" : "hikes"}
        </p>
        {(q || continent || landscape) && (
          <Link href={pathname} className={styles.clear}>
            Clear filters
          </Link>
        )}
      </div>

      {results.length > 0 ? (
        <HikeGrid hikes={results} />
      ) : (
        <p className={styles.none}>No hikes match these filters yet. Try another landscape or continent.</p>
      )}
    </div>
  );
}
