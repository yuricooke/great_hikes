"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo } from "react";

import type { CategoryKey, Product } from "@/lib/products";
import Icon from "../Icon";
import ProductCard, { CATEGORY_ICON } from "./ProductCard";
import styles from "./ShopBrowser.module.css";

type Props = {
  products: Product[];
  categories: { key: CategoryKey; label: string }[];
};

const SORTS = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;
type Sort = keyof typeof SORTS;

export function sortProducts(list: Product[], sort: Sort) {
  const copy = [...list];
  if (sort === "price-asc") return copy.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return copy.sort((a, b) => b.price - a.price);
  return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
}

/** Category navigation, sorting and the product grid; state lives in the URL. */
/** Reads the filters from the URL (needs a Suspense boundary); the view renders them. */
export default function ShopBrowser(props: Props) {
  const params = useSearchParams();
  return <ShopBrowserView {...props} query={params.toString()} />;
}

/**
 * Pure view: also used as the Suspense fallback with an empty query, so the server sends the full,
 * unfiltered list (no layout shift, crawlable) before the URL filters apply in the browser.
 */
export function ShopBrowserView({ products, categories, query }: Props & { query: string }) {
  const params = useMemo(() => new URLSearchParams(query), [query]);
  const router = useRouter();
  const pathname = usePathname();
  const sortId = useId();
  const category = params.get("category");
  const sort = (params.get("sort") as Sort) in SORTS ? (params.get("sort") as Sort) : "featured";

  const visible = useMemo(
    () => sortProducts(category ? products.filter((p) => p.category === category) : products, sort),
    [products, category, sort],
  );

  const href = (key: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (key) next.set("category", key);
    else next.delete("category");
    const q = next.toString();
    return q ? `${pathname}?${q}` : pathname;
  };

  const active = categories.find((c) => c.key === category);

  return (
    <div className={styles.shop}>
      <nav aria-label="Shop categories">
        <ul className={styles.categories}>
          <li>
            <Link href={href(null)} scroll={false} className={styles.category} aria-current={!category ? "true" : undefined}>
              <Icon name="tag" size={26} />
              <span>All gear</span>
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.key}>
              <Link href={href(c.key)} scroll={false} className={styles.category} aria-current={category === c.key ? "true" : undefined}>
                <Icon name={CATEGORY_ICON[c.key]} size={26} />
                <span>{c.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.toolbar}>
        <h2 className={styles.heading}>
          {active ? active.label : "All gear"} <span className={styles.count}>· {visible.length}</span>
        </h2>
        <label htmlFor={sortId} className={styles.sortLabel}>
          <Icon name="filter" size={20} />
          Sort
        </label>
        <select
          id={sortId}
          className={styles.sort}
          value={sort}
          onChange={(e) => {
            const next = new URLSearchParams(params.toString());
            if (e.target.value === "featured") next.delete("sort");
            else next.set("sort", e.target.value);
            router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
          }}
        >
          {Object.entries(SORTS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {visible.length > 0 ? (
        <ul className={styles.grid} aria-label="Products">
          {visible.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No products in this category yet.</p>
      )}
    </div>
  );
}
