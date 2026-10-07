import Image from "next/image";
import Link from "next/link";

import { INSTAGRAM_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import Icon from "../Icon";
import styles from "./Footer.module.css";

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "All hikes", href: "/hikes" },
      { label: "Our top 10", href: "/explore/top-10" },
      { label: "Search", href: "/search" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Our community", href: "/community" },
      { label: "Our feed", href: "/our-feed" },
    ],
  },
  {
    title: "Shop",
    links: [{ label: "Gear we trust", href: "/shop" }],
  },
  {
    title: "Great Hikes",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Affiliate disclosure", href: "/affiliate-disclosure" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo} aria-label={`${SITE_NAME} home`}>
            <Image src="/great_hikes.svg" alt="" width={44} height={29} />
            <span>{SITE_NAME}</span>
          </Link>
          <p className={styles.tagline}>{SITE_TAGLINE}.</p>
          <a href={INSTAGRAM_URL} className={styles.social} target="_blank" rel="noopener noreferrer">
            <Icon name="photoCamera" size={20} />
            Follow @great_hikes
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={`Footer: ${col.title}`} className={styles.column}>
            <h2 className={styles.heading}>{col.title}</h2>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label}
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <Link href={link.href}>{link.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className={styles.bottom}>
        <p>
          © {year} {SITE_NAME}. Photos © their photographers, credited on every image.
        </p>
        <p>
          Some links are affiliate links: we may earn a commission at no extra cost to you.{" "}
          <Link href="/affiliate-disclosure">How we make money</Link>
        </p>
      </div>
    </footer>
  );
}
