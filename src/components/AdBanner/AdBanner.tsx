import Image from "next/image";

import type { Ad } from "@/lib/ads";
import Icon from "../Icon";
import styles from "./AdBanner.module.css";

/** Sponsored banner (clearly labeled, FTC). Links out with rel="sponsored". */
export default function AdBanner({ ad }: { ad: Ad | null }) {
  if (!ad) return null;
  const external = ad.href.startsWith("http") || ad.href.startsWith("/go/");
  return (
    <aside className={styles.banner} aria-label={`Sponsored: ${ad.title}`} data-ad-id={ad.id}>
      <Image src={ad.image} alt="" fill sizes="100vw" quality={60} className={styles.image} />
      <div className={styles.content}>
        <p className={styles.label}>
          Sponsored · {ad.sponsor}
          {ad.status === "sample" && <span className={styles.sample}>Sample</span>}
        </p>
        <h2 className={styles.title}>{ad.title}</h2>
        <p className={styles.text}>{ad.text}</p>
        <a
          href={ad.href}
          className={styles.cta}
          {...(external ? { target: "_blank", rel: "sponsored noopener" } : {})}
        >
          {ad.cta}
          {external && <Icon name="openInNew" size={18} />}
          {external && <span className="visually-hidden"> (opens in a new tab)</span>}
        </a>
      </div>
    </aside>
  );
}
