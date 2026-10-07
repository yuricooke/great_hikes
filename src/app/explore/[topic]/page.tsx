import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BackgroundImage from "@/components/Background/BackgroundImage";
import GlassPanel from "@/components/GlassPanel/GlassPanel";
import HikeGrid from "@/components/HikeGrid/HikeGrid";
import ListingHeader from "@/components/ListingHeader/ListingHeader";
import PillButton from "@/components/PillButton/PillButton";
import { allTopics, hikesForTopic, topicBySlug, topicCover, topicPath } from "@/lib/topics";
import styles from "../explore.module.css";

type Params = { topic: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return allTopics().map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const topic = topicBySlug((await params).topic);
  if (!topic) return {};
  const cover = topicCover(topic);
  return {
    title: topic.title,
    description: topic.description,
    alternates: { canonical: topicPath(topic) },
    openGraph: { title: topic.title, description: topic.description, images: [{ url: cover.photo.src }] },
  };
}

export default async function TopicPage({ params }: { params: Promise<Params> }) {
  const topic = topicBySlug((await params).topic);
  if (!topic) notFound();
  const hikes = hikesForTopic(topic);

  return (
    <>
      <BackgroundImage src={topicCover(topic).photo.src} priority />
      <ListingHeader
        title={topic.title}
        description={topic.description}
        count={hikes.length}
        breadcrumb={[{ label: "Home", href: "/" }, { label: topic.title }]}
      />
      <GlassPanel tone="strong" className={styles.body}>
        {hikes.length > 0 ? (
          <HikeGrid
            hikes={hikes}
            ranked={topic.kind === "ranked"}
            hideLandscape={topic.kind === "landscape" ? topic.landscape : undefined}
          />
        ) : (
          <div className={styles.empty}>
            <p>No hikes here yet.</p>
            <PillButton href="/hikes">See all hikes</PillButton>
          </div>
        )}
      </GlassPanel>
    </>
  );
}
