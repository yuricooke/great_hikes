"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { continentByKey, filterByContinent, hikePath } from "@/lib/hike-utils";
import { CONTINENTS, type Hike } from "@/lib/schema";
import BackgroundImage from "../Background/BackgroundImage";
import Brand from "../Brand/Brand";
import GlassPanel from "../GlassPanel/GlassPanel";
import HikeCard from "../HikeCard/HikeCard";
import PhotoCredit from "../PhotoCredit/PhotoCredit";
import PillButton from "../PillButton/PillButton";
import styles from "./HikeBrowser.module.css";

export type BrowserHike = Pick<
  Hike,
  "slug" | "title" | "continent" | "country" | "description" | "photo"
>;

type Props = {
  hikes: BrowserHike[];
  /** `?continent=` value; null renders all hikes (also the static, pre-hydration HTML). */
  continentParam: string | null;
};

/** Hikes screen: the selected hike fills the background; the list picks which one. */
export default function HikeBrowser({ hikes, continentParam }: Props) {
  const activeContinent = continentByKey(continentParam);

  const visible = useMemo(() => filterByContinent(hikes, continentParam), [hikes, continentParam]);
  const [selectedSlug, setSelectedSlug] = useState(visible[0]?.slug);
  const introRef = useRef<HTMLElement>(null);

  function select(slug: string) {
    setSelectedSlug(slug);
    // On phones the intro sits above the list; bring it back into view so the change is visible.
    if (window.matchMedia("(max-width: 991px)").matches) {
      introRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // If a filter hides the selected hike, fall back to the first visible one.
  const selected = visible.find((h) => h.slug === selectedSlug) ?? visible[0] ?? hikes[0];

  return (
    <>
      <BackgroundImage src={selected.photo.src} priority />

      <div className={styles.layout}>
        <section ref={introRef} className={styles.intro}>
          <p className="visually-hidden" aria-live="polite">
            Showing {selected.title}
          </p>
          <div className={styles.brand}>
            <Brand size="md" />
          </div>
          <p className={styles.location}>
            {selected.continent} <span aria-hidden="true">|</span> {selected.country}
          </p>
          <h1 className={styles.title}>{selected.title}</h1>
          <p className={styles.description}>{selected.description}</p>
          <div className={styles.actions}>
            <PillButton href={hikePath(selected)} variant="accent" size="lg" icon="hiking">
              Let&apos;s hike!
            </PillButton>
          </div>
          <PhotoCredit photo={selected.photo} className={styles.credit} />
        </section>

        <GlassPanel as="section" className={styles.listPanel} aria-labelledby="hike-list-heading">
          <h2 id="hike-list-heading" className={styles.listHeading}>
            {activeContinent ? `Hikes in ${activeContinent.name}` : "All hikes"}
            <span className={styles.count}> · {visible.length}</span>
          </h2>

          <nav aria-label="Filter by continent">
            <ul className={styles.filters}>
              <li>
                <Link
                  href="/hikes"
                  scroll={false}
                  className={styles.chip}
                  aria-current={!continentParam ? "true" : undefined}
                >
                  All
                </Link>
              </li>
              {CONTINENTS.map((c) => (
                <li key={c.key}>
                  <Link
                    href={`/hikes?continent=${c.key}`}
                    scroll={false}
                    className={styles.chip}
                    aria-current={continentParam === c.key ? "true" : undefined}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {visible.length === 0 ? (
            <div className={styles.empty}>
              <p>No hikes found for this filter.</p>
              <PillButton href="/hikes">See all hikes</PillButton>
            </div>
          ) : (
            <ul className={styles.list}>
              {visible.map((hike) => (
                <li key={hike.slug}>
                  <HikeCard
                    hike={hike}
                    selected={hike.slug === selected.slug}
                    onSelect={() => select(hike.slug)}
                  />
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>
      </div>
    </>
  );
}
