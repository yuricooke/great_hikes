import type { MetadataRoute } from "next";

import { allHikes, hikePath } from "@/lib/hikes";
import { SITE_URL } from "@/lib/site";
import { articlePath, articles } from "@/lib/journal";
import { allTopics, topicPath } from "@/lib/topics";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/hikes`, changeFrequency: "weekly", priority: 0.9 },
    ...["/search", "/journal", "/shop", "/our-feed", "/community"].map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...["/about", "/contact", "/affiliate-disclosure", "/privacy", "/terms"].map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...articles()
      .filter((a) => a.status === "published")
      .map((a) => ({ url: `${SITE_URL}${articlePath(a)}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...allTopics().map((topic) => ({
      url: `${SITE_URL}${topicPath(topic)}`,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...allHikes().map((hike) => ({
      url: `${SITE_URL}${hikePath(hike)}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
