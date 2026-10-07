"use client";

import { useEffect, useRef, type ReactNode } from "react";

import styles from "./Hero.module.css";

/**
 * Media layer behind the hero. With `parallax`, it moves slower than the page while scrolling
 * (disabled for reduced motion).
 */
export default function ParallaxLayer({ parallax, children }: { parallax: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!parallax || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.min(window.scrollY, window.innerHeight * 1.2);
      el.style.transform = `translate3d(0, ${y * 0.4}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [parallax]);

  return (
    <div ref={ref} className={`${styles.mediaLayer} ${parallax ? styles.parallax : ""}`} aria-hidden="true">
      {children}
    </div>
  );
}
