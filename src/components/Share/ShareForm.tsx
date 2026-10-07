"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "../Auth/AuthProvider";
import PillButton from "../PillButton/PillButton";
import styles from "./Share.module.css";

const NEW_PLACE = "__new__";
const MAX = 2400;

/** Resize in the browser (max 2400 px, JPEG). Re-encoding also drops EXIF, including GPS. */
async function prepare(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.9),
  );
  return { blob, width, height };
}

export default function ShareForm({ places, initialPlace = "" }: { places: { slug: string; title: string }[]; initialPlace?: string }) {
  const { mode, user, ready } = useAuth();
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [place, setPlace] = useState(initialPlace);
  const [placeName, setPlaceName] = useState("");
  const [country, setCountry] = useState("");
  const [credit, setCredit] = useState("");
  const [handle, setHandle] = useState("");
  const [story, setStory] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!ready) return null;
  if (mode !== "supabase") {
    return <p className={styles.note}>Sharing opens with member sign-in — coming soon. Until then, tag @great_hikes on Instagram.</p>;
  }
  if (!user) {
    return (
      <div className={styles.note}>
        <p>Sign in to share your photo — it takes one email link.</p>
        <PillButton href="/login" variant="accent" icon="person">
          Sign in
        </PillButton>
      </div>
    );
  }
  if (done) {
    return (
      <div role="status" className={styles.done}>
        <h2>Thanks — your hike is in!</h2>
        <p>We review every photo by hand. Once it&apos;s approved it appears on the hike page with your credit.</p>
        <PillButton variant="outline" onClick={() => window.location.reload()}>
          Share another
        </PillButton>
      </div>
    );
  }

  function choose(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return setError("Use a JPEG, PNG or WebP photo.");
    if (f.size > 30 * 1024 * 1024) return setError("That photo is over 30 MB — please pick a smaller one.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return setError("Choose a photo first.");
    if (!place) return setError("Tell us where the photo was taken.");
    if (place === NEW_PLACE && (placeName.trim().length < 2 || country.trim().length < 2)) {
      return setError("Add the place name and country.");
    }
    if (credit.trim().length < 2) return setError("Add the name we should credit.");
    const ig = handle.trim().replace(/^@/, "");
    if (ig && !/^[A-Za-z0-9._]{1,30}$/.test(ig)) return setError("That doesn't look like an Instagram handle.");
    if (!agree) return setError("Please confirm the photo is yours and agree to the license.");
    const db = supabaseBrowser();
    if (!db || !user?.id) return setError("Sign-in expired — please sign in again.");

    setBusy(true);
    try {
      const { blob, width, height } = await prepare(file);
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const up = await db.storage.from("submissions").upload(path, blob, { contentType: "image/jpeg" });
      if (up.error) throw up.error;
      const { error: err } = await db.from("submissions").insert({
        hike_slug: place === NEW_PLACE ? null : place,
        place_name: place === NEW_PLACE ? placeName.trim() : null,
        country: place === NEW_PLACE ? country.trim() : null,
        credit_name: credit.trim(),
        instagram_handle: ig || null,
        story: story.trim() || null,
        image_path: path,
        width,
        height,
        license_accepted: true,
      });
      if (err) throw err;
      setDone(true);
    } catch {
      setError("Upload failed — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <label className={styles.drop}>
        {preview ? (
          <Image src={preview} alt="Your photo" width={640} height={420} className={styles.preview} unoptimized />
        ) : (
          <span>Choose a photo (JPEG, PNG or WebP)</span>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => choose(e.target.files?.[0])} aria-label="Photo" />
      </label>

      <label className={styles.field}>
        <span>Where was it taken?</span>
        <select value={place} onChange={(e) => setPlace(e.target.value)}>
          <option value="">Choose a hike…</option>
          {places.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title}
            </option>
          ))}
          <option value={NEW_PLACE}>A place not on Great Hikes yet</option>
        </select>
      </label>
      {place === NEW_PLACE && (
        <div className={styles.row}>
          <label className={styles.field}>
            <span>Place name</span>
            <input value={placeName} onChange={(e) => setPlaceName(e.target.value)} maxLength={120} placeholder="e.g. Jumbo Pass" />
          </label>
          <label className={styles.field}>
            <span>Country</span>
            <input value={country} onChange={(e) => setCountry(e.target.value)} maxLength={80} />
          </label>
        </div>
      )}
      <div className={styles.row}>
        <label className={styles.field}>
          <span>Credit as</span>
          <input value={credit} onChange={(e) => setCredit(e.target.value)} maxLength={80} placeholder={user.name} autoComplete="name" />
        </label>
        <label className={styles.field}>
          <span>Instagram (optional)</span>
          <input value={handle} onChange={(e) => setHandle(e.target.value)} maxLength={31} placeholder="@yourhandle" />
        </label>
      </div>
      <label className={styles.field}>
        <span>Your story or best tip (optional)</span>
        <textarea rows={4} maxLength={1000} value={story} onChange={(e) => setStory(e.target.value)} placeholder="When you went, how it felt, what the next hiker should know…" />
      </label>
      <label className={styles.check}>
        <input id={`${id}-agree`} type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>
          I took this photo and everyone recognisable in it agreed to share it. I give Great Hikes a
          free, non-exclusive license to show it on the site and @great_hikes with my credit. I keep my
          copyright and can ask for removal any time. <Link href="/terms">Terms</Link>
        </span>
      </label>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <PillButton type="submit" variant="accent" size="lg" disabled={busy}>
        {busy ? "Uploading…" : "Share my hike"}
      </PillButton>
    </form>
  );
}
