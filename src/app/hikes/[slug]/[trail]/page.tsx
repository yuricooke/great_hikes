import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AdBanner from "@/components/AdBanner/AdBanner";
import BackgroundImage from "@/components/Background/BackgroundImage";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import GlassPanel from "@/components/GlassPanel/GlassPanel";
import { HikeFacts, InstagramFeatures, SeasonBar, WeatherStrip, monthRanges } from "@/components/HikeInfo/HikeInfo";
import PhotoCredit from "@/components/PhotoCredit/PhotoCredit";
import ElevationProfile from "@/components/Trail/ElevationProfile";
import TrailList from "@/components/Trail/TrailList";
import TrailMap from "@/components/Trail/TrailMap";
import { pickAd } from "@/lib/ads";
import { continentKey, hikeBySlug, hikePath } from "@/lib/hikes";
import { featuredPosts } from "@/lib/instagram";
import { allTrails, trailBySlug, trailGeo, trailPath, trailsFor } from "@/lib/trails";
import { forecast } from "@/lib/weather";
import styles from "../hike.module.css";

type Params = { slug: string; trail: string };

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams(): Params[] {
  return allTrails().map((t) => ({ slug: t.place, trail: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, trail: t } = await params;
  const trail = trailBySlug(slug, t);
  const place = hikeBySlug(slug);
  if (!trail || !place) return {};
  const title = `${trail.name} — ${place.title}`;
  return {
    title,
    description: trail.summary,
    alternates: { canonical: trailPath(trail) },
    openGraph: { title, description: trail.summary, type: "article", images: [{ url: place.photo.src, alt: place.photo.alt }] },
  };
}

export default async function TrailPage({ params }: { params: Promise<Params> }) {
  const { slug, trail: t } = await params;
  const trail = trailBySlug(slug, t);
  const place = hikeBySlug(slug);
  if (!trail || !place) notFound();

  const geo = await trailGeo(trail);
  const photo = trail.photo ?? place.photo;
  const d = trail.details;
  // Official figures first; fill gaps with what we measured on the map.
  const facts = {
    ...d,
    distanceKm: d.distanceKm ?? (geo ? geo.lengthKm : null),
    elevationGainM: d.elevationGainM ?? (geo ? geo.gainM : null),
    maxAltitudeM: d.maxAltitudeM ?? (geo ? geo.maxM : null),
  };
  const start = geo ? { lat: geo.line[0][1], lng: geo.line[0][0] } : place.location;
  const [days, posts] = await Promise.all([
    start ? forecast(start.lat, start.lng) : Promise.resolve([]),
    trail.instagram.length ? featuredPosts() : Promise.resolve([]),
  ]);
  const features = posts.filter((p) => trail.instagram.includes(p.id));
  const others = trailsFor(place).filter((o) => o.slug !== trail.slug);
  const othersKm = Object.fromEntries(
    await Promise.all(others.map(async (o) => [o.slug, (await trailGeo(o))?.lengthKm ?? 0] as const)),
  );

  return (
    <>
      <BackgroundImage src={photo.src} priority />
      <article className={styles.article}>
        <div className={styles.heroInner}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: place.continent, href: `/explore/${continentKey(place.continent)}` },
              { label: place.title, href: hikePath(place) },
              { label: trail.name },
            ]}
          />
          <header className={styles.hero}>
            <p className={styles.location}>
              {place.title} <span aria-hidden="true">|</span> {place.country}
            </p>
            {trail.status === "draft" && <p className={styles.draft}>Draft — awaiting approval (preview only)</p>}
            <h1 className={styles.title}>{trail.name}</h1>
            <p className={styles.teaser}>{trail.summary}</p>
            <ul className={styles.tags} aria-label="Trail facts">
              {facts.distanceKm && <li>{facts.distanceKm} km</li>}
              <li>{d.duration}</li>
              <li className={styles.cap}>{d.difficulty}</li>
              <li>Best {monthRanges(d.bestMonths)}</li>
            </ul>
          </header>
          <PhotoCredit photo={photo} />
        </div>

        <div className={styles.grid}>
          <GlassPanel tone="strong" className={styles.main}>
            <section aria-labelledby="glance">
              <h2 id="glance" className={styles.sectionTitle}>
                At a glance
              </h2>
              <HikeFacts details={facts} />
            </section>

            {geo && (
              <section aria-labelledby="elevation">
                <h2 id="elevation" className={styles.sectionTitle}>
                  Elevation profile
                </h2>
                <ElevationProfile geo={geo} oneWay={d.routeType === "out-and-back"} />
              </section>
            )}

            <section aria-labelledby="plan">
              <h2 id="plan" className={styles.sectionTitle}>
                Plan your trip
              </h2>
              <SeasonBar months={d.bestMonths} />
              <dl className={styles.plan}>
                <div>
                  <dt>Permits &amp; fees</dt>
                  <dd>{d.permit ?? "No permit needed for this trail; park entry rules still apply."}</dd>
                </div>
                <div>
                  <dt>Getting there</dt>
                  <dd>{d.gettingThere}</dd>
                </div>
                {d.tips.length > 0 && (
                  <div>
                    <dt>Tips from hikers</dt>
                    <dd>
                      <ul className={styles.tips}>
                        {d.tips.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {features.length > 0 && (
              <section aria-labelledby="instagram">
                <h2 id="instagram" className={styles.sectionTitle}>
                  Featured on @great_hikes
                </h2>
                <InstagramFeatures posts={features} />
              </section>
            )}

            <AdBanner ad={pickAd("hike", { hikes: [place] })} />

            <section aria-labelledby="sources" className={styles.sources}>
              <h2 id="sources" className={styles.sectionTitle}>
                Sources
              </h2>
              <ul>
                {trail.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className={styles.note}>
                Official figures where published; other numbers are measured on the map and approximate.
                Conditions and rules change — confirm with the official source before you go.
              </p>
            </section>
          </GlassPanel>

          <aside className={styles.aside}>
            <GlassPanel as="section" aria-labelledby="location" className={styles.asidePanel}>
              <h2 id="location" className={styles.sectionTitle}>
                Map
              </h2>
              <TrailMap title={trail.name} line={geo?.line} point={start} />
            </GlassPanel>

            {start && (
              <GlassPanel as="section" aria-labelledby="weather" className={styles.asidePanel}>
                <h2 id="weather" className={styles.sectionTitle}>
                  Weather at the trailhead
                </h2>
                <WeatherStrip days={days} />
              </GlassPanel>
            )}

            {others.length > 0 && (
              <GlassPanel as="section" aria-labelledby="more-trails" className={styles.asidePanel}>
                <h2 id="more-trails" className={styles.sectionTitle}>
                  More trails in {place.title}
                </h2>
                <TrailList trails={others} measuredKm={othersKm} />
              </GlassPanel>
            )}
          </aside>
        </div>
      </article>
    </>
  );
}
