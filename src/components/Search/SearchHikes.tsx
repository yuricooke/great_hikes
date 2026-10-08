"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo } from "react";

import { matchesFilters, sortHikes, type HikeCardData, type HikeFilters, type HikeSort } from "@/lib/hike-utils";
import { CONTINENTS, type Hike } from "@/lib/schema";
import FilterBar from "../FilterBar/FilterBar";
import HikeGrid from "../HikeGrid/HikeGrid";
import Icon from "../Icon";
import styles from "./SearchHikes.module.css";

type Props = {
  hikes: HikeCardData[];
  /** Accessible name of the search box (e.g. "Search hikes and guides" on /search). */
  searchLabel?: string;
};

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Filters live in the URL (?q=&continent=&landscape=) so results are shareable. */
export function filterHikes<T extends Pick<Hike, "title" | "country" | "continent" | "landscapes" | "biome" | "description">>(
  hikes: T[],
  q: string,
  continent: string | null,
  landscape: string | null,
): T[] {
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  const continentName = CONTINENTS.find((c) => c.key === continent)?.name;
  return hikes.filter((h) => {
    if (continentName && h.continent !== continentName) return false;
    if (landscape && !h.landscapes.includes(landscape as Hike["landscapes"][number])) return false;
    const text = normalize(`${h.title} ${h.country} ${h.continent} ${h.biome} ${h.description}`);
    return terms.every((t) => text.includes(t));
  });
}

/** Reads the filters from the URL (needs a Suspense boundary); the view renders them. */
export default function SearchHikes(props: Props) {
  const params = useSearchParams();
  return <SearchHikesView {...props} query={params.toString()} />;
}

/**
 * Pure view: also used as the Suspense fallback with an empty query, so the server sends the full,
 * unfiltered list (no layout shift, crawlable) before the URL filters apply in the browser.
 */
export function SearchHikesView({ hikes, query, searchLabel = "Search hikes" }: Props & { query: string }) {
  const params = useMemo(() => new URLSearchParams(query), [query]);
  const router = useRouter();
  const pathname = usePathname();
  const inputId = useId();
  const q = params.get("q") ?? "";
  const continent = params.get("continent");
  const landscape = params.get("landscape");
  const filters: HikeFilters = { landscape, continent, difficulty: params.get("difficulty"), month: params.get("month") };
  const sort: HikeSort = params.get("sort") === "az" ? "az" : "latest";
  const results = useMemo(
    () => sortHikes(filterHikes(hikes, q, null, null).filter((h) => matchesFilters(h, filters)), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filters derive from `query`
    [hikes, q, query, sort],
  );

  const hrefWith = (key: string, value: string | null, base: string = params.toString(), exact = false) => {
    const next = new URLSearchParams(base);
    if (value === null || (!exact && next.get(key) === value)) next.delete(key);
    else next.set(key, value);
    const s = next.toString();
    return s ? `${pathname}?${s}` : pathname;
  };
  /** Recompute from the live URL at click time, so a tap before hydration never drops a filter. */
  const go = (key: string, value: string | null) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    router.replace(hrefWith(key, value, window.location.search.slice(1)), { scroll: false });
  };

  return (
    <div className={styles.search}>
      <form role="search" className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <label htmlFor={inputId} className="visually-hidden">
          {searchLabel}
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

      <FilterBar
        value={filters}
        onChange={(key, value) => router.replace(hrefWith(key, value, window.location.search.slice(1), true), { scroll: false })}
      />

      <div className={styles.summary}>
        <p aria-live="polite">
          {results.length} {results.length === 1 ? "hike" : "hikes"}
        </p>
        <nav aria-label="Sort hikes" className={styles.sort}>
          <Link href={hrefWith("sort", null)} onClick={go("sort", null)} scroll={false} className={styles.sortLink} aria-current={sort === "latest" ? "true" : undefined}>
            Latest added
          </Link>
          <Link href={hrefWith("sort", "az")} onClick={go("sort", "az")} scroll={false} className={styles.sortLink} aria-current={sort === "az" ? "true" : undefined}>
            A–Z
          </Link>
        </nav>
        {/* Filters have their own "Clear all" in the filter bar; this resets search text and sort too. */}
        {(q || sort !== "latest") && (
          <Link href={pathname} className={styles.clear}>
            Reset
          </Link>
        )}
      </div>

      {results.length > 0 ? (
        <HikeGrid hikes={results} hideLandscape={(landscape ?? undefined) as Hike["landscapes"][number] | undefined} />
      ) : (
        <p className={styles.none}>No hikes match these filters yet. Try another landscape or continent.</p>
      )}
    </div>
  );
}
