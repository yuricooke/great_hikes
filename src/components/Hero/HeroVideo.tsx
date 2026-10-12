"use client";

import type { ReactNode } from "react";
import { useCallback, useState, useSyncExternalStore } from "react";

import { useCanPlayVideo } from "../Background/BackgroundVideo";
import styles from "./Hero.module.css";

const subscribeNothing = () => () => {};

/**
 * Muted looping video, autoplay, no controls. While it loads the hero stays black (owner,
 * 2026-10-12: no photo flash before the video); the `fallback` photo is shown only when the
 * video won't play (reduced motion, data saver, or the browser refuses autoplay, e.g. iOS Low
 * Power Mode, which would otherwise show a play button).
 */
export default function HeroVideo({ src, fallback }: { src: string; fallback: ReactNode }) {
  const canPlay = useCanPlayVideo();
  const [blocked, setBlocked] = useState(false);
  // false during server render and hydration, so nothing is painted until we know which to show.
  const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);

  // React sets `muted` only as a property; iOS Safari needs the attribute to allow autoplay.
  const start = useCallback((video: HTMLVideoElement | null) => {
    if (!video) return;
    video.muted = true;
    video.setAttribute("muted", "");
    video.play().catch((e: DOMException) => e.name === "NotAllowedError" && setBlocked(true));
  }, []);

  if (!mounted) return null;
  if (!canPlay || blocked) return fallback;
  return (
    <video
      ref={start}
      className={styles.video}
      autoPlay
      muted
      loop
      playsInline
      disablePictureInPicture
      disableRemotePlayback
      preload="auto"
      tabIndex={-1}
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
