"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { Photo } from "@/lib/schema";
import Icon from "../Icon";
import PhotoCredit from "../PhotoCredit/PhotoCredit";
import styles from "./Lightbox.module.css";

export type LightboxItem = { photo: Photo; caption?: string };

/** Full-screen photo pop-up (native <dialog>): arrows/swipe buttons, Esc closes, credit always shown. */
export default function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onIndex(Math.min(items.length - 1, index! + 1));
      if (e.key === "ArrowLeft") onIndex(Math.max(0, index! - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, items.length, onIndex]);

  const item = open ? items[index] : null;

  return (
    <dialog
      data-surface="photo"
      ref={ref}
      className={styles.dialog}
      aria-label="Photo viewer"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {item && (
        <figure className={styles.figure}>
          <div className={styles.frame}>
            <Image src={item.photo.src} alt={item.photo.alt} fill sizes="100vw" className={styles.image} quality={80} />
          </div>
          <figcaption className={styles.caption}>
            {item.caption && <strong>{item.caption}</strong>}
            <span className={styles.alt}>{item.photo.alt}</span>
            <PhotoCredit photo={item.photo} className={styles.credit} />
            <span className={styles.count}>
              {index! + 1} / {items.length}
            </span>
          </figcaption>
        </figure>
      )}
      <button type="button" className={`${styles.btn} ${styles.close}`} onClick={onClose} aria-label="Close photo">
        <Icon name="close" size={24} />
      </button>
      {open && index! > 0 && (
        <button type="button" className={`${styles.btn} ${styles.prev}`} onClick={() => onIndex(index! - 1)} aria-label="Previous photo">
          <Icon name="chevronLeft" size={28} />
        </button>
      )}
      {open && index! < items.length - 1 && (
        <button type="button" className={`${styles.btn} ${styles.next}`} onClick={() => onIndex(index! + 1)} aria-label="Next photo">
          <Icon name="chevronRight" size={28} />
        </button>
      )}
    </dialog>
  );
}
