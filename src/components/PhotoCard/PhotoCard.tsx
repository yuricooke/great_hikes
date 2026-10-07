import Image from "next/image";
import Link from "next/link";

import FavoriteButton from "../Auth/FavoriteButton";
import styles from "./PhotoCard.module.css";

type Props = {
  href: string;
  image: string;
  title: string;
  /** Second line, e.g. "Chile · South America" or "6 hikes". */
  subtitle?: string;
  /** Small pill on the photo, e.g. "#1" or "Mountains". */
  badge?: string;
  /** Show a favorite heart for this hike slug. */
  favoriteSlug?: string;
  /** Opens an external page (Instagram, partner shop) in a new tab. */
  external?: boolean;
  /** Size hint for responsive images. */
  sizes?: string;
  priority?: boolean;
  /** Images from other hosts (Instagram via Behold) skip Next's optimizer. */
  unoptimized?: boolean;
  aspect?: "portrait" | "landscape";
};

/** Photo card with a glass caption — used in rails and grids. The card is one link; the heart sits beside it. */
export default function PhotoCard({
  href,
  image,
  title,
  subtitle,
  badge,
  favoriteSlug,
  external = false,
  sizes = "(min-width: 992px) 280px, 70vw",
  priority = false,
  unoptimized = false,
  aspect = "portrait",
}: Props) {
  const content = (
    <>
      <Image
        src={image}
        alt=""
        fill
        sizes={sizes}
        quality={60}
        priority={priority}
        unoptimized={unoptimized}
        className={styles.image}
      />
      {badge && <span className={styles.badge}>{badge}</span>}
      <span className={styles.caption}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
    </>
  );
  return (
    <div className={`${styles.wrap} ${styles[aspect]}`}>
      {external ? (
        <a href={href} className={styles.card} target="_blank" rel="noopener noreferrer">
          {content}
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      ) : (
        <Link href={href} className={styles.card}>
          {content}
        </Link>
      )}
      {favoriteSlug && <FavoriteButton slug={favoriteSlug} title={title} />}
    </div>
  );
}
