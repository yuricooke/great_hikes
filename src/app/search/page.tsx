import type { Metadata } from "next";
import { Suspense } from "react";

import ListingHeader from "@/components/ListingHeader/ListingHeader";
import SearchHikes from "@/components/Search/SearchHikes";
import { allHikes } from "@/lib/hikes";
import styles from "../section.module.css";

export const metadata: Metadata = {
  title: "Search hikes",
  description: "Find hikes by continent, landscape, country or name.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  const hikes = allHikes();
  return (
    <>
      <ListingHeader
        image="/hikes/los-glaciares-national-park.jpg"
        title="Explore hikes"
        description="Filter by continent and landscape, or search by name and country."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />
      <section className={styles.section}>
        <Suspense>
          <SearchHikes hikes={hikes} />
        </Suspense>
      </section>
    </>
  );
}
