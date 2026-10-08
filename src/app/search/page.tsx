import type { Metadata } from "next";
import { Suspense } from "react";

import AdBanner from "@/components/AdBanner/AdBanner";
import JournalBrowser from "@/components/JournalBrowser/JournalBrowser";
import ListingHeader from "@/components/ListingHeader/ListingHeader";
import SearchHikes, { SearchHikesView } from "@/components/Search/SearchHikes";
import { pickAd } from "@/lib/ads";
import { allHikes, toHikeCard } from "@/lib/hikes";
import { articles, toArticleCard } from "@/lib/journal";
import styles from "../section.module.css";

export const metadata: Metadata = {
  title: "Search",
  description: "Search hikes and journal guides by name, country, continent or landscape.",
  alternates: { canonical: "/search" },
};

/** One search box for hikes and journal articles: hikes keep their filters; matching guides follow. */
export default function SearchPage() {
  const hikes = allHikes().map(toHikeCard);
  const cards = articles().map(toArticleCard);
  return (
    <>
      <ListingHeader
        image="/hikes/los-glaciares-national-park.jpg"
        title="Search"
        description="Search hikes and journal guides — by name, country, continent or landscape."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />
      <section className={styles.section} aria-labelledby="search-hikes">
        <h2 id="search-hikes" className={styles.sectionTitle}>
          Hikes
        </h2>
        <Suspense fallback={<SearchHikesView hikes={hikes} query="" searchLabel="Search hikes and guides" />}>
          <SearchHikes hikes={hikes} searchLabel="Search hikes and guides" />
        </Suspense>
      </section>
      <section className={styles.section} aria-label="Matching journal articles">
        {/* Shown once there's a search term; uses the same ?q= as the hikes search box. */}
        <Suspense fallback={null}>
          <JournalBrowser articles={cards} searchOnly limit={9} />
        </Suspense>
      </section>
      <section className={styles.section}>
        <AdBanner ad={pickAd("search")} />
      </section>
    </>
  );
}
