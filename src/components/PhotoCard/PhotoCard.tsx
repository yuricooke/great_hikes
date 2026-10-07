import Image from "next/image";
import Link from "next/link";

import styles from "./PhotoCard.module.css";

type Props = {
  href: string;
  image: string;
  title: string;
  /** Second line, e.g. "Chile · South America" or "6 hikes". */
  subtitle?: string;
  /** Small pill on the photo, e.g. "#1" or "Mountains". */
  badge?: string;
  /** Size hint for responsive images. */
  sizes?: string;
  priority?: boolean;
};

/** Portrait photo card with a glass caption — used in rails and grids. The whole card is one link. */
export default function PhotoCard({
  href,
  image,
  title,
  subtitle,
  badge,
  sizes = "(min-width: 992px) 280px, 70vw",
  priority = false,
}: Props) {
  return (
    <Link href={href} className={styles.card}>
      <Image src={image} alt="" fill sizes={sizes} quality={60} priority={priority} className={styles.image} />
      {badge && <span className={styles.badge}>{badge}</span>}
      <span className={styles.caption}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
    </Link>
  );
}
