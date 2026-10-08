import Image from "next/image";
import Link from "next/link";

import { hikeBySlug, hikePath } from "@/lib/hikes";
import type { ArticleBlock } from "@/lib/journal";
import HikeGallery from "../HikeGallery/HikeGallery";
import styles from "./ArticleBody.module.css";

/** Renders journal blocks: text, headings, quotes, inline hike link-cards and photo galleries. */
export default function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
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
            const hike = hikeBySlug(block.slug)!;
            return (
              <aside key={i} className={styles.linkCard} aria-label={`Hike: ${hike.title}`}>
                <div className={styles.linkImage}>
                  <Image src={hike.photo.src} alt="" fill sizes="(min-width: 768px) 220px, 100vw" quality={60} />
                </div>
                <div className={styles.linkContent}>
                  <p className={styles.linkEyebrow}>
                    {hike.country} · {hike.continent}
                  </p>
                  <h3 className={styles.linkTitle}>{hike.title}</h3>
                  <p>{block.text}</p>
                  <Link href={hikePath(hike)} className={styles.linkCta}>
                    Read more<span className="visually-hidden"> about {hike.title}</span>
                  </Link>
                </div>
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
