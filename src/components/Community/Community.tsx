"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState, type FormEvent } from "react";

import {
  REVIEW_FIELDS,
  TIP_FIELDS,
  TIP_KINDS,
  average,
  type Review,
  type Target,
  type Tip,
  type TipKind,
} from "@/lib/community";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "../Auth/AuthProvider";
import PillButton from "../PillButton/PillButton";
import styles from "./Community.module.css";

function Stars({ value, label }: { value: number; label?: string }) {
  return (
    <span className={styles.stars} role="img" aria-label={label ?? `${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden="true" className={n <= Math.round(value) ? styles.on : styles.off}>
          ★
        </span>
      ))}
    </span>
  );
}

const day = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

/** Reviews and typed tips for a place or trail (spec 009). Members post; the owner can hide. */
export default function Community({
  target,
  title,
  initialReviews,
  initialTips,
}: {
  target: Target;
  title: string;
  initialReviews: Review[];
  initialTips: Tip[];
}) {
  const { mode, user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [tips, setTips] = useState(initialTips);
  const [db] = useState(() => (mode === "supabase" ? supabaseBrowser() : null));
  const isOwner = user?.role === "owner";

  const refresh = useCallback(async () => {
    if (!db) return;
    const scope = <Q,>(q: Q) => q;
    const r = db.from("reviews").select(REVIEW_FIELDS).eq("hike_slug", target.hike);
    const t = db.from("tips").select(TIP_FIELDS).eq("hike_slug", target.hike);
    const [rr, tt] = await Promise.all([
      scope(target.trail ? r.eq("trail_slug", target.trail) : r.is("trail_slug", null)).order("created_at", { ascending: false }).limit(50),
      scope(target.trail ? t.eq("trail_slug", target.trail) : t.is("trail_slug", null)).order("created_at", { ascending: false }).limit(50),
    ]);
    if (rr.data) setReviews(rr.data as unknown as Review[]);
    if (tt.data) setTips(tt.data as unknown as Tip[]);
  }, [db, target.hike, target.trail]);

  // Fresh data (and the owner's view of hidden posts) after the cached page loads.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with the database
    void refresh();
  }, [refresh, user?.id]);

  async function moderate(table: "reviews" | "tips", id: number, status: "visible" | "hidden") {
    if (!db) return;
    await db.from(table).update({ status }).eq("id", id);
    void refresh();
  }
  async function remove(table: "reviews" | "tips", id: number) {
    if (!db || !window.confirm("Delete this for good?")) return;
    await db.from(table).delete().eq("id", id);
    void refresh();
  }

  const avg = average(reviews);
  const shown = reviews.filter((r) => r.status === "visible" || isOwner || r.user_id === user?.id);
  const shownTips = tips.filter((t) => t.status === "visible" || isOwner || t.user_id === user?.id);
  const grouped = (Object.keys(TIP_KINDS) as TipKind[])
    .map((kind) => [kind, shownTips.filter((t) => t.kind === kind)] as const)
    .filter(([, list]) => list.length);
  const canPost = mode === "supabase" && Boolean(user);

  const actions = (table: "reviews" | "tips", item: Review | Tip) => (
    <span className={styles.actions}>
      {item.status === "hidden" && <span className={styles.hiddenTag}>Hidden</span>}
      {isOwner && (
        <button type="button" onClick={() => moderate(table, item.id, item.status === "visible" ? "hidden" : "visible")}>
          {item.status === "visible" ? "Hide" : "Show"}
        </button>
      )}
      {(item.user_id === user?.id || isOwner) && (
        <button type="button" onClick={() => remove(table, item.id)}>
          Delete
        </button>
      )}
    </span>
  );

  return (
    <div className={styles.community}>
      <div className={styles.summary}>
        {avg !== null ? (
          <>
            <Stars value={avg} label={`Rated ${avg} out of 5`} />
            <span>
              <strong>{avg}</strong> · {reviews.filter((r) => r.status === "visible").length} reviews from hikers
            </span>
          </>
        ) : (
          <span>No reviews yet — be the first to share how {title} went.</span>
        )}
      </div>

      {shown.length > 0 && (
        <ul className={styles.reviews}>
          {shown.map((r) => (
            <li key={r.id} className={styles.review}>
              <div className={styles.meta}>
                <Stars value={r.rating} />
                <strong>{r.author_name}</strong>
                {r.hiked_on && <span>hiked {day(r.hiked_on)}</span>}
                {actions("reviews", r)}
              </div>
              <p>{r.body}</p>
            </li>
          ))}
        </ul>
      )}

      {canPost ? (
        <ReviewForm db={db!} target={target} onDone={refresh} />
      ) : mode === "off" ? (
        <p className={styles.note}>Reviews from signed-in hikers are coming soon.</p>
      ) : (
        <p className={styles.note}>
          <Link href="/login">Sign in</Link> to review {title} or add a tip.
        </p>
      )}

      <h3 className={styles.subTitle}>Tips from hikers</h3>
      {grouped.length > 0 ? (
        <dl className={styles.tips}>
          {grouped.map(([kind, list]) => (
            <div key={kind}>
              <dt>{TIP_KINDS[kind]}</dt>
              {list.map((t) => (
                <dd key={t.id}>
                  {t.body} <span className={styles.by}>— {t.author_name}</span> {actions("tips", t)}
                </dd>
              ))}
            </div>
          ))}
        </dl>
      ) : (
        <p className={styles.note}>No tips yet. Water sources, transport, huts — what should the next hiker know?</p>
      )}
      {canPost && <TipForm db={db!} target={target} onDone={refresh} />}
    </div>
  );
}

type Db = NonNullable<ReturnType<typeof supabaseBrowser>>;

function ReviewForm({ db, target, onDone }: { db: Db; target: Target; onDone: () => void }) {
  const id = useId();
  const [rating, setRating] = useState(0);
  const [hikedOn, setHikedOn] = useState("");
  const [body, setBody] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!rating) return setError("Choose a rating from 1 to 5 stars.");
    if (body.trim().length < 20) return setError("Tell other hikers a bit more (at least 20 characters).");
    if (!agree) return setError("Please agree to publish your review.");
    setBusy(true);
    const { error: err } = await db.from("reviews").insert({
      hike_slug: target.hike,
      trail_slug: target.trail ?? null,
      rating,
      hiked_on: hikedOn || null,
      body: body.trim(),
    });
    setBusy(false);
    if (err) return setError("Couldn't save your review — please try again.");
    setSent(true);
    setError(null);
    onDone();
  }

  if (sent) return <p className={styles.note} role="status">Thanks — your review is live.</p>;

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <h3 className={styles.subTitle}>Write a review</h3>
      <fieldset className={styles.rating}>
        <legend>Your rating</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={n <= rating ? styles.on : styles.off}>
            <input type="radio" name={`${id}-rating`} value={n} checked={rating === n} onChange={() => setRating(n)} />
            <span aria-hidden="true">★</span>
            <span className="visually-hidden">{n} {n === 1 ? "star" : "stars"}</span>
          </label>
        ))}
      </fieldset>
      <label className={styles.field}>
        <span>When did you hike it? (optional)</span>
        <input type="date" value={hikedOn} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setHikedOn(e.target.value)} />
      </label>
      <label className={styles.field}>
        <span>Your review</span>
        <textarea rows={4} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Conditions, highlights, how hard it felt…" />
      </label>
      <label className={styles.check}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>
          Publish with my display name. I agree to the <Link href="/terms">terms</Link>.
        </span>
      </label>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <PillButton type="submit" variant="accent" disabled={busy}>
        {busy ? "Posting…" : "Post review"}
      </PillButton>
    </form>
  );
}

function TipForm({ db, target, onDone }: { db: Db; target: Target; onDone: () => void }) {
  const [kind, setKind] = useState<TipKind>("water");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (body.trim().length < 10) return setError("Tips need at least 10 characters.");
    setBusy(true);
    const { error: err } = await db.from("tips").insert({ hike_slug: target.hike, trail_slug: target.trail ?? null, kind, body: body.trim() });
    setBusy(false);
    if (err) return setError("Couldn't save your tip — please try again.");
    setBody("");
    setError(null);
    onDone();
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.tipRow}>
        <label className={styles.field}>
          <span>Tip about</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as TipKind)}>
            {(Object.keys(TIP_KINDS) as TipKind[]).map((k) => (
              <option key={k} value={k}>
                {TIP_KINDS[k]}
              </option>
            ))}
          </select>
        </label>
        <label className={`${styles.field} ${styles.grow}`}>
          <span>Your tip</span>
          <input value={body} maxLength={500} onChange={(e) => setBody(e.target.value)} placeholder="e.g. Refill water at the footbridge" />
        </label>
      </div>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <PillButton type="submit" variant="outline" disabled={busy}>
        {busy ? "Adding…" : "Add tip"}
      </PillButton>
    </form>
  );
}
