import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import FavoriteButton from "@/components/Auth/FavoriteButton";
import GlassPanel from "@/components/GlassPanel/GlassPanel";
import Hero from "@/components/Hero/Hero";
import PhotoCard from "@/components/PhotoCard/PhotoCard";
import PhotoCredit from "@/components/PhotoCredit/PhotoCredit";
import PillButton from "@/components/PillButton/PillButton";
import AdBanner from "@/components/AdBanner/AdBanner";
import Rail from "@/components/Rail/Rail";
import ProductCard from "@/components/Shop/ProductCard";
import { pickAd } from "@/lib/ads";
import { featuredHike } from "@/lib/featured";
import { hikeBySlug, hikePath } from "@/lib/hikes";
import { featuredPosts } from "@/lib/instagram";
import { articlePath, articles } from "@/lib/journal";
import { CONTINENTS, LANDSCAPES } from "@/lib/schema";
import { products } from "@/lib/products";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { hikesForTopic, topicBySlug } from "@/lib/topics";
import styles from "./landing.module.css";

// Today's feature changes daily (UTC) and the Instagram feed refreshes: regenerate hourly.
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const hike = featuredHike();
  return {
    title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
    description: SITE_DESCRIPTION,
    alternates: { canonical: "/" },
    openGraph: { images: [{ url: hike.photo.src, alt: hike.photo.alt }] },
  };
}

/** Shown while the video loads and on phones / reduced motion (no video). */
const HERO_POSTER = "/hikes/los-glaciares-national-park.jpg";

function todayLabel(now = new Date()) {
  return now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default async function LandingPage() {
  const hike = featuredHike();
  const top10 = hikesForTopic(topicBySlug("top-10")!);
  const features = (await featuredPosts()).slice(0, 10);
  const guides = articles("guide");
  const experiences = articles("experience");
  const shop = products().filter((p) => p.featured).slice(0, 10);
  const now = new Date();

  return (
    <>
      <h1 className="visually-hidden">
        {SITE_NAME} — {SITE_TAGLINE}
      </h1>

      {/* Hiking video from the original home page, with the mountains logo centered (owner, 2026-10-07).
          ~80% of the screen tall so visitors see there is more below. */}
      <Hero image={HERO_POSTER} video="/video/hikes.mp4" size="landing" parallax>
        <div className={styles.heroLogo}>
          <Image src="/great_hikes.svg" alt="" width={240} height={158} priority />
        </div>
      </Hero>

      <div className={styles.sections}>
        <Rail id="top-10" title="Our top 10 for you" description="The hikes we'd do again tomorrow." seeAllHref="/explore/top-10">
          {top10.map((h, i) => (
            <PhotoCard key={h.slug} href={hikePath(h)} image={h.photo.src} title={h.title} subtitle={`${h.country} · ${h.continent}`} badge={`#${i + 1}`} favoriteSlug={h.slug} />
          ))}
        </Rail>

        <section aria-labelledby="featured-title" className={styles.featureSection}>
          <GlassPanel tone="strong" className={styles.feature}>
            <div className={styles.featurePhoto}>
              <Image
                src={hike.photo.src}
                alt={hike.photo.alt}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                quality={70}
                priority
              />
            </div>
            <div className={styles.featureBody}>
              <div className={styles.featureTop}>
                <p className={styles.eyebrow}>Today&apos;s feature</p>
                <time className={styles.date} dateTime={now.toISOString().slice(0, 10)}>
                  {todayLabel(now)}
                </time>
              </div>
              <h2 id="featured-title" className={styles.featureTitle}>
                {hike.title}
              </h2>
              <p className={styles.place}>
                {hike.country} <span aria-hidden="true">·</span> {hike.continent} <span aria-hidden="true">·</span>{" "}
                {hike.biome}
              </p>
              <p className={styles.featureText}>{hike.description}</p>
              <div className={styles.featureActions}>
                <PillButton href={hikePath(hike)} variant="accent" size="lg" icon="hiking">
                  Let&apos;s hike!
                </PillButton>
                <FavoriteButton slug={hike.slug} title={hike.title} variant="pill" />
              </div>
              <PhotoCredit photo={hike.photo} />
            </div>
          </GlassPanel>
        </section>

        {features.length > 0 && (
          <Rail id="community-features" title="Today's community features" description="Hikers featured on @great_hikes — credited to each photographer." seeAllHref="/our-feed">
            {features.map((p) => (
              <PhotoCard
                key={p.id}
                href={`/our-feed#post-${p.id}`}
                image={p.image.medium}
                title={p.title ?? "Featured on Instagram"}
                subtitle={p.handle ? `Photo: @${p.handle}` : undefined}
              />
            ))}
          </Rail>
        )}

        {guides.length > 0 && (
          <Rail id="our-content" size="wide" title="Our content" description="Guides and stories from the Great Hikes team." seeAllHref="/journal">
            {guides.map((a) => (
              <PhotoCard
                key={a.slug}
                href={articlePath(a)}
                image={hikeBySlug(a.cover)!.photo.src}
                title={a.title}
                subtitle={`${a.readMinutes} min read`}
                badge={a.status === "sample" ? "Sample" : a.status === "draft" ? "Draft" : "Guide"}
                aspect="landscape"
              />
            ))}
          </Rail>
        )}

        {shop.length > 0 && (
          <Rail id="shop" title="Shop" description="Gear we trust on the trail." seeAllHref="/shop" seeAllLabel="Visit the shop">
            {shop.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Rail>
        )}

        <section className={`${styles.explore} ${styles.band}`} aria-labelledby="explore-by">
          <div className={styles.exploreHeader}>
            <h2 id="explore-by" className={styles.sectionTitle}>
              Explore by
            </h2>
            <PillButton href="/search" variant="outline" icon="search">
              Search all hikes
            </PillButton>
          </div>
          <p className={styles.exploreLabel}>Landscape</p>
          <ul className={styles.tags}>
            {LANDSCAPES.map((l) => (
              <li key={l.key}>
                <Link href={`/search?landscape=${l.key}`} className={styles.tag}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.exploreLabel}>Continent</p>
          <ul className={styles.tags}>
            {CONTINENTS.map((c) => (
              <li key={c.key}>
                <Link href={`/search?continent=${c.key}`} className={styles.tag}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <AdBanner ad={pickAd("landing", { hikes: [hike] })} />

        {experiences.length > 0 && (
          <Rail id="experiences" size="wide" title="Hikers' experiences" description="Trip stories from our community." seeAllHref="/journal">
            {experiences.map((a) => (
              <PhotoCard
                key={a.slug}
                href={articlePath(a)}
                image={hikeBySlug(a.cover)!.photo.src}
                title={a.title}
                subtitle={`By ${a.author}`}
                badge={a.status === "sample" ? "Sample" : a.status === "draft" ? "Draft" : undefined}
                aspect="landscape"
              />
            ))}
          </Rail>
        )}
      </div>
    </>
  );
}
