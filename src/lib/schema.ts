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

export const PhotoSchema = z.object({
  src: z.string().regex(/^\/hikes\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/),
  alt: z.string().min(1).max(200),
  author: z.string().min(1),
  sourceUrl: z.url().nullable(),
  license: z.string().min(1),
});

export const HikeSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(1).max(120),
  continent: z.enum(continentNames),
  country: z.string().min(1).max(80),
  biome: z.string().min(1).max(80),
  description: z.string().min(1).max(300),
  hikingExplained: z.string().min(1),
  officialUrl: z.url().nullable(),
  map: z.string().regex(/^\/maps\/[A-Za-z]+\.(svg|webp|png)$/),
  photo: PhotoSchema,
});

export const HikesSchema = z.array(HikeSchema);

export type Photo = z.infer<typeof PhotoSchema>;
export type Hike = z.infer<typeof HikeSchema>;
