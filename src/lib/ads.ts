import { z } from "zod";

import rawAds from "@content/ads.json";

import { SHOW_SAMPLES } from "./flags";
import type { Hike } from "./schema";

/**
 * Ad / promo banners. Each ad lists where it may appear (placements) and what it is relevant to
 * (targeting by hike, landscape, continent or shop category). The most specific match wins;
 * ads without targeting are the fallback. Sample ads never show in production.
 */
export type Placement = "landing" | "hike" | "article" | "search" | "shop";

const AdSchema = z.object({
  id: z.string(),
  status: z.enum(["published", "sample"]),
  sponsor: z.string(),
  title: z.string(),
  text: z.string(),
  cta: z.string(),
  href: z.string(),
  image: z.string(),
  placements: z.array(z.enum(["landing", "hike", "article", "search", "shop"])),
  targeting: z.object({
    hikes: z.array(z.string()).optional(),
    landscapes: z.array(z.string()).optional(),
    continents: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
  }),
});

export type Ad = z.infer<typeof AdSchema>;

const ADS = z.object({ ads: z.array(AdSchema) }).parse(rawAds).ads;

export type AdContext = {
  hikes?: Pick<Hike, "slug" | "landscapes" | "continent">[];
  landscape?: string | null;
  continent?: string | null;
  category?: string | null;
};

function score(ad: Ad, ctx: AdContext): number {
  const t = ad.targeting;
  let s = 0;
  for (const h of ctx.hikes ?? []) {
    if (t.hikes?.includes(h.slug)) s += 8;
    if (t.continents?.includes(h.continent)) s += 2;
    s += h.landscapes.filter((l) => t.landscapes?.includes(l)).length * 3;
  }
  if (ctx.landscape && t.landscapes?.includes(ctx.landscape)) s += 4;
  if (ctx.continent && t.continents?.includes(ctx.continent)) s += 3;
  if (ctx.category && t.categories?.includes(ctx.category)) s += 6;
  return s;
}

/** Best ad for a placement and context; `skip` avoids repeating ads already on the page. */
export function pickAd(placement: Placement, ctx: AdContext = {}, skip: string[] = []): Ad | null {
  const pool = ADS.filter(
    (a) => (SHOW_SAMPLES || a.status === "published") && a.placements.includes(placement) && !skip.includes(a.id),
  );
  if (pool.length === 0) return null;
  return [...pool].sort((a, b) => score(b, ctx) - score(a, ctx))[0];
}
