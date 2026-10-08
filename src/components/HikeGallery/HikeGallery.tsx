"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import type { Photo } from "@/lib/schema";
import Icon from "../Icon";
import Lightbox from "../Lightbox/Lightbox";
import PhotoCredit from "../PhotoCredit/PhotoCredit";
import styles from "./HikeGallery.module.css";

export type Slide = { photo: Photo; caption?: string };

/**
 * Photo cards in a scroll-snap row — 3 + a peek of the next on desktop, 2 + peek on tablets,
 * 1 + peek on phones. Tap a photo to open it full screen. Every photo shows its credit.
 */
export default function HikeGallery({ slides, label, bleed = false }: { slides: Slide[]; label: string; bleed?: boolean }) {
  const track = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);

  function scroll(dir: 1 | -1) {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 12 : el.clientWidth * 0.8;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * step, behavior: smooth ? "smooth" : "auto" });
  }

  if (slides.length === 0) return null;

  return (
    <div className={`${styles.gallery} ${bleed ? styles.bleed : ""}`} role="region" aria-label={label}>
      <ul ref={track} className={styles.track} aria-label={`${label}: ${slides.length} photos`}>
        {slides.map((s, i) => (
          <li key={s.photo.src} className={styles.card}>
            <button type="button" className={styles.open} onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1} of ${slides.length}: ${s.photo.alt}`}>
              <Image
                src={s.photo.src}
                alt=""
                fill
                sizes="(min-width: 992px) 22vw, (min-width: 640px) 42vw, 80vw"
                className={styles.image}
                quality={65}
              />
            </button>
            <div className={styles.meta}>
              {s.caption && <span className={styles.label}>{s.caption}</span>}
              <PhotoCredit photo={s.photo} className={styles.credit} />
            </div>
          </li>
        ))}
      </ul>
      {slides.length > 1 && (
        <div className={styles.controls}>
          <button type="button" onClick={() => scroll(-1)} aria-label="Scroll photos left">
            <Icon name="chevronLeft" size={22} />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Scroll photos right">
            <Icon name="chevronRight" size={22} />
          </button>
          <span className={styles.count}>{slides.length} photos · tap to enlarge</span>
        </div>
      )}
      <Lightbox items={slides} index={open} onIndex={setOpen} onClose={close} />
    </div>
  );
}
