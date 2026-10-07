"use client";

import { useCanPlayVideo } from "../Background/BackgroundVideo";
import styles from "./Hero.module.css";

/** Muted looping video over the hero's poster image (skipped on phones / reduced motion / data saver). */
export default function HeroVideo({ src }: { src: string }) {
  const play = useCanPlayVideo();
  if (!play) return null;
  return (
    <video className={styles.video} autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
      <source src={src} type="video/mp4" />
    </video>
  );
}
