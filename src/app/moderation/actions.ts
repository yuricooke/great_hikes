"use server";

import { revalidatePath } from "next/cache";

import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";

async function requireOwner() {
  const db = await supabaseServer();
  const { data } = await db.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  const { data: profile } = await db.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "owner") throw new Error("Owners only");
}

/** Approve: copy the photo to the public bucket, publish the row, refresh the hike page. */
export async function approveSubmission(id: number): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireOwner();
    const admin = supabaseAdmin();
    const { data: row, error } = await admin.from("submissions").select("image_path, hike_slug").eq("id", id).single();
    if (error || !row) throw new Error("Not found");
    const file = await admin.storage.from("submissions").download(row.image_path);
    if (file.error) throw file.error;
    const up = await admin.storage.from("community").upload(row.image_path, file.data, { contentType: "image/jpeg", upsert: true });
    if (up.error) throw up.error;
    const publicUrl = admin.storage.from("community").getPublicUrl(row.image_path).data.publicUrl;
    const upd = await admin
      .from("submissions")
      .update({ status: "approved", public_url: publicUrl, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (upd.error) throw upd.error;
    if (row.hike_slug) revalidatePath(`/hikes/${row.hike_slug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Reject: mark rejected, remove the photo (and its public copy, if it was approved before). */
export async function rejectSubmission(id: number): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireOwner();
    const admin = supabaseAdmin();
    const { data: row } = await admin.from("submissions").select("image_path, hike_slug").eq("id", id).single();
    if (!row) throw new Error("Not found");
    await admin.storage.from("submissions").remove([row.image_path]);
    await admin.storage.from("community").remove([row.image_path]);
    await admin.from("submissions").update({ status: "rejected", public_url: null, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (row.hike_slug) revalidatePath(`/hikes/${row.hike_slug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}
