import Image from "next/image";
import type { ReactNode } from "react";

import styles from "./Hero.module.css";

type Props = {
  image: string;
  /** full = first screen (landing, hike); medium = listing and article headers */
  size?: "full" | "medium";
  priority?: boolean;
  /** light = lets more of the photo show (first-level pages); default = landing/article. */
  scrim?: "default" | "light";
  children: ReactNode;
  className?: string;
};

/**
 * Edge-to-edge photo hero that scrolls with the page (no fixed background), fading into the
 * black page. Content (glass panels) sits at the bottom.
 */
export default function Hero({ image, size = "full", priority = true, scrim = "default", children, className }: Props) {
  return (
    <section className={[styles.hero, styles[size], className].filter(Boolean).join(" ")}>
      <Image src={image} alt="" fill priority={priority} sizes="100vw" quality={70} className={styles.image} />
      <div className={`${styles.scrim} ${scrim === "light" ? styles.scrimLight : ""}`} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </section>
  );
}
