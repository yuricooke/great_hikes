"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Photo } from "@/lib/schema";
import Icon from "../Icon";
import PhotoCredit from "../PhotoCredit/PhotoCredit";
import styles from "./HikeGallery.module.css";

export type Slide = { photo: Photo; caption?: string; width?: number; height?: number };

/** Swipeable photo slider (scroll-snap) with prev/next buttons, counter and a credit on every photo. */
export default function HikeGallery({ slides, label }: { slides: Slide[]; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  useEffect(() => {
    const el = track.current;
    el?.addEventListener("scroll", onScroll, { passive: true });
    return () => el?.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  function go(to: number) {
    const el = track.current;
    if (!el) return;
    const i = Math.max(0, Math.min(slides.length - 1, to));
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  }

  if (slides.length === 0) return null;

  return (
    <div className={styles.gallery} role="region" aria-roledescription="carousel" aria-label={label}>
      <ul ref={track} className={styles.track} tabIndex={0} aria-label={`${label}: ${slides.length} photos`}>
        {slides.map((s, i) => (
          <li
            key={s.photo.src}
            className={styles.slide}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
          >
            <figure className={styles.figure}>
              <div className={styles.frame}>
                <Image
                  src={s.photo.src}
                  alt={s.photo.alt}
                  fill
                  sizes="(min-width: 992px) 60vw, 100vw"
                  className={styles.image}
                  priority={i === 0}
                />
              </div>
              <figcaption className={styles.caption}>
                {s.caption && <span className={styles.label}>{s.caption}</span>}
                <PhotoCredit photo={s.photo} className={styles.credit} />
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      {slides.length > 1 && (
        <div className={styles.controls}>
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous photo">
            <Icon name="chevronLeft" size={22} />
          </button>
          <span className={styles.count} aria-live="polite">
            {index + 1} / {slides.length}
          </span>
          <button type="button" onClick={() => go(index + 1)} disabled={index >= slides.length - 1} aria-label="Next photo">
            <Icon name="chevronRight" size={22} />
          </button>
        </div>
      )}
    </div>
  );
}
