import type { Metadata } from "next";

import HikeGrid from "@/components/HikeGrid/HikeGrid";
import ListingHeader, { hikeCount } from "@/components/ListingHeader/ListingHeader";
import PillButton from "@/components/PillButton/PillButton";
import { allHikes } from "@/lib/hikes";
import styles from "../section.module.css";

const DESCRIPTION = "Every hike on Great Hikes — from Patagonia to the Himalayas.";

export const metadata: Metadata = {
  title: "All hikes",
  description: DESCRIPTION,
  alternates: { canonical: "/hikes" },
  openGraph: { images: [{ url: allHikes()[0].photo.src }] },
};

export default function AllHikesPage() {
  const hikes = allHikes();
  return (
    <>
      <ListingHeader
        image={hikes[0].photo.src}
        title="All hikes"
        description={DESCRIPTION}
        meta={hikeCount(hikes.length)}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "All hikes" }]}
      >
        <div className={styles.actions}>
          <PillButton href="/search" icon="search">
            Search & filter
          </PillButton>
        </div>
      </ListingHeader>
      <section className={styles.section}>
        <HikeGrid hikes={hikes} />
      </section>
    </>
  );
}
