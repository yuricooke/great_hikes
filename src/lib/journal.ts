import { z } from "zod";

import rawArticles from "@content/journal.json";

import { SHOW_SAMPLES } from "./flags";
import { hikeBySlug } from "./hikes";

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const Block = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: z.string() }),
  z.object({ type: z.literal("heading"), text: z.string() }),
  z.object({ type: z.literal("quote"), text: z.string(), cite: z.string().optional() }),
  z.object({ type: z.literal("hikeCard"), slug, text: z.string() }),
  z.object({ type: z.literal("gallery"), slugs: z.array(slug).min(2) }),
  /** A hike's photo gallery as a slider (cover + its credited gallery photos). */
  z.object({ type: z.literal("photos"), hike: slug, text: z.string().optional() }),
]);
const ArticleSchema = z.object({
  slug,
  /** guide = written by Great Hikes ("Our content"); experience = a hiker's story */
  kind: z.enum(["guide", "experience"]),
  /** sample = layout placeholder; draft = written by the journal agent, awaiting owner approval. */
  status: z.enum(["published", "draft", "sample"]),
  title: z.string(),
  lead: z.string(),
  author: z.string(),
  date: z.string(),
  cover: slug,
  readMinutes: z.number().int().positive(),
  blocks: z.array(Block),
  relatedHikes: z.array(slug),
  /** Sources the facts were checked against (constitution III/IV); required for guides. */
  sources: z.array(z.object({ title: z.string(), url: z.url() })).default([]),
  /** Shop categories to suggest at the end of the article. */
  gear: z.array(z.string()).default([]),
});

export type Article = z.infer<typeof ArticleSchema>;
export type ArticleBlock = z.infer<typeof Block>;

function load(): Article[] {
  const articles = z.array(ArticleSchema).parse(rawArticles);
  for (const a of articles) {
    const refs = [a.cover, ...a.relatedHikes, ...a.blocks.flatMap((b) => ("slug" in b ? [b.slug] : "slugs" in b ? b.slugs : "hike" in b ? [b.hike] : []))];
    for (const s of refs) if (!hikeBySlug(s)) throw new Error(`Article ${a.slug}: unknown hike ${s}`);
  }
  return articles;
}

const ALL = load();

/** Sample and draft articles are visible on previews only, never in production. */
export function articles(kind?: Article["kind"]): Article[] {
  return ALL.filter((a) => (SHOW_SAMPLES || a.status === "published") && (!kind || a.kind === kind));
}

export function articleBySlug(s: string): Article | undefined {
  return articles().find((a) => a.slug === s);
}

export function articlePath(a: Pick<Article, "slug">) {
  return `/journal/${a.slug}`;
}

/** Slim article data for client-side lists, filters and search. */
export type ArticleCardData = {
  slug: string;
  href: string;
  title: string;
  lead: string;
  kind: Article["kind"];
  status: Article["status"];
  date: string;
  readMinutes: number;
  image: string;
  continents: string[];
  landscapes: string[];
  /** Hike names the article covers (searchable). */
  places: string;
};

export function toArticleCard(a: Article): ArticleCardData {
  const hikes = [a.cover, ...a.relatedHikes].map((s) => hikeBySlug(s)!).filter(Boolean);
  return {
    slug: a.slug,
    href: articlePath(a),
    title: a.title,
    lead: a.lead,
    kind: a.kind,
    status: a.status,
    date: a.date,
    readMinutes: a.readMinutes,
    image: hikes[0].photo.src,
    continents: [...new Set(hikes.map((h) => h.continent))],
    landscapes: [...new Set(hikes.flatMap((h) => h.landscapes))],
    places: hikes.map((h) => `${h.title} ${h.country}`).join(" "),
  };
}
