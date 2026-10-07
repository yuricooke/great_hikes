"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import Icon from "../Icon";
import styles from "./Rail.module.css";

type Props = {
  id: string;
  title: string;
  description?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  /** wide = landscape cards, about 3 visible on desktop (stories, shop). */
  size?: "default" | "wide";
  children: ReactNode[];
};

/** Horizontal, snap-scrolling row of cards with previous/next controls and a "See all" link. */
export default function Rail({
  id,
  title,
  description,
  seeAllHref,
  seeAllLabel = "See all",
  size = "default",
  children,
}: Props) {
  const scroller = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: smooth ? "smooth" : "auto" });
  };

  const headingId = `${id}-heading`;
  return (
    <section className={styles.rail} aria-labelledby={headingId}>
      <div className={styles.header}>
        <div>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <div className={styles.controls}>
          {(canPrev || canNext) && (
            <>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => scrollBy(-1)}
                disabled={!canPrev}
                aria-controls={`${id}-list`}
              >
                <Icon name="arrowBack" size={22} />
                <span className="visually-hidden">Previous {title}</span>
              </button>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => scrollBy(1)}
                disabled={!canNext}
                aria-controls={`${id}-list`}
              >
                <Icon name="chevronRight" size={22} />
                <span className="visually-hidden">Next {title}</span>
              </button>
            </>
          )}
          {seeAllHref && (
            <Link href={seeAllHref} className={styles.seeAll}>
              {seeAllLabel}
              <span className="visually-hidden">: {title}</span>
              <Icon name="chevronRight" size={20} />
            </Link>
          )}
        </div>
      </div>
      <ul id={`${id}-list`} ref={scroller} className={`${styles.list} ${size === "wide" ? styles.wide : ""}`}>
        {children.map((child, i) => (
          <li key={i} className={styles.item}>
            {child}
          </li>
        ))}
      </ul>
    </section>
  );
}
