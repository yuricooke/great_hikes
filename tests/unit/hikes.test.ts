import { describe, expect, it } from "vitest";

import { allHikes, filterByContinent, hikeByLegacyId, hikeBySlug, relatedHikes } from "@/lib/hikes";
import { CONTINENTS } from "@/lib/schema";
import { existsSync } from "node:fs";
import path from "node:path";

describe("hike data", () => {
  const hikes = allHikes();

  it("has the 32 legacy hikes with unique slugs and ids", () => {
    expect(hikes).toHaveLength(32);
    expect(new Set(hikes.map((h) => h.slug)).size).toBe(32);
    expect(new Set(hikes.map((h) => h.id)).size).toBe(32);
  });

  it("points every hike at photo and map files that exist", () => {
    for (const hike of hikes) {
      expect(existsSync(path.join("public", hike.photo.src)), hike.photo.src).toBe(true);
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
    expect(filterByContinent(hikes, null)).toHaveLength(32);
    expect(filterByContinent(hikes, "mars")).toHaveLength(0);
    const total = CONTINENTS.reduce((n, c) => n + filterByContinent(hikes, c.key).length, 0);
    expect(total).toBe(32);
    expect(filterByContinent(hikes, "south-america").every((h) => h.continent === "South America")).toBe(true);
  });

  it("finds hikes by slug", () => {
    expect(hikeBySlug("machu-picchu")?.title).toBe("Machu Picchu");
    expect(hikeBySlug("nope")).toBeUndefined();
  });
});
