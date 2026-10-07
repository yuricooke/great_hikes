import type { Metadata } from "next";

import BackgroundImage from "@/components/Background/BackgroundImage";
import GlassPanel from "@/components/GlassPanel/GlassPanel";
import { landscapeBadge } from "@/components/HikeGrid/HikeGrid";
import PhotoCard from "@/components/PhotoCard/PhotoCard";
import PhotoCredit from "@/components/PhotoCredit/PhotoCredit";
import PillButton from "@/components/PillButton/PillButton";
import Rail from "@/components/Rail/Rail";
import { featuredHike } from "@/lib/featured";
import { hikePath } from "@/lib/hikes";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import {
  continentTopics,
  heroConfig,
  hikesForTopic,
  landingSections,
  topicCover,
  topicPath,
} from "@/lib/topics";
import styles from "./landing.module.css";

// The featured hike changes daily (UTC); regenerate the static page every hour.
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

const RAIL_LIMIT = 10;

export default function LandingPage() {
  const hike = featuredHike();

  return (
    <>
      <BackgroundImage src={hike.photo.src} priority />
      <h1 className="visually-hidden">
        {SITE_NAME} — {SITE_TAGLINE}
      </h1>

      <section className={styles.hero} aria-labelledby="featured-title">
        <GlassPanel tone="light" className={styles.heroPanel}>
          <p className={styles.eyebrow}>{heroConfig().title}</p>
          <h2 id="featured-title" className={styles.heroTitle}>
            {hike.title}
          </h2>
          <p className={styles.place}>
            {hike.country} <span aria-hidden="true">·</span> {hike.continent}
          </p>
          <p className={styles.heroText}>{hike.description}</p>
          <PillButton href={hikePath(hike)} variant="accent" size="lg" icon="hiking">
            Let&apos;s hike!
          </PillButton>
        </GlassPanel>
        <PhotoCredit photo={hike.photo} className={styles.heroCredit} />
      </section>

      <GlassPanel tone="strong" className={styles.rails}>
        {landingSections().map((section) => {
          if (section.type === "continents") {
            const continents = continentTopics();
            return (
              <Rail
                key="continents"
                id="continents"
                title="Explore by continent"
                description="Six continents, one trail at a time."
                seeAllHref="/hikes"
                seeAllLabel="All hikes"
              >
                {continents.map((topic) => (
                  <PhotoCard
                    key={topic.slug}
                    href={topicPath(topic)}
                    image={topicCover(topic).photo.src}
                    title={topic.title}
                    subtitle={`${hikesForTopic(topic).length} hikes`}
                  />
                ))}
              </Rail>
            );
          }
          const { topic } = section;
          const hikes = hikesForTopic(topic);
          if (hikes.length === 0) return null;
          return (
            <Rail
              key={topic.slug}
              id={topic.slug}
              title={topic.title}
              description={topic.description}
              seeAllHref={topicPath(topic)}
            >
              {hikes.slice(0, RAIL_LIMIT).map((h, i) => (
                <PhotoCard
                  key={h.slug}
                  href={hikePath(h)}
                  image={h.photo.src}
                  title={h.title}
                  subtitle={`${h.country} · ${h.continent}`}
                  badge={
                    topic.kind === "ranked"
                      ? `#${i + 1}`
                      : landscapeBadge(h, topic.kind === "landscape" ? topic.landscape : undefined)
                  }
                />
              ))}
            </Rail>
          );
        })}
      </GlassPanel>
    </>
  );
}
