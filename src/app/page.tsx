import type { Metadata } from "next";
import Image from "next/image";

import FavoriteButton from "@/components/Auth/FavoriteButton";
import GlassPanel from "@/components/GlassPanel/GlassPanel";
import Hero from "@/components/Hero/Hero";
import PhotoCard from "@/components/PhotoCard/PhotoCard";
import PhotoCredit from "@/components/PhotoCredit/PhotoCredit";
import PillButton from "@/components/PillButton/PillButton";
import ExploreBy from "@/components/ExploreBy/ExploreBy";
import AdBanner from "@/components/AdBanner/AdBanner";
import Rail from "@/components/Rail/Rail";
import ProductCard from "@/components/Shop/ProductCard";
import { pickAd } from "@/lib/ads";
import { featuredArticle, featuredHike } from "@/lib/featured";
import { hikeFacts, sortHikes } from "@/lib/hike-utils";
import { allHikes, hikeBySlug, hikePath, toHikeCard } from "@/lib/hikes";
import { featuredPosts } from "@/lib/instagram";
import { articlePath, articles } from "@/lib/journal";
import { products } from "@/lib/products";
import { approvedRecent } from "@/lib/submissions";
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
  // Today's feature is a journal guide; its cover hike gives the photo and the "plan it" link.
  const story = await featuredArticle();
  const storyHike = story ? hikeBySlug(story.cover)! : hike;
  const top10 = hikesForTopic(topicBySlug("top-10")!);
  const [posts, shared] = await Promise.all([featuredPosts(), approvedRecent(10)]);
  // Curated community: approved hiker photos first, then credited @great_hikes features.
  const community = [
    ...shared.map((s) => {
      const place = hikeBySlug(s.hike_slug!);
      return {
        key: `s-${s.id}`,
        href: place ? `${hikePath(place)}#gallery` : "/hikes",
        image: s.public_url!,
        title: place?.title ?? "Shared by a hiker",
        subtitle: `Photo: ${s.instagram_handle ? `@${s.instagram_handle}` : s.credit_name}`,
      };
    }),
    ...posts.slice(0, 10).map((p) => ({
      key: `ig-${p.id}`,
      href: `/our-feed#post-${p.id}`,
      image: p.image.medium,
      title: p.title ?? "Featured on Instagram",
      subtitle: p.handle ? `Photo: @${p.handle}` : undefined,
    })),
  ].slice(0, 12);
  // Guides and hikers' experiences together, newest first.
  const journal = [...articles()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  const recent = sortHikes(allHikes(), "latest").slice(0, 10);
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
            <PhotoCard key={h.slug} href={hikePath(h)} image={h.photo.src} title={h.title} subtitle={`${h.country} · ${h.continent}`} badge={`#${i + 1}`} facts={hikeFacts(toHikeCard(h))} favoriteSlug={h.slug} />
          ))}
        </Rail>

        <section aria-labelledby="featured-title" className={styles.featureSection}>
          <GlassPanel tone="strong" className={styles.feature}>
            <div className={styles.featurePhoto}>
              <Image
                src={storyHike.photo.src}
                alt={storyHike.photo.alt}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                quality={70}
                priority
              />
            </div>
            <div className={styles.featureBody}>
              <div className={styles.featureTop}>
                <p className={styles.eyebrow}>{story ? "Today's read" : "Today's feature"}</p>
                <time className={styles.date} dateTime={now.toISOString().slice(0, 10)}>
                  {todayLabel(now)}
                </time>
              </div>
              <h2 id="featured-title" className={styles.featureTitle}>
                {story ? story.title : storyHike.title}
              </h2>
              <p className={styles.place}>
                {storyHike.title} <span aria-hidden="true">·</span> {storyHike.country}
                {story && (
                  <>
                    {" "}
                    <span aria-hidden="true">·</span> {story.readMinutes} min read
                  </>
                )}
              </p>
              <p className={styles.featureText}>{story ? story.lead : storyHike.description}</p>
              <div className={styles.featureActions}>
                {story ? (
                  <>
                    <PillButton href={articlePath(story)} variant="accent" size="lg" icon="stories">
                      Read the guide
                    </PillButton>
                    <PillButton href={hikePath(storyHike)} variant="outline" icon="hiking">
                      Plan {storyHike.title}
                    </PillButton>
                  </>
                ) : (
                  <>
                    <PillButton href={hikePath(storyHike)} variant="accent" size="lg" icon="hiking">
                      Let&apos;s hike!
                    </PillButton>
                    <FavoriteButton slug={storyHike.slug} title={storyHike.title} variant="pill" />
                  </>
                )}
              </div>
              <PhotoCredit photo={storyHike.photo} />
            </div>
          </GlassPanel>
        </section>

        <Rail id="recently-added" title="Recently added" description="The newest hikes on Great Hikes." seeAllHref="/hikes" seeAllLabel="All hikes">
          {recent.map((h) => (
            <PhotoCard key={h.slug} href={hikePath(h)} image={h.photo.src} title={h.title} subtitle={`${h.country} · ${h.continent}`} facts={hikeFacts(toHikeCard(h))} favoriteSlug={h.slug} />
          ))}
        </Rail>

        {community.length > 0 && (
          <Rail id="community" title="From our community" description="Hikers' photos, approved and credited to each photographer." seeAllHref="/our-feed">
            {community.map((c) => (
              <PhotoCard key={c.key} href={c.href} image={c.image} title={c.title} subtitle={c.subtitle} />
            ))}
          </Rail>
        )}

        {journal.length > 0 && (
          <Rail id="journal" size="wide" title="For your hikes — Journal" description="Planning guides and hikers' experiences." seeAllHref="/journal" seeAllLabel="Journal">
            {journal.map((a) => (
              <PhotoCard
                key={a.slug}
                href={articlePath(a)}
                image={hikeBySlug(a.cover)!.photo.src}
                title={a.title}
                subtitle={`${a.kind === "guide" ? "Guide" : `By ${a.author}`} · ${a.readMinutes} min read`}
                badge={a.status === "sample" ? "Sample" : a.status === "draft" ? "Draft" : a.kind === "guide" ? "Guide" : "Experience"}
                aspect="landscape"
              />
            ))}
          </Rail>
        )}

        <section className={`${styles.explore} ${styles.band}`} aria-labelledby="explore-by">
          <h2 id="explore-by" className={styles.sectionTitle}>
            Explore by
          </h2>
          <ExploreBy hikes={allHikes().map(toHikeCard)} />
        </section>

        <AdBanner ad={pickAd("landing", { hikes: [hike] })} />

        {shop.length > 0 && (
          <Rail id="shop" title="Shop" description="Gear we trust on the trail." seeAllHref="/shop" seeAllLabel="Visit the shop">
            {shop.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Rail>
        )}
      </div>
    </>
  );
}
