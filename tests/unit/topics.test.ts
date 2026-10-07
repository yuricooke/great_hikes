import { describe, expect, it } from "vitest";

import { featuredHike, heroCandidates } from "@/lib/featured";
import { allHikes } from "@/lib/hikes";
import { allTopics, continentTopics, hikesForTopic, landingSections, topicBySlug } from "@/lib/topics";

describe("topics", () => {
  it("top 10 has ten distinct hikes in order", () => {
    const top = hikesForTopic(topicBySlug("top-10")!);
    expect(top).toHaveLength(10);
    expect(new Set(top.map((h) => h.slug)).size).toBe(10);
  });

  it("every landscape and continent topic has hikes", () => {
    for (const topic of allTopics()) expect(hikesForTopic(topic).length, topic.slug).toBeGreaterThan(0);
  });

  it("continent topics cover all hikes exactly once", () => {
    const total = continentTopics().reduce((n, t) => n + hikesForTopic(t).length, 0);
    expect(total).toBe(allHikes().length);
  });

  it("every hike has at least one landscape topic", () => {
    const landscapeSlugs = allTopics().filter((t) => t.kind === "landscape");
    for (const hike of allHikes()) {
      expect(landscapeSlugs.some((t) => hikesForTopic(t).includes(hike)), hike.slug).toBe(true);
    }
  });

  it("landing starts with the top 10 and includes the continent rail", () => {
    const sections = landingSections();
    expect(sections[0]).toMatchObject({ type: "topic", topic: { slug: "top-10" } });
    expect(sections.some((s) => s.type === "continents")).toBe(true);
  });
});

describe("featured hike", () => {
  const DAY = 24 * 60 * 60 * 1000;

  it("never features a photo without a source", () => {
    expect(heroCandidates().every((h) => h.photo.sourceUrl)).toBe(true);
    expect(heroCandidates().some((h) => h.slug === "amazon-rainforest")).toBe(false);
  });

  it("changes daily and does not repeat within a cycle", () => {
    const n = heroCandidates().length;
    const start = Math.ceil(Date.UTC(2026, 9, 7) / DAY / n) * n; // first day of a cycle
    const picks = Array.from({ length: n }, (_, i) => featuredHike(new Date((start + i) * DAY)).slug);
    expect(new Set(picks).size).toBe(n);
  });

  it("uses the owner's date override when set", () => {
    expect(featuredHike(new Date(Date.UTC(2026, 9, 7, 12))).slug).toBe("fiordland-national-park");
  });

  it("is stable within a day", () => {
    const morning = new Date(Date.UTC(2026, 9, 7, 1));
    const evening = new Date(Date.UTC(2026, 9, 7, 23));
    expect(featuredHike(morning).slug).toBe(featuredHike(evening).slug);
  });
});
