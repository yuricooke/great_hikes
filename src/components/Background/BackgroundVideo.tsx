"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

import styles from "./Background.module.css";

type Props = {
  src: string;
  poster: string;
};

// Video on every screen size (owner decision 2026-10-08), unless the visitor asked for reduced
// motion or has data saver on.
const VIDEO_OK = "(prefers-reduced-motion: no-preference)";

function subscribeVideo(onChange: () => void) {
  const query = window.matchMedia(VIDEO_OK);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function canPlayVideoNow() {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return window.matchMedia(VIDEO_OK).matches && !saveData;
}

/** True when a decorative background video may play (false during server render). */
export function useCanPlayVideo() {
  return useSyncExternalStore(subscribeVideo, canPlayVideoNow, () => false);
}

/**
 * Looping muted video behind the page. The optimized poster image is always painted first;
 * the video is only mounted when motion is welcome and data saver is off.
 */
export default function BackgroundVideo({ src, poster }: Props) {
  const playVideo = useCanPlayVideo();

  return (
    <div className={styles.layer} aria-hidden="true">
      <Image src={poster} alt="" fill priority sizes="100vw" quality={70} className={styles.media} />
      {playVideo && (
        <video className={styles.media} autoPlay muted loop playsInline preload="metadata">
          <source src={src} type="video/mp4" />
        </video>
      )}
      <div className={styles.scrimLight} />
    </div>
  );
}
