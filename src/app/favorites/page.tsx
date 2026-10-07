import type { Metadata } from "next";

import FavoritesList from "@/components/Favorites/FavoritesList";
import ListingHeader from "@/components/ListingHeader/ListingHeader";
import { allHikes } from "@/lib/hikes";
import styles from "../section.module.css";

export const metadata: Metadata = {
  title: "My favorites",
  robots: { index: false },
};

export default function FavoritesPage() {
  return (
    <>
      <ListingHeader
        image="/hikes/fiordland-national-park.jpg"
        title="My favorites"
        description="The hikes you've saved for your next adventure."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Favorites" }]}
      />
      <section className={styles.section}>
        <FavoritesList hikes={allHikes()} />
      </section>
    </>
  );
}
