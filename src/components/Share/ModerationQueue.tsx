"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { approveSubmission, rejectSubmission } from "@/app/moderation/actions";
import { SUBMISSION_FIELDS, type Submission } from "@/lib/submissions";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "../Auth/AuthProvider";
import PillButton from "../PillButton/PillButton";
import styles from "./Moderation.module.css";

type Row = Submission & { preview?: string };

/** Owner-only queue: pending photos with their details, approve or reject. */
export default function ModerationQueue({ titles }: { titles: Record<string, string> }) {
  const { user, ready, mode } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [message, setMessage] = useState<string | null>(null);
  const isOwner = user?.role === "owner";

  const load = useCallback(async () => {
    const db = supabaseBrowser();
    if (!db || !isOwner) return;
    const { data } = await db.from("submissions").select(SUBMISSION_FIELDS).eq("status", status).order("created_at", { ascending: false }).limit(50);
    const list = (data ?? []) as Submission[];
    const signed = await db.storage.from("submissions").createSignedUrls(list.map((r) => r.image_path), 600);
    setRows(list.map((r, i) => ({ ...r, preview: r.public_url ?? signed.data?.[i]?.signedUrl ?? undefined })));
  }, [isOwner, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with the database
    void load();
  }, [load]);

  if (!ready) return null;
  if (mode !== "supabase" || !isOwner) return <p>This page is for the Great Hikes owner. Sign in with the owner account.</p>;

  async function act(fn: typeof approveSubmission, id: number, label: string) {
    setMessage(null);
    const res = await fn(id);
    setMessage(res.ok ? `${label}.` : `Couldn't do that: ${res.error}`);
    void load();
  }

  return (
    <div className={styles.queue}>
      <div className={styles.tabs} role="group" aria-label="Show submissions">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {message && <p role="status">{message}</p>}
      {rows === null ? (
        <p>Loading…</p>
      ) : rows.length === 0 ? (
        <p>Nothing {status} right now.</p>
      ) : (
        <ul className={styles.list}>
          {rows.map((r) => (
            <li key={r.id} className={styles.card}>
              {r.preview && <Image src={r.preview} alt="" width={480} height={320} className={styles.image} unoptimized />}
              <div className={styles.body}>
                <p className={styles.place}>
                  {r.hike_slug ? titles[r.hike_slug] ?? r.hike_slug : `New place: ${r.place_name}, ${r.country}`}
                </p>
                <p>
                  Credit: <strong>{r.credit_name}</strong>
                  {r.instagram_handle && <> · @{r.instagram_handle}</>}
                </p>
                {r.story && <p className={styles.story}>{r.story}</p>}
                <p className={styles.meta}>
                  {new Date(r.created_at).toLocaleString("en-US")} · {r.width}×{r.height}
                </p>
                <div className={styles.actions}>
                  {r.status !== "approved" && (
                    <PillButton variant="accent" onClick={() => act(approveSubmission, r.id, "Approved and published")}>
                      Approve
                    </PillButton>
                  )}
                  {r.status !== "rejected" && (
                    <PillButton variant="outline" onClick={() => act(rejectSubmission, r.id, "Rejected and photo removed")}>
                      Reject
                    </PillButton>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
