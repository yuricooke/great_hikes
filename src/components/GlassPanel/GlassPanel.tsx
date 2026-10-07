import type { ComponentPropsWithoutRef, ElementType } from "react";

import styles from "./GlassPanel.module.css";

type Props<T extends ElementType> = {
  as?: T;
  /** light = home welcome box; regular = content panels; strong = dense text */
  tone?: "light" | "regular" | "strong";
  radius?: "panel" | "card";
} & ComponentPropsWithoutRef<T>;

/** Frosted-glass surface — the core of the Great Hikes identity. */
export default function GlassPanel<T extends ElementType = "div">({
  as,
  tone = "regular",
  radius = "panel",
  className,
  ...rest
}: Props<T>) {
  const Tag = as ?? "div";
  const classes = [styles.glass, styles[tone], styles[radius], className].filter(Boolean).join(" ");
  return <Tag className={classes} {...rest} />;
}
