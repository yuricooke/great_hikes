"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo } from "react";

import type { ArticleCardData } from "@/lib/journal";
import { CONTINENTS, LANDSCAPES } from "@/lib/schema";
import Icon from "../Icon";
import PhotoCard from "../PhotoCard/PhotoCard";
import styles from "../Search/SearchHikes.module.css";
import grid from "./JournalBrowser.module.css";

type Props = {
  articles: ArticleCardData[];
  /** Search page: only the shared `q` (no filters, no own search box), at most `limit` results. */
  searchOnly?: boolean;
  limit?: number;
};

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function filterArticles(list: ArticleCardData[], q: string, kind: string | null, continent: string | null, landscape: string | null) {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  const continentName = CONTINENTS.find((c) => c.key === continent)?.name;
  return list.filter((a) => {
    if (kind && a.kind !== kind) return false;
    if (continentName && !a.continents.includes(continentName)) return false;
    if (landscape && !a.landscapes.includes(landscape)) return false;
    const text = norm(`${a.title} ${a.lead} ${a.places}`);
    return terms.every((t) => text.includes(t));
  });
}

/** Reads filters from the URL (inside Suspense); the view renders them. */
export default function JournalBrowser(props: Props) {
  const params = useSearchParams();
  return <JournalBrowserView {...props} query={params.toString()} />;
}

/** Pure view — also the Suspense fallback (empty query → full list, crawlable, no layout shift). */
export function JournalBrowserView({ articles, query, searchOnly = false, limit }: Props & { query: string }) {
  const params = useMemo(() => new URLSearchParams(query), [query]);
  const router = useRouter();
  const pathname = usePathname();
  const inputId = useId();
  const q = params.get("q") ?? "";
  const kind = searchOnly ? null : params.get("kind");
  const continent = searchOnly ? null : params.get("continent");
  const landscape = searchOnly ? null : params.get("landscape");
  const sort = params.get("sort") === "az" ? "az" : "latest";

  const results = useMemo(() => {
    const list = filterArticles(articles, q, kind, continent, landscape);
    list.sort((a, b) => (sort === "az" ? a.title.localeCompare(b.title) : b.date.localeCompare(a.date)));
    return limit ? list.slice(0, limit) : list;
  }, [articles, q, kind, continent, landscape, sort, limit]);

  const hrefWith = (key: string, value: string | null, base: string = params.toString()) => {
    const next = new URLSearchParams(base);
    if (value === null || next.get(key) === value) next.delete(key);
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
  const chip = (key: string, value: string, label: string, active: boolean) => (
    <li key={value}>
      <Link href={hrefWith(key, value)} onClick={go(key, value)} scroll={false} className={styles.chip} aria-current={active ? "true" : undefined}>
        {label}
      </Link>
    </li>
  );

  if (searchOnly && !q) return null;

  return (
    <div className={styles.search}>
      {!searchOnly && (
        <>
          <form role="search" className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <label htmlFor={inputId} className="visually-hidden">
              Search the journal
            </label>
            <Icon name="search" size={22} className={styles.icon} />
            <input
              id={inputId}
              type="search"
              className={styles.input}
              placeholder="Search guides and stories"
              defaultValue={q}
              onChange={(e) => {
                const next = new URLSearchParams(params.toString());
                if (e.target.value) next.set("q", e.target.value);
                else next.delete("q");
                router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
              }}
            />
          </form>
          <nav aria-label="Filter by type" className={styles.group}>
            <p className={styles.groupLabel}>Type</p>
            <ul className={styles.chips}>
              {chip("kind", "guide", "Guides", kind === "guide")}
              {chip("kind", "experience", "Hikers' experiences", kind === "experience")}
            </ul>
          </nav>
          <nav aria-label="Filter by continent" className={styles.group}>
            <p className={styles.groupLabel}>Continent</p>
            <ul className={styles.chips}>{CONTINENTS.map((c) => chip("continent", c.key, c.name, continent === c.key))}</ul>
          </nav>
          <nav aria-label="Filter by landscape" className={styles.group}>
            <p className={styles.groupLabel}>Landscape</p>
            <ul className={styles.chips}>{LANDSCAPES.map((l) => chip("landscape", l.key, l.label, landscape === l.key))}</ul>
          </nav>
        </>
      )}

      <div className={styles.summary}>
        <p aria-live="polite">
          {results.length} {results.length === 1 ? "article" : "articles"}
          {searchOnly && q ? ` for “${q}”` : ""}
        </p>
        {!searchOnly && (
          <nav aria-label="Sort articles" className={styles.sort}>
            <Link href={hrefWith("sort", null)} onClick={go("sort", null)} scroll={false} className={styles.sortLink} aria-current={sort === "latest" ? "true" : undefined}>
              Latest
            </Link>
            <Link href={hrefWith("sort", "az")} onClick={go("sort", "az")} scroll={false} className={styles.sortLink} aria-current={sort === "az" ? "true" : undefined}>
              A–Z
            </Link>
          </nav>
        )}
        {!searchOnly && (q || kind || continent || landscape || sort !== "latest") && (
          <Link href={pathname} className={styles.clear}>
            Clear filters
          </Link>
        )}
      </div>

      {results.length > 0 ? (
        <ul className={grid.grid} aria-label="Articles">
          {results.map((a) => (
            <li key={a.slug}>
              <PhotoCard
                href={a.href}
                image={a.image}
                title={a.title}
                subtitle={`${a.kind === "guide" ? "Guide" : "Hiker's experience"} · ${a.readMinutes} min read`}
                badge={a.status === "sample" ? "Sample" : a.status === "draft" ? "Draft" : undefined}
                aspect="landscape"
                sizes="(min-width: 992px) 33vw, 100vw"
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.none}>No articles match yet — try another filter.</p>
      )}
    </div>
  );
}
