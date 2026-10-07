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

describe("trails (spec 008b)", () => {
  it("belong to known places and have sources", async () => {
    const { allTrails } = await import("@/lib/trails");
    const trails = allTrails();
    expect(trails.length).toBeGreaterThan(0);
    for (const t of trails) {
      expect(hikeBySlug(t.place), `${t.place}/${t.slug}`).toBeDefined();
      expect(t.sources.length).toBeGreaterThan(0);
    }
  });

  it("imported lines are plausible (start near the place, sane length)", async () => {
    const { allTrails, trailGeo } = await import("@/lib/trails");
    for (const t of allTrails()) {
      const geo = await trailGeo(t);
      if (!geo) continue;
      const place = hikeBySlug(t.place)!;
      const [lng, lat] = geo.line[0];
      expect(Math.abs(lat - place.location!.lat), t.slug).toBeLessThan(1.5);
      expect(Math.abs(lng - place.location!.lng), t.slug).toBeLessThan(1.5);
      expect(geo.lengthKm, t.slug).toBeGreaterThan(0.5);
      expect(geo.maxM, t.slug).toBeGreaterThanOrEqual(geo.minM);
    }
  });
});
