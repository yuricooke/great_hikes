"use client";

import type { Hike } from "@/lib/schema";
import { useAuth } from "../Auth/AuthProvider";
import HikeGrid from "../HikeGrid/HikeGrid";
import PillButton from "../PillButton/PillButton";
import styles from "./FavoritesList.module.css";

/** Signed-in user's saved hikes; signed-out visitors get a sign-in prompt. */
export default function FavoritesList({ hikes }: { hikes: Hike[] }) {
  const { enabled, user, ready, favorites } = useAuth();

  if (!ready) return null;
  if (!enabled) return <p className={styles.note}>Favorites arrive with accounts — coming soon.</p>;
  if (!user) {
    return (
      <div className={styles.prompt}>
        <p>Sign in to save hikes and find them here on any visit.</p>
        <PillButton href="/login" variant="accent" icon="person">
          Sign in
        </PillButton>
      </div>
    );
  }

  const saved = favorites.map((s) => hikes.find((h) => h.slug === s)).filter((h): h is Hike => Boolean(h));
  if (saved.length === 0) {
    return (
      <div className={styles.prompt}>
        <p>No favorites yet — tap the heart on any hike to save it.</p>
        <PillButton href="/hikes" icon="hiking">
          Browse hikes
        </PillButton>
      </div>
    );
  }
  return (
    <>
      <p className={styles.note}>
        {saved.length} saved {saved.length === 1 ? "hike" : "hikes"} · signed in as {user.name}
      </p>
      <HikeGrid hikes={saved} />
    </>
  );
}
