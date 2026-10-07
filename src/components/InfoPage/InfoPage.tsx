import type { ReactNode } from "react";

import GlassPanel from "../GlassPanel/GlassPanel";
import ListingHeader from "../ListingHeader/ListingHeader";
import styles from "./InfoPage.module.css";

type Props = {
  title: string;
  description: string;
  image: string;
  /** YYYY-MM-DD shown as "Last updated". */
  updated?: string;
  children: ReactNode;
};

/** About, contact and policy pages: photo header, then readable prose on a glass panel. */
export default function InfoPage({ title, description, image, updated, children }: Props) {
  const date = updated
    ? new Date(`${updated}T12:00:00Z`).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" })
    : null;
  return (
    <>
      <ListingHeader
        image={image}
        title={title}
        description={description}
        meta={date ? `Last updated ${date}` : undefined}
        breadcrumb={[{ label: "Home", href: "/" }, { label: title }]}
      />
      <GlassPanel tone="strong" className={styles.panel}>
        <div className={styles.prose}>{children}</div>
      </GlassPanel>
    </>
  );
}
