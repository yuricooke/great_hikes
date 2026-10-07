import Image from "next/image";
import Link from "next/link";

import { hikeBySlug, hikePath } from "@/lib/hikes";
import type { ArticleBlock } from "@/lib/journal";
import PhotoCredit from "../PhotoCredit/PhotoCredit";
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
          case "gallery":
            return (
              <figure key={i} className={styles.gallery}>
                <ul className={styles.galleryList}>
                  {block.slugs.map((s) => {
                    const hike = hikeBySlug(s)!;
                    return (
                      <li key={s} className={styles.galleryItem}>
                        <div className={styles.galleryImage}>
                          <Image src={hike.photo.src} alt={hike.photo.alt} fill sizes="(min-width: 768px) 420px, 80vw" quality={65} />
                        </div>
                        <PhotoCredit photo={hike.photo} />
                      </li>
                    );
                  })}
                </ul>
              </figure>
            );
        }
      })}
    </div>
  );
}
