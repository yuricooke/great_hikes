/**
 * @great_hikes Instagram feeds via Behold (official Instagram API, no scraping).
 * Fetched on the server and cached for an hour.
 */
export const FEEDS = {
  /** @great_hikes posts — community photos featured with "Place | @photographer" captions. */
  account: "https://feeds.behold.so/z6suMCUuC1CDmLXvx9RX",
  /** Public posts tagged #great_hikes (Behold advanced source). */
  hashtag: "https://feeds.behold.so/55drRZJL76ax5gl1tw7r",
} as const;

type Size = { mediaUrl: string; width: number; height: number };
export type FeedPost = {
  id: string;
  permalink: string;
  timestamp: string;
  mediaType: string;
  mediaUrl?: string;
  caption?: string;
  prunedCaption?: string;
  mentions?: string[];
  likeCount?: number;
  sizes?: Partial<Record<"small" | "medium" | "large" | "full", Size>>;
  children?: { id: string; mediaType: string; sizes?: Partial<Record<"small" | "medium" | "large" | "full", Size>> }[];
};
export type Feed = { username?: string; posts: FeedPost[] };

export type Post = {
  id: string;
  permalink: string;
  date: string;
  likes: number | null;
  title: string | null;
  body: string;
  handle: string | null;
  image: { small: string; medium: string; large: string; full: string };
  slides: string[];
};

export async function getFeed(url: string): Promise<Feed> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return { posts: [] };
    return (await res.json()) as Feed;
  } catch {
    return { posts: [] };
  }
}

/** Split glued hashtags so captions wrap; drop spacer lines and lone "#". */
export function cleanCaption(caption = ""): string {
  return caption
    .replace(/(\S)#/g, "$1 #")
    .replace(/(^|[ \t])#(?=\s|$)/gm, "$1")
    .split("\n")
    .filter((line) => !/^[\s.*•▪_\-#]*$/.test(line))
    .join("\n")
    .trim();
}

function sized(sizes: FeedPost["sizes"], fallback = "") {
  const pick = (k: "small" | "medium" | "large" | "full") => sizes?.[k]?.mediaUrl ?? fallback;
  return { small: pick("small"), medium: pick("medium"), large: pick("large"), full: pick("full") };
}

/** "Place | @photographer" first line → title + credit; the rest is the caption. */
export function toPost(raw: FeedPost, ownUsername = "great_hikes"): Post {
  const caption = cleanCaption(raw.prunedCaption ?? raw.caption ?? "");
  const [firstLine = "", ...rest] = caption.split("\n");
  const handle = (raw.mentions ?? []).find((m) => m !== ownUsername) ?? null;
  let title: string | null = null;
  let body = caption;
  if (firstLine.includes("|")) {
    title =
      firstLine
        .split("|")
        .map((p) => p.replace(/@[\w.]+/g, "").replace(/[\s.]+$/, "").trim())
        .filter(Boolean)
        .join(" · ") || null;
    body = rest.join("\n");
  }
  body = body.replace(new RegExp(`^.*Use @${ownUsername}.*$`, "gim"), "").trim();
  const slides = (raw.children ?? []).filter((c) => c.mediaType === "IMAGE").map((c) => sized(c.sizes).full);
  return {
    id: raw.id,
    permalink: raw.permalink,
    date: raw.timestamp,
    likes: raw.likeCount ?? null,
    title,
    body,
    handle,
    image: sized(raw.sizes, raw.mediaUrl),
    slides,
  };
}

/** Featured posts must credit a photographer (owner rule: no @photographer, no feature). */
export async function featuredPosts(): Promise<Post[]> {
  const feed = await getFeed(FEEDS.account);
  return feed.posts.map((p) => toPost(p, feed.username)).filter((p) => p.handle);
}

export async function communityPosts(): Promise<Post[]> {
  const feed = await getFeed(FEEDS.hashtag);
  return feed.posts.map((p) => toPost(p, feed.username));
}
