import type { Metadata } from "next";

import BackgroundVideo from "@/components/Background/BackgroundVideo";
import Brand from "@/components/Brand/Brand";
import GlassPanel from "@/components/GlassPanel/GlassPanel";
import PillButton from "@/components/PillButton/PillButton";
import { allHikes } from "@/lib/hikes";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
  alternates: { canonical: "/" },
  openGraph: { images: [{ url: allHikes()[0].photo.src }] },
};

export default function HomePage() {
  const poster = allHikes()[0].photo.src;
  return (
    <>
      <BackgroundVideo src="/video/hikes.mp4" poster={poster} />
      <div className={styles.center}>
        <GlassPanel tone="light" className={styles.welcome}>
          <Brand size="lg" asHeading stacked />
          <hr className={styles.rule} />
          <p className={styles.tagline}>{SITE_TAGLINE}</p>
          <PillButton href="/hikes" size="lg" icon="hiking">
            Let&apos;s Hike!
          </PillButton>
        </GlassPanel>
      </div>
    </>
  );
}
