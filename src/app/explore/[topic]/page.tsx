import type { Metadata } from "next";
import { notFound } from "next/navigation";

import HikeGrid from "@/components/HikeGrid/HikeGrid";
import ListingHeader, { hikeCount } from "@/components/ListingHeader/ListingHeader";
import PillButton from "@/components/PillButton/PillButton";
import { allTopics, hikesForTopic, topicBySlug, topicCover, topicPath } from "@/lib/topics";
import styles from "../../section.module.css";

type Params = { topic: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return allTopics().map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const topic = topicBySlug((await params).topic);
  if (!topic) return {};
  return {
    title: topic.title,
    description: topic.description,
    alternates: { canonical: topicPath(topic) },
    openGraph: { title: topic.title, description: topic.description, images: [{ url: topicCover(topic).photo.src }] },
  };
}

export default async function TopicPage({ params }: { params: Promise<Params> }) {
  const topic = topicBySlug((await params).topic);
  if (!topic) notFound();
  const hikes = hikesForTopic(topic);

  return (
    <>
      <ListingHeader
        image={topicCover(topic).photo.src}
        title={topic.title}
        description={topic.description}
        meta={hikeCount(hikes.length)}
        breadcrumb={[{ label: "Home", href: "/" }, { label: topic.title }]}
      />
      <section className={styles.section}>
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
      </section>
    </>
  );
}
