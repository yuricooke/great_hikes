import type { Metadata } from "next";
import { Suspense } from "react";

import ListingHeader, { hikeCount } from "@/components/ListingHeader/ListingHeader";
import SearchHikes, { SearchHikesView } from "@/components/Search/SearchHikes";
import { allHikes, toHikeCard } from "@/lib/hikes";
import styles from "../section.module.css";

const DESCRIPTION = "Every hike on Great Hikes — from Patagonia to the Himalayas. Search, filter by landscape or continent, newest first.";

export const metadata: Metadata = {
  title: "All hikes",
  description: DESCRIPTION,
  alternates: { canonical: "/hikes" },
  openGraph: { images: [{ url: allHikes()[0].photo.src }] },
};

/** All hikes with the search/filter/sort controls in place (state in the URL, shareable). */
export default function AllHikesPage() {
  const hikes = allHikes();
  const cards = hikes.map(toHikeCard);
  return (
    <>
      <ListingHeader
        image={hikes[0].photo.src}
        title="All hikes"
        description="Every hike on Great Hikes — from Patagonia to the Himalayas."
        meta={hikeCount(hikes.length)}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "All hikes" }]}
      />
      <section className={styles.section}>
        <Suspense fallback={<SearchHikesView hikes={cards} query="" />}>
          <SearchHikes hikes={cards} />
        </Suspense>
      </section>
    </>
  );
}
