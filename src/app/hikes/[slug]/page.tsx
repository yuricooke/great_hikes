import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import BackgroundImage from "@/components/Background/BackgroundImage";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import GlassPanel from "@/components/GlassPanel/GlassPanel";
import HikeCard from "@/components/HikeCard/HikeCard";
import PhotoCredit from "@/components/PhotoCredit/PhotoCredit";
import PillButton from "@/components/PillButton/PillButton";
import { allHikes, continentKey, hikeBySlug, hikePath, relatedHikes } from "@/lib/hikes";
import styles from "./hike.module.css";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return allHikes().map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const hike = hikeBySlug((await params).slug);
  if (!hike) return {};
  return {
    title: hike.title,
    description: hike.description,
    alternates: { canonical: hikePath(hike) },
    openGraph: {
      title: hike.title,
      description: hike.description,
      type: "article",
      images: [{ url: hike.photo.src, alt: hike.photo.alt }],
    },
    twitter: { title: hike.title, description: hike.description, images: [hike.photo.src] },
  };
}

export default async function HikePage({ params }: { params: Promise<Params> }) {
  const hike = hikeBySlug((await params).slug);
  if (!hike) notFound();

  const related = relatedHikes(hike);
  const paragraphs = hike.hikingExplained.split(/\n{2,}/);

  return (
    <>
      <BackgroundImage src={hike.photo.src} priority />

      <article className={styles.article}>
        <div className={styles.back}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: hike.continent, href: `/explore/${continentKey(hike.continent)}` },
              { label: hike.title },
            ]}
          />
        </div>

        <header className={styles.hero}>
          <p className={styles.location}>
            {hike.continent} <span aria-hidden="true">|</span> {hike.country}
          </p>
          <h1 className={styles.title}>{hike.title}</h1>
          <p className={styles.teaser}>{hike.description}</p>
          <ul className={styles.tags} aria-label="Hike facts">
            <li>{hike.biome}</li>
          </ul>
        </header>

        <div className={styles.grid}>
          <GlassPanel tone="strong" className={styles.main}>
            <section aria-labelledby="the-hike">
              <h2 id="the-hike" className={styles.sectionTitle}>
                The hike
              </h2>
              {paragraphs.map((p, i) => (
                <p key={i} className={styles.prose}>
                  {p}
                </p>
              ))}
              {hike.officialUrl && (
                <PillButton href={hike.officialUrl} external icon="public" className={styles.official}>
                  Official site
                </PillButton>
              )}
            </section>

            <section aria-labelledby="gallery">
              <h2 id="gallery" className={styles.sectionTitle}>
                Gallery
              </h2>
              <figure className={styles.figure}>
                <Image
                  src={hike.photo.src}
                  alt={hike.photo.alt}
                  width={1200}
                  height={800}
                  sizes="(min-width: 992px) 60vw, 100vw"
                  className={styles.photo}
                />
                <figcaption>
                  <PhotoCredit photo={hike.photo} />
                </figcaption>
              </figure>
            </section>
            {/* Spec 003 adds trail stats, interactive map and elevation; spec 004 adds reviews. */}
          </GlassPanel>

          <aside className={styles.aside}>
            <GlassPanel as="section" aria-labelledby="location" className={styles.asidePanel}>
              <h2 id="location" className={styles.sectionTitle}>
                Location
              </h2>
              <Image
                src={hike.map}
                alt={`Map of ${hike.continent}`}
                width={480}
                height={480}
                className={styles.map}
              />
            </GlassPanel>

            {related.length > 0 && (
              <GlassPanel as="section" aria-labelledby="more-hikes" className={styles.asidePanel}>
                <h2 id="more-hikes" className={styles.sectionTitle}>
                  More hikes in {hike.continent}
                </h2>
                <ul className={styles.related}>
                  {related.map((h) => (
                    <li key={h.slug}>
                      <HikeCard hike={h} href={hikePath(h)} />
                    </li>
                  ))}
                </ul>
                <PillButton href={`/explore/${continentKey(hike.continent)}`} variant="outline">
                  All of {hike.continent}
                </PillButton>
              </GlassPanel>
            )}
          </aside>
        </div>
      </article>
    </>
  );
}
