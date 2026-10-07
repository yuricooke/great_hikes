"use client";

import Link from "next/link";
import { useState } from "react";

import type { Trail } from "@/lib/schema";
import styles from "./Trail.module.css";

const LEVELS = ["easy", "moderate", "challenging", "strenuous"] as const;
const LABEL = { easy: "Easy", moderate: "Moderate", challenging: "Challenging", strenuous: "Strenuous" };

/** Trails of a place with a difficulty filter. */
export default function TrailList({
  trails,
  measuredKm,
  compact = false,
}: {
  trails: Trail[];
  measuredKm: Record<string, number>;
  /** Single column, no filter (side panels). */
  compact?: boolean;
}) {
  const [level, setLevel] = useState<(typeof LEVELS)[number] | null>(null);
  const present = LEVELS.filter((l) => trails.some((t) => t.details.difficulty === l));
  const shown = level ? trails.filter((t) => t.details.difficulty === level) : trails;

  return (
    <div className={styles.list}>
      {!compact && present.length > 1 && (
        <div className={styles.filters} role="group" aria-label="Filter trails by difficulty">
          <button type="button" aria-pressed={level === null} onClick={() => setLevel(null)}>
            All ({trails.length})
          </button>
          {present.map((l) => (
            <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)}>
              {LABEL[l]}
            </button>
          ))}
        </div>
      )}
      <ul className={compact ? `${styles.cards} ${styles.single}` : styles.cards}>
        {shown.map((t) => {
          const km = t.details.distanceKm ?? measuredKm[t.slug];
          return (
            <li key={t.slug}>
              <Link href={`/hikes/${t.place}/${t.slug}`} className={styles.card}>
                <span className={styles.cardName}>{t.name}</span>
                <span className={styles.cardMeta}>
                  {km ? `${km} km · ` : ""}
                  {t.details.duration} · {LABEL[t.details.difficulty]}
                </span>
                <span className={styles.cardSummary}>{t.summary}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
