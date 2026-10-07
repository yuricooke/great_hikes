import Image from "next/image";
import Link from "next/link";

import { SITE_NAME } from "@/lib/site";
import styles from "./Brand.module.css";

type Props = {
  size?: "sm" | "md" | "lg";
  /** Render the name as the page's h1 (home) or as plain text. */
  asHeading?: boolean;
  link?: boolean;
  stacked?: boolean;
};

const LOGO_WIDTH = { sm: 44, md: 80, lg: 200 } as const;

/** Logo + "Great Hikes" wordmark, underlined like the original design. */
export default function Brand({ size = "md", asHeading = false, link = false, stacked = false }: Props) {
  const Name = asHeading ? "h1" : "span";
  const width = LOGO_WIDTH[size];
  const inner = (
    <>
      <Image src="/great_hikes.svg" alt="" width={width} height={Math.round(width * 0.66)} priority />
      <Name className={styles.name}>{SITE_NAME}</Name>
    </>
  );
  const classes = [styles.brand, styles[size], stacked ? styles.stacked : ""].join(" ");
  return link ? (
    <Link href="/" className={classes} aria-label={`${SITE_NAME} home`}>
      {inner}
    </Link>
  ) : (
    <div className={classes}>{inner}</div>
  );
}
