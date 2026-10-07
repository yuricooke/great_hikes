import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import AdBanner from "@/components/AdBanner/AdBanner";
import ListingHeader from "@/components/ListingHeader/ListingHeader";
import ShopBrowser from "@/components/Shop/ShopBrowser";
import { pickAd } from "@/lib/ads";
import { pricesUpdated, products, shopCategories, shopDisclosure } from "@/lib/products";
import styles from "../section.module.css";
import shop from "./shop.module.css";

export const metadata: Metadata = {
  title: "Shop",
  description: "Hiking and outdoor gear we trust — t-shirts, socks, jackets, backpacks, tents and climbing gear.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  const list = products();
  return (
    <>
      <ListingHeader
        image="/hikes/torres-del-paine-national-park.jpg"
        title="Shop"
        description="Gear we trust on the trail — from t-shirts and socks to tents and climbing gear."
        meta={list.length ? `${list.length} products` : undefined}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      />
      <section className={styles.section}>
        {/* FTC: clear disclosure before any affiliate link, on the same page. */}
        <p className={shop.disclosure}>
          {shopDisclosure()} <Link href="/affiliate-disclosure">Learn more</Link>
        </p>
        {list.length > 0 ? (
          <Suspense>
            <ShopBrowser products={list} categories={shopCategories()} />
          </Suspense>
        ) : (
          <p className={styles.muted}>Our gear picks are coming soon.</p>
        )}
        <AdBanner ad={pickAd("shop", { category: "jackets" })} />
        {list.length > 0 && (
          <p className={shop.updated}>
            Prices and availability come from our partner stores and may change. Last updated{" "}
            {new Date(pricesUpdated()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
          </p>
        )}
        <aside className={shop.merch} aria-labelledby="merch-title">
          <p className={shop.merchEyebrow}>Coming soon</p>
          <h2 id="merch-title" className={shop.merchTitle}>
            Great Hikes merch
          </h2>
          <p>T-shirts, socks and caps with our own designs and photos from the community.</p>
        </aside>
      </section>
    </>
  );
}
