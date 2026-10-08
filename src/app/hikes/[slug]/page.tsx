import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import AdBanner from "@/components/AdBanner/AdBanner";
import FavoriteButton from "@/components/Auth/FavoriteButton";
import BackgroundImage from "@/components/Background/BackgroundImage";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import GlassPanel from "@/components/GlassPanel/GlassPanel";
import HikeCard from "@/components/HikeCard/HikeCard";
import { HikeFacts, HikeMap, InstagramFeatures, SeasonBar, WeatherStrip, monthRanges } from "@/components/HikeInfo/HikeInfo";
import PhotoCredit from "@/components/PhotoCredit/PhotoCredit";
import PillButton from "@/components/PillButton/PillButton";
import { pickAd } from "@/lib/ads";
import { allHikes, continentKey, hikeBySlug, hikePath, relatedHikes } from "@/lib/hikes";
import { communityFor } from "@/lib/community";
import { approvedFor } from "@/lib/submissions";
import { featuredPosts } from "@/lib/instagram";
import Community from "@/components/Community/Community";
import { trailGeo, trailsFor } from "@/lib/trails";
import TrailList from "@/components/Trail/TrailList";
import HikeGallery, { type Slide } from "@/components/HikeGallery/HikeGallery";
import { forecast } from "@/lib/weather";
import styles from "./hike.module.css";

type Params = { slug: string };

