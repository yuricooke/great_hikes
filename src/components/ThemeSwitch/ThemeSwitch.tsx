"use client";

import { useSyncExternalStore } from "react";

import { THEME_COLOR, THEME_KEY, type Theme } from "@/lib/theme";
import styles from "./ThemeSwitch.module.css";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const current = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage blocked — the choice lasts for this visit */
  }
}

/** "Appearance: Dark / Light" segmented control (lives in the menu card). */
export default function ThemeSwitch() {
  const theme = useSyncExternalStore(subscribe, current, () => "dark" as Theme);
  return (
    <div className={styles.switch} role="radiogroup" aria-label="Appearance">
      <span className={styles.label} aria-hidden="true">
        Appearance
      </span>
      <div className={styles.options}>
        {(["dark", "light"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={theme === t}
            className={styles.option}
            onClick={() => setTheme(t)}
          >
            {t === "dark" ? "Dark" : "Light"}
          </button>
        ))}
      </div>
    </div>
  );
}
