import type { Metadata } from "next";
import Link from "next/link";

import BackgroundImage from "@/components/Background/BackgroundImage";
import GlassPanel from "@/components/GlassPanel/GlassPanel";
import HikeGrid from "@/components/HikeGrid/HikeGrid";
import ListingHeader from "@/components/ListingHeader/ListingHeader";
import { allHikes } from "@/lib/hikes";
import { allTopics, topicPath } from "@/lib/topics";
import styles from "../explore/explore.module.css";

const DESCRIPTION = "Every hike on Great Hikes — from Patagonia to the Himalayas.";

export const metadata: Metadata = {
  title: "All hikes",
  description: DESCRIPTION,
  alternates: { canonical: "/hikes" },
  openGraph: { images: [{ url: allHikes()[0].photo.src }] },
};

export default function AllHikesPage() {
  const hikes = allHikes();
  return (
    <>
      <BackgroundImage src={hikes[0].photo.src} priority />
      <ListingHeader
        title="All hikes"
        description={DESCRIPTION}
        count={hikes.length}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "All hikes" }]}
      >
        <nav aria-label="Topics">
          <ul className={styles.chips}>
            {allTopics().map((topic) => (
              <li key={topic.slug}>
                <Link href={topicPath(topic)} className={styles.chip}>
                  {topic.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </ListingHeader>
      <GlassPanel tone="strong" className={styles.body}>
        <HikeGrid hikes={hikes} />
      </GlassPanel>
    </>
  );
}
