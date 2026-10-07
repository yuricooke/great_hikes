import { createClient } from "@supabase/supabase-js";

import { SUPABASE_CONFIGURED } from "./flags";

/** Reviews and tips from signed-in hikers (spec 009). Public rows only; RLS enforces the rest. */
export type Review = {
  id: number;
  user_id: string;
  author_name: string;
  rating: number;
  hiked_on: string | null;
  body: string;
  status: "visible" | "hidden";
  created_at: string;
};
export type Tip = {
  id: number;
  user_id: string;
  author_name: string;
  kind: TipKind;
  body: string;
  status: "visible" | "hidden";
  created_at: string;
};
export const TIP_KINDS = {
  water: "Water",
  permits: "Permits & fees",
  transport: "Getting there",
  stay: "Huts & camping",
  gear: "Gear",
  safety: "Safety",
  other: "Other",
} as const;
export type TipKind = keyof typeof TIP_KINDS;
export type Target = { hike: string; trail?: string | null };

export const REVIEW_FIELDS = "id, user_id, author_name, rating, hiked_on, body, status, created_at";
export const TIP_FIELDS = "id, user_id, author_name, kind, body, status, created_at";

/** Server-side read for the first render (SEO); the client refreshes after mount. */
export async function communityFor(target: Target): Promise<{ reviews: Review[]; tips: Tip[] }> {
  if (!SUPABASE_CONFIGURED) return { reviews: [], tips: [] };
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const read = (table: "reviews" | "tips", fields: string) => {
    const q = db.from(table).select(fields).eq("hike_slug", target.hike);
    return (target.trail ? q.eq("trail_slug", target.trail) : q.is("trail_slug", null))
      .order("created_at", { ascending: false })
      .limit(50);
  };
  try {
    const [r, t] = await Promise.all([read("reviews", REVIEW_FIELDS), read("tips", TIP_FIELDS)]);
    return { reviews: (r.data ?? []) as unknown as Review[], tips: (t.data ?? []) as unknown as Tip[] };
  } catch {
    return { reviews: [], tips: [] };
  }
}

export function average(reviews: Review[]): number | null {
  const visible = reviews.filter((r) => r.status === "visible");
  if (!visible.length) return null;
  return Math.round((visible.reduce((s, r) => s + r.rating, 0) / visible.length) * 10) / 10;
}
