import { z } from "zod";

export const CONTINENTS = [
  { name: "Africa", key: "africa" },
  { name: "Asia", key: "asia" },
  { name: "Europe", key: "europe" },
  { name: "North America", key: "north-america" },
  { name: "Oceania", key: "oceania" },
  { name: "South America", key: "south-america" },
] as const;

export type ContinentName = (typeof CONTINENTS)[number]["name"];
export type ContinentKey = (typeof CONTINENTS)[number]["key"];

const continentNames = CONTINENTS.map((c) => c.name) as [ContinentName, ...ContinentName[]];

export const LANDSCAPES = [
  { key: "mountains", label: "Mountains" },
  { key: "forests", label: "Forests" },
  { key: "coasts", label: "Coasts" },
  { key: "waterfalls", label: "Waterfalls & lakes" },
  { key: "savannas", label: "Savannas & dunes" },
] as const;

export type LandscapeKey = (typeof LANDSCAPES)[number]["key"];
const landscapeKeys = LANDSCAPES.map((l) => l.key) as [LandscapeKey, ...LandscapeKey[]];

export const PhotoSchema = z.object({
  /** A file in /public/hikes, or an @great_hikes Instagram image served by Behold. */
  src: z.union([
    z.string().regex(/^\/hikes\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/),
    z.url().regex(/^https:\/\/(cdn2\.)?behold\.pictures\//),
  ]),
  alt: z.string().min(1).max(200),
  author: z.string().min(1),
  sourceUrl: z.url().nullable(),
  license: z.string().min(1),
});

export const DIFFICULTIES = ["easy", "moderate", "challenging", "strenuous"] as const;
export const ROUTE_TYPES = ["loop", "out-and-back", "point-to-point", "network"] as const;

/** Trip-planning facts for the hike's signature route (spec 008). */
export const DetailsSchema = z.object({
  route: z.string().min(1),
  distanceKm: z.number().positive().nullable(),
  elevationGainM: z.number().nonnegative().nullable(),
  maxAltitudeM: z.number().nonnegative().nullable(),
  duration: z.string().min(1),
  difficulty: z.enum(DIFFICULTIES),
  routeType: z.enum(ROUTE_TYPES),
  bestMonths: z.array(z.number().int().min(1).max(12)).min(1),
  permit: z.string().nullable(),
  gettingThere: z.string().min(1),
  tips: z.array(z.string().min(1)),
});

export const HikeSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(1).max(120),
  continent: z.enum(continentNames),
  country: z.string().min(1).max(80),
  biome: z.string().min(1).max(80),
  landscapes: z.array(z.enum(landscapeKeys)).min(1),
  description: z.string().min(1).max(300),
  hikingExplained: z.string().min(1),
  officialUrl: z.url().nullable(),
  map: z.string().regex(/^\/maps\/[A-Za-z]+\.(svg|webp|png)$/),
  photo: PhotoSchema,
  /** "draft" hikes (e.g. new places from Instagram features) show only in previews until approved. */
  status: z.enum(["published", "draft"]).default("published"),
  location: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
  details: DetailsSchema.optional(),
  sources: z.array(z.object({ label: z.string().min(1), url: z.url() })).default([]),
  checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  /** @great_hikes Instagram post ids featuring this place (shown with credit on the hike page). */
  instagram: z.array(z.string().regex(/^\d+$/)).default([]),
});

export const HikesSchema = z.array(HikeSchema);

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const topicBase = { slug, title: z.string().min(1), description: z.string().min(1), cover: slug };

export const TopicSchema = z.discriminatedUnion("kind", [
  z.object({ ...topicBase, kind: z.literal("ranked"), hikes: z.array(slug).min(1) }),
  z.object({ ...topicBase, kind: z.literal("landscape"), landscape: z.enum(landscapeKeys) }),
  z.object({ ...topicBase, kind: z.literal("continent"), continent: z.enum(continentNames) }),
]);

export const TopicsFileSchema = z.object({
  hero: z.object({
    title: z.string(),
    rotation: z.literal("daily"),
    excludeWithoutPhotoSource: z.boolean(),
    /** Pick the featured hike for specific dates (UTC, YYYY-MM-DD → hike slug). */
    overrides: z.record(z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.string()).optional(),
  }),
  /** Landing order: topic slugs, plus "continents" for the continent rail. */
  landing: z.array(z.string()),
  topics: z.array(TopicSchema),
});

export type Topic = z.infer<typeof TopicSchema>;

export type Photo = z.infer<typeof PhotoSchema>;
export type Hike = z.infer<typeof HikeSchema>;
export type HikeDetails = z.infer<typeof DetailsSchema>;
