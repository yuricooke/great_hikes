import Link from "next/link";

import type { ReactNode } from "react";

import { hikeBySlug, hikePath } from "@/lib/hikes";
import type { ArticleBlock } from "@/lib/journal";
import HikeGallery from "../HikeGallery/HikeGallery";
import styles from "./ArticleBody.module.css";

/** Renders journal blocks: text, headings, quotes, inline hike link-cards and photo galleries. */
export default function ArticleBody({
  blocks,
  inlinePromo,
}: {
  blocks: ArticleBlock[];
  /**
   * Shown where the first inline hike card used to be (owner 2026-10-08: hike cards mid-article took
   * readers away and repeated "Hikes in this story" at the end) — a relevant ad or gear picks.
   */
  inlinePromo?: ReactNode;
}) {
  const promoAt = blocks.findIndex((b) => b.type === "hikeCard");
  return (
    <div className={styles.body}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={i} className={styles.paragraph}>
                {block.text}
              </p>
            );
          case "heading":
            return (
              <h2 key={i} className={styles.heading}>
                {block.text}
              </h2>
            );
          case "quote":
            return (
              <blockquote key={i} className={styles.quote}>
                <p>“{block.text}”</p>
                {block.cite && <cite>— {block.cite}</cite>}
              </blockquote>
            );
          case "hikeCard": {
            // Hikes are listed once, at the end of the article; here we show one promo instead.
            if (i !== promoAt || !inlinePromo) return null;
            return (
              <aside key={i} className={styles.promo} aria-label="Gear for this hike">
                {inlinePromo}
              </aside>
            );
          }
          case "gallery": {
            // Several hikes side by side — each card opens full screen, captioned with the hike.
            const hikes = block.slugs.map((s) => hikeBySlug(s)!);
            return (
              <div key={i} className={styles.slider}>
                <HikeGallery bleed label="Photos of the hikes in this story" slides={hikes.map((h) => ({ photo: h.photo, caption: h.title }))} />
              </div>
            );
          }
          case "photos": {
            const hike = hikeBySlug(block.hike)!;
            return (
              <div key={i} className={styles.slider}>
                {block.text && <p className={styles.sliderTitle}>{block.text}</p>}
                <HikeGallery
                  bleed
                  label={`${hike.title} photos`}
                  slides={[{ photo: hike.photo }, ...hike.gallery.map((photo) => ({ photo }))]}
                />
                <Link href={hikePath(hike)} className={styles.linkCta}>
                  Plan {hike.title}
                </Link>
              </div>
            );
          }
        }
      })}
    </div>
  );
}
