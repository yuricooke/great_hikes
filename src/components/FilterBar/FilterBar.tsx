"use client";

import { useId } from "react";

import type { HikeFilters } from "@/lib/hike-utils";
import { CONTINENTS, DIFFICULTIES, LANDSCAPES } from "@/lib/schema";
import Icon from "../Icon";
import styles from "./FilterBar.module.css";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

type Key = keyof HikeFilters;
const OPTIONS: Record<Key, { label: string; options: { value: string; label: string }[] }> = {
  landscape: { label: "Landscape", options: LANDSCAPES.map((l) => ({ value: l.key, label: l.label })) },
  continent: { label: "Continent", options: CONTINENTS.map((c) => ({ value: c.key, label: c.name })) },
  difficulty: { label: "Difficulty", options: DIFFICULTIES.map((d) => ({ value: d, label: cap(d) })) },
  month: { label: "Best month", options: MONTHS.map((m, i) => ({ value: String(i + 1), label: m })) },
};

export function filterLabel(key: Key, value: string) {
  return OPTIONS[key].options.find((o) => o.value === value)?.label ?? value;
}

/**
 * Dropdowns for each filter; chosen values appear as removable tags ("Mountains ×").
 * Controlled: the parent keeps the state (URL on All hikes, local state on the landing page).
 */
export default function FilterBar({ value, onChange }: { value: HikeFilters; onChange: (key: Key, value: string | null) => void }) {
  const id = useId();
  const active = (Object.keys(OPTIONS) as Key[]).filter((k) => value[k]);
  return (
    <div className={styles.bar}>
      <div className={styles.selects}>
        {(Object.keys(OPTIONS) as Key[]).map((k) => (
          <label key={k} className={styles.field} htmlFor={`${id}-${k}`}>
            <span className={styles.label}>{OPTIONS[k].label}</span>
            <select id={`${id}-${k}`} value={value[k] ?? ""} onChange={(e) => onChange(k, e.target.value || null)}>
              <option value="">Any</option>
              {OPTIONS[k].options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {active.length > 0 && (
        <ul className={styles.tags} aria-label="Active filters">
          {active.map((k) => (
            <li key={k}>
              <button type="button" className={styles.tag} onClick={() => onChange(k, null)}>
                {filterLabel(k, value[k]!)}
                <Icon name="close" size={16} />
                <span className="visually-hidden"> — remove {OPTIONS[k].label.toLowerCase()} filter</span>
              </button>
            </li>
          ))}
          {active.length > 1 && (
            <li>
              <button type="button" className={styles.clear} onClick={() => active.forEach((k) => onChange(k, null))}>
                Clear all
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
