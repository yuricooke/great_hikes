import { describe, expect, it } from "vitest";

import { allHikes, filterByContinent, hikeByLegacyId, hikeBySlug, relatedHikes } from "@/lib/hikes";
import { CONTINENTS } from "@/lib/schema";
import { existsSync } from "node:fs";
import path from "node:path";

describe("hike data", () => {
  const hikes = allHikes();

  it("keeps the 32 legacy hikes published, with unique slugs and ids", () => {
    expect(hikes.filter((h) => h.status === "published")).toHaveLength(32);
    expect(new Set(hikes.map((h) => h.slug)).size).toBe(hikes.length);
    expect(new Set(hikes.map((h) => h.id)).size).toBe(hikes.length);
  });

  it("points every hike at photo and map files that exist", () => {
    for (const hike of hikes) {
      if (!hike.photo.src.startsWith("https://")) {
        expect(existsSync(path.join("public", hike.photo.src)), hike.photo.src).toBe(true);
      }
      expect(existsSync(path.join("public", hike.map)), hike.map).toBe(true);
    }
  });

  it("keeps descriptions as plain text", () => {
    for (const hike of hikes) {
      expect(hike.description).not.toMatch(/<[^>]+>/);
      expect(hike.hikingExplained).not.toMatch(/<[^>]+>/);
    }
  });

  it("maps legacy ids to slugs", () => {
    expect(hikeByLegacyId(1)?.slug).toBe("torres-del-paine-national-park");
    expect(hikeByLegacyId(999)).toBeUndefined();
  });

  it("returns up to six related hikes from the same continent, excluding itself", () => {
    for (const hike of hikes) {
      const related = relatedHikes(hike);
      expect(related.length).toBeLessThanOrEqual(6);
      expect(related.every((h) => h.continent === hike.continent && h.slug !== hike.slug)).toBe(true);
    }
  });

  it("filters by continent key", () => {
    expect(filterByContinent(hikes, null)).toHaveLength(hikes.length);
    expect(filterByContinent(hikes, "mars")).toHaveLength(0);
    const total = CONTINENTS.reduce((n, c) => n + filterByContinent(hikes, c.key).length, 0);
    expect(total).toBe(hikes.length);
    expect(filterByContinent(hikes, "south-america").every((h) => h.continent === "South America")).toBe(true);
  });

  it("finds hikes by slug", () => {
    expect(hikeBySlug("machu-picchu")?.title).toBe("Machu Picchu");
    expect(hikeBySlug("nope")).toBeUndefined();
  });
});

describe("hike details (spec 008)", () => {
  it("every hike has a location, trip details and at least one source", () => {
    for (const hike of allHikes()) {
      expect(hike.location, hike.slug).toBeDefined();
      expect(hike.details, hike.slug).toBeDefined();
      expect(hike.sources.length, hike.slug).toBeGreaterThan(0);
    }
  });

  it("instagram-featured hikes credit the photographer from the post", () => {
    for (const hike of allHikes().filter((h) => h.photo.src.startsWith("https://"))) {
      expect(hike.photo.author, hike.slug).toMatch(/^@[\w.]+$/);
      expect(hike.photo.sourceUrl, hike.slug).toMatch(/^https:\/\/www\.instagram\.com\/p\//);
      expect(hike.instagram.length, hike.slug).toBeGreaterThan(0);
    }
  });
});
