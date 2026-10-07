import type { Metadata } from "next";

import ListingHeader from "@/components/ListingHeader/ListingHeader";
import PhotoCard from "@/components/PhotoCard/PhotoCard";
import { hikeBySlug } from "@/lib/hikes";
import { shopCategories, shopDisclosure } from "@/lib/shop";
import styles from "../section.module.css";
import grid from "../journal/journal.module.css";

export const metadata: Metadata = {
  title: "Shop",
  description: "Gear we trust on the trail, from partners we'd buy from ourselves.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  const categories = shopCategories();
  return (
    <>
      <ListingHeader
        image="/hikes/torres-del-paine-national-park.jpg"
        title="Shop"
        description="Gear we trust on the trail, from partners we'd buy from ourselves."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      >
        <p className={styles.muted}>{shopDisclosure()}</p>
      </ListingHeader>
      <section className={styles.section}>
        {categories.length > 0 ? (
          <ul className={grid.grid}>
            {categories.map((c) => (
              <li key={c.slug}>
                <PhotoCard
                  href={c.url}
                  external={c.url.startsWith("http")}
                  image={hikeBySlug(c.image)!.photo.src}
                  title={c.title}
                  subtitle={c.partner ? `${c.text} · at ${c.partner}` : c.text}
                  badge={c.status === "sample" ? "Sample" : c.partner || undefined}
                  aspect="landscape"
                  sizes="(min-width: 992px) 33vw, 100vw"
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>Our gear picks are coming soon.</p>
        )}
      </section>
    </>
  );
}