export const dynamicParams = false;
/** Weather and Instagram features refresh hourly. */
export const revalidate = 3600;

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
  const details = hike.details;
  const [days, posts] = await Promise.all([
    hike.location ? forecast(hike.location.lat, hike.location.lng) : Promise.resolve([]),
    hike.instagram.length ? featuredPosts() : Promise.resolve([]),
  ]);
  const features = posts.filter((p) => hike.instagram.includes(p.id));
  const [community, shared] = await Promise.all([communityFor({ hike: hike.slug }), approvedFor(hike.slug)]);
  const trails = trailsFor(hike);
  // Gallery: the hike photo, extra credited photos, its trails' photos, then approved hiker photos.
  const slides: Slide[] = [
    { photo: hike.photo },
    ...hike.gallery.map((photo) => ({ photo })),
    ...trails.filter((t) => t.photo).map((t) => ({ photo: t.photo!, caption: t.name })),
    ...shared.map((s) => ({
      caption: s.story ? undefined : "Shared by a hiker",
      photo: {
        src: s.public_url!,
        alt: `${hike.title} — photo by ${s.credit_name}`,
        author: s.instagram_handle ? `${s.credit_name} (@${s.instagram_handle})` : s.credit_name,
        sourceUrl: s.instagram_handle ? `https://www.instagram.com/${s.instagram_handle}/` : null,
        license: "Shared with Great Hikes by the photographer",
      },
    })),
  ];
  const measuredKm = Object.fromEntries(
    await Promise.all(trails.map(async (t) => [t.slug, (await trailGeo(t))?.lengthKm ?? 0] as const)),
  );
  const checked = hike.checkedAt
    ? new Date(`${hike.checkedAt}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
    : null;

  return (
    <>
      {/* Second-level pages keep the original fixed photo background (owner decision 2026-10-07). */}
      <BackgroundImage src={hike.photo.src} priority />
      <article className={styles.article} data-photo-page>
        <div className={styles.heroInner} data-surface="photo">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: hike.continent, href: `/explore/${continentKey(hike.continent)}` },
              { label: hike.title },
            ]}
          />
          <header className={styles.hero}>
            <p className={styles.location}>
              {hike.continent} <span aria-hidden="true">|</span> {hike.country}
            </p>
            {hike.status === "draft" && <p className={styles.draft}>Draft — awaiting approval (preview only)</p>}
            <h1 className={styles.title}>{hike.title}</h1>
            <p className={styles.teaser}>{hike.description}</p>
            <div className={styles.heroActions}>
              <ul className={styles.tags} aria-label="Hike facts">
                {details?.distanceKm && <li>{details.distanceKm} km</li>}
                {details && <li>{details.duration}</li>}
                {details && <li className={styles.cap}>{details.difficulty}</li>}
                {details && <li>Best {monthRanges(details.bestMonths)}</li>}
                <li>{hike.biome}</li>
              </ul>
              <FavoriteButton slug={hike.slug} title={hike.title} variant="pill" />
            </div>
          </header>
          <PhotoCredit photo={hike.photo} />
        </div>

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

            {trails.length > 0 && (
              <section aria-labelledby="trails">
                <h2 id="trails" className={styles.sectionTitle}>
                  Trails in {hike.title}
                </h2>
                <TrailList trails={trails} measuredKm={measuredKm} />
              </section>
            )}

            {details && (
              <section aria-labelledby="plan">
                <h2 id="plan" className={styles.sectionTitle}>
                  Plan your trip
                </h2>
                <SeasonBar months={details.bestMonths} />
                <dl className={styles.plan}>
                  <div>
                    <dt>Permits &amp; fees</dt>
                    <dd>{details.permit ?? "No permit needed."}</dd>
                  </div>
                  <div>
                    <dt>Getting there</dt>
                    <dd>{details.gettingThere}</dd>
                  </div>
                  {details.tips.length > 0 && (
                    <div>
                      <dt>Good to know</dt>
                      <dd>
                        <ul className={styles.tips}>
                          {details.tips.map((tip) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            <section aria-labelledby="gallery">
              <h2 id="gallery" className={styles.sectionTitle}>
                Gallery
              </h2>
              <HikeGallery slides={slides} label={`${hike.title} photos`} />
              <PillButton href={`/share?hike=${hike.slug}`} icon="add" variant="outline" className={styles.official}>
                Share your photo of {hike.title}
              </PillButton>
            </section>

            <section aria-labelledby="community">
              <h2 id="community" className={styles.sectionTitle}>
                Reviews &amp; tips
              </h2>
              <Community
                target={{ hike: hike.slug }}
                title={hike.title}
                initialReviews={community.reviews}
                initialTips={community.tips}
              />
            </section>

            {features.length > 0 && (
              <section aria-labelledby="instagram">
                <h2 id="instagram" className={styles.sectionTitle}>
                  Featured on @great_hikes
                </h2>
                <InstagramFeatures posts={features} />
              </section>
            )}

            {/* Gear relevant to this hike (landscape, continent, the hike itself). */}
            <AdBanner ad={pickAd("hike", { hikes: [hike] })} />

            {hike.sources.length > 0 && (
              <section aria-labelledby="sources" className={styles.sources}>
                <h2 id="sources" className={styles.sectionTitle}>
                  Sources
                </h2>
                <ul>
                  {hike.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className={styles.note}>
                  {checked && <>Checked {checked}. </>}Distances and times are typical for the route
                  above; conditions, permits and fees change — confirm with the official source before
                  you go.
                </p>
              </section>
            )}
          </GlassPanel>

          <aside className={styles.aside}>
            {details && (
              <GlassPanel as="section" aria-labelledby="glance" className={styles.asidePanel}>
                <h2 id="glance" className={styles.sectionTitle}>
                  {trails.length > 1 ? "Signature route" : "At a glance"}
                </h2>
                <HikeFacts details={details} />
              </GlassPanel>
            )}

            {hike.location && (
              <GlassPanel as="section" aria-labelledby="weather" className={styles.asidePanel}>
                <h2 id="weather" className={styles.sectionTitle}>
                  Weather this week
                </h2>
                <WeatherStrip days={days} />
              </GlassPanel>
            )}

            <GlassPanel as="section" aria-labelledby="location" className={styles.asidePanel}>
              <h2 id="location" className={styles.sectionTitle}>
                Location
              </h2>
              {hike.location ? (
                <HikeMap hike={hike} />
              ) : (
                <Image
                  src={hike.map}
                  alt={`Map of ${hike.continent}`}
                  width={480}
                  height={480}
                  className={styles.map}
                />
              )}
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
