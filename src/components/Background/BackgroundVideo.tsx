"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

import styles from "./Background.module.css";

type Props = {
  src: string;
  poster: string;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Looping muted video behind the page. Visitors who prefer reduced motion (or before
 * hydration) see the poster image; the video is only mounted when motion is OK.
 */
export default function BackgroundVideo({ src, poster }: Props) {
  const playVideo = useSyncExternalStore(
    subscribe,
    () => !window.matchMedia(REDUCED_MOTION).matches,
    () => false, // server render: poster only
  );

  return (
    <div className={styles.layer} aria-hidden="true">
      <Image src={poster} alt="" fill priority sizes="100vw" quality={70} className={styles.media} />
      {playVideo && (
        <video className={styles.media} autoPlay muted loop playsInline poster={poster}>
          <source src={src} type="video/mp4" />
        </video>
      )}
      <div className={styles.scrimLight} />
    </div>
  );
}
