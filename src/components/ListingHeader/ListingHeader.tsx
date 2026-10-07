import type { ReactNode } from "react";

import Breadcrumb from "../Breadcrumb/Breadcrumb";
import GlassPanel from "../GlassPanel/GlassPanel";
import styles from "./ListingHeader.module.css";

type Props = {
  title: string;
  description: string;
  count: number;
  breadcrumb: { label: string; href?: string }[];
  children?: ReactNode;
};

/** Glass header for first-level pages: breadcrumb, title, description and hike count. */
export default function ListingHeader({ title, description, count, breadcrumb, children }: Props) {
  return (
    <header className={styles.header}>
      <Breadcrumb items={breadcrumb} />
      <GlassPanel tone="light" className={styles.panel}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        <p className={styles.count}>
          {count} {count === 1 ? "hike" : "hikes"}
        </p>
        {children}
      </GlassPanel>
    </header>
  );
}
