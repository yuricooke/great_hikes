"use client";

import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";

import { useCanPlayVideo } from "../Background/BackgroundVideo";
import styles from "./Hero.module.css";

const subscribeNothing = () => () => {};

/**
 * Muted looping video. While it loads the hero stays black (owner, 2026-10-12: no photo flash
 * before the video); the `fallback` photo is shown only when the video won't play (reduced
 * motion or data saver).
 */
export default function HeroVideo({ src, fallback }: { src: string; fallback: ReactNode }) {
  const play = useCanPlayVideo();
  // false during server render and hydration, so nothing is painted until we know which to show.
  const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);
  if (!mounted) return null;
  if (!play) return fallback;
  return (
    <video className={styles.video} autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
      <source src={src} type="video/mp4" />
    </video>
  );
}
