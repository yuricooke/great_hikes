import type { Metadata } from "next";
import { Suspense } from "react";

import JournalBrowser, { JournalBrowserView } from "@/components/JournalBrowser/JournalBrowser";
import ListingHeader from "@/components/ListingHeader/ListingHeader";
import { hikeBySlug } from "@/lib/hikes";
import { articles, toArticleCard } from "@/lib/journal";
import styles from "../section.module.css";

export const metadata: Metadata = {
  title: "Journal",
  description: "Guides from Great Hikes and experiences from hikers in our community.",
  alternates: { canonical: "/journal" },
};

export default function JournalPage() {
  const all = articles();
  const cards = all.map(toArticleCard);
  const cover = all[0] ? hikeBySlug(all[0].cover)!.photo.src : "/hikes/machu-picchu.jpg";
  return (
    <>
      <ListingHeader
        image={cover}
        title="Journal"
        description="Guides from Great Hikes and experiences from hikers in our community."
        meta={`${cards.length} ${cards.length === 1 ? "article" : "articles"}`}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Journal" }]}
      />
      <section className={styles.section}>
        {cards.length === 0 ? (
          <p className={styles.muted}>Stories are coming soon.</p>
        ) : (
          <Suspense fallback={<JournalBrowserView articles={cards} query="" />}>
            <JournalBrowser articles={cards} />
          </Suspense>
        )}
      </section>
    </>
  );
}
