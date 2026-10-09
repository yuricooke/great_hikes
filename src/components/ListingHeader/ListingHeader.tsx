import type { ReactNode } from "react";

import Breadcrumb from "../Breadcrumb/Breadcrumb";
import Hero from "../Hero/Hero";
import styles from "./ListingHeader.module.css";

type Props = {
  image: string;
  title: string;
  description: string;
  /** Small caps line, e.g. "12 hikes". */
  meta?: string;
  breadcrumb: { label: string; href?: string }[];
  children?: ReactNode;
};

/** Photo hero for first-level pages: breadcrumb on top, title/description/meta over the photo (no glass). */
export default function ListingHeader({ image, title, description, meta, breadcrumb, children }: Props) {
  return (
    <Hero image={image} size="medium" breadcrumb={<Breadcrumb items={breadcrumb} />}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        {meta && <p className={styles.count}>{meta}</p>}
        {children}
      </div>
    </Hero>
  );
}

export function hikeCount(n: number) {
  return `${n} ${n === 1 ? "hike" : "hikes"}`;
}
