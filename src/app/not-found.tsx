import type { Metadata } from "next";

import BackgroundImage from "@/components/Background/BackgroundImage";
import GlassPanel from "@/components/GlassPanel/GlassPanel";
import PillButton from "@/components/PillButton/PillButton";
import { allHikes } from "@/lib/hikes";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Trail not found",
  robots: { index: false },
};

export default function NotFound() {
  const photo = allHikes().find((h) => h.slug === "patagonia")?.photo ?? allHikes()[0].photo;
  return (
    <>
      <BackgroundImage src={photo.src} />
      <div className={styles.center}>
        <GlassPanel className={styles.panel}>
          <p className={styles.code}>404</p>
          <h1 className={styles.title}>Trail not found</h1>
          <p>This path doesn&apos;t lead anywhere — but plenty of others do.</p>
          <div className={styles.actions}>
            <PillButton href="/hikes" variant="accent" icon="hiking">
              Browse all hikes
            </PillButton>
            <PillButton href="/" variant="outline">
              Home
            </PillButton>
          </div>
        </GlassPanel>
      </div>
    </>
  );
}
