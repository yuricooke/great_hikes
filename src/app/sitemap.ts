import type { MetadataRoute } from "next";

import { allHikes, hikePath } from "@/lib/hikes";
import { SITE_URL } from "@/lib/site";
import { allTopics, topicPath } from "@/lib/topics";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/hikes`, changeFrequency: "weekly", priority: 0.9 },
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
