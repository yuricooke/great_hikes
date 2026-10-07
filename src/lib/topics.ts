import rawTopics from "@content/topics.json";

import { allHikes, hikeBySlug } from "./hikes";
import { TopicsFileSchema, type Hike, type Topic } from "./schema";

/** Validated at build time: unknown hike slugs or landing entries fail the build. */
function load() {
  const file = TopicsFileSchema.parse(rawTopics);
  const slugs = new Set<string>();
  for (const topic of file.topics) {
    if (slugs.has(topic.slug)) throw new Error(`Duplicate topic slug: ${topic.slug}`);
    slugs.add(topic.slug);
    if (!hikeBySlug(topic.cover)) throw new Error(`Topic ${topic.slug}: unknown cover hike ${topic.cover}`);
    if (topic.kind === "ranked") {
      for (const s of topic.hikes) if (!hikeBySlug(s)) throw new Error(`Topic ${topic.slug}: unknown hike ${s}`);
    }
  }
  for (const entry of file.landing) {
    if (entry !== "continents" && !slugs.has(entry)) throw new Error(`Landing: unknown topic ${entry}`);
  }
  return file;
}

const FILE = load();

export function heroConfig() {
  return FILE.hero;
}

export function allTopics(): Topic[] {
  return FILE.topics;
}

export function topicBySlug(slug: string): Topic | undefined {
  return FILE.topics.find((t) => t.slug === slug);
}

export function continentTopics() {
  return FILE.topics.filter((t): t is Extract<Topic, { kind: "continent" }> => t.kind === "continent");
}

export function hikesForTopic(topic: Topic): Hike[] {
  switch (topic.kind) {
    case "ranked":
      return topic.hikes.map((s) => hikeBySlug(s)!);
    case "landscape":
      return allHikes().filter((h) => h.landscapes.includes(topic.landscape));
    case "continent":
      return allHikes().filter((h) => h.continent === topic.continent);
  }
}

export function topicCover(topic: Topic): Hike {
  return hikeBySlug(topic.cover)!;
}

export function topicPath(topic: Pick<Topic, "slug">): string {
  return `/explore/${topic.slug}`;
}

/** Landing sections in order: a topic rail, or the continent rail. */
export type LandingSection = { type: "topic"; topic: Topic } | { type: "continents" };

export function landingSections(): LandingSection[] {
  return FILE.landing.map((entry) =>
    entry === "continents" ? { type: "continents" } : { type: "topic", topic: topicBySlug(entry)! },
  );
}
