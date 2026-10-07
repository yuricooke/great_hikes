import { createClient } from "@supabase/supabase-js";

import { SUPABASE_CONFIGURED } from "./flags";

/** Community photo submissions (spec 010). */
export type Submission = {
  id: number;
  user_id: string;
  hike_slug: string | null;
  place_name: string | null;
  country: string | null;
  credit_name: string;
  instagram_handle: string | null;
  story: string | null;
  image_path: string;
  width: number | null;
  height: number | null;
  status: "pending" | "approved" | "rejected";
  public_url: string | null;
  created_at: string;
};

export const SUBMISSION_FIELDS =
  "id, user_id, hike_slug, place_name, country, credit_name, instagram_handle, story, image_path, width, height, status, public_url, created_at";

/** Approved community photos of a place, newest first (public). */
export async function approvedFor(hike: string): Promise<Submission[]> {
  if (!SUPABASE_CONFIGURED) return [];
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
    });
    const { data } = await db
      .from("submissions")
      .select(SUBMISSION_FIELDS)
      .eq("hike_slug", hike)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(24);
    return (data ?? []) as Submission[];
  } catch {
    return [];
  }
}
