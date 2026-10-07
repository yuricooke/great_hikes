import { allHikes } from "./hikes";
import type { Hike } from "./schema";
import { heroConfig } from "./topics";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Small deterministic PRNG (mulberry32) so every server picks the same order. */
function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], seed: number): T[] {
  const next = random(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function heroCandidates(): Hike[] {
  const hikes = allHikes();
  return heroConfig().excludeWithoutPhotoSource ? hikes.filter((h) => h.photo.sourceUrl) : hikes;
}

/**
 * Today's featured hike (UTC). Each cycle walks through every candidate once in a shuffled
 * order, so there are no repeats within a cycle; the next cycle uses a new order.
 */
export function featuredHike(date = new Date()): Hike {
  const candidates = heroCandidates();
  const day = Math.floor(date.getTime() / DAY_MS);
  const cycle = Math.floor(day / candidates.length);
  return shuffled(candidates, cycle)[day % candidates.length];
}
