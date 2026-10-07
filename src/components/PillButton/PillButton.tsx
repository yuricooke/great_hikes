import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import Icon, { type IconName } from "../Icon";
import styles from "./PillButton.module.css";

type Common = {
  children: ReactNode;
  icon?: IconName;
  variant?: "dark" | "accent" | "outline";
  size?: "md" | "lg";
  className?: string;
};

type AsLink = Common & { href: string; external?: boolean } & Omit<
    ComponentPropsWithoutRef<"a">,
    "href" | "className" | "children"
  >;
type AsButton = Common & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<"button">,
    "className" | "children"
  >;

/** Rounded "pill" control — renders a link when given href, otherwise a button. */
export default function PillButton(props: AsLink | AsButton) {
  const { children, icon, variant = "dark", size = "md", className, ...rest } = props;
  const classes = [styles.pill, styles[variant], styles[size], className].filter(Boolean).join(" ");
  const content = (
    <>
      {icon && <Icon name={icon} size={size === "lg" ? 24 : 20} />}
      <span>{children}</span>
    </>
  );

  if (rest.href !== undefined) {
    const { href, external, ...anchorProps } = rest as AsLink;
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...anchorProps}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {content}
      </Link>
    );
  }

  const buttonProps = rest as Omit<AsButton, keyof Common>;
  return (
    <button type="button" className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
