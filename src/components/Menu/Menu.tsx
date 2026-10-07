"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { INSTAGRAM_URL, SITE_NAME } from "@/lib/site";
import Icon, { type IconName } from "../Icon";
import styles from "./Menu.module.css";

type Item = { label: string; href: string; icon: IconName; external?: boolean };

const ITEMS: Item[] = [
  { label: "Hikes", href: "/hikes", icon: "hiking" },
  { label: "Instagram", href: INSTAGRAM_URL, icon: "photoCamera", external: true },
];

function isActive(pathname: string, href: string) {
  return href !== "/" && pathname.startsWith(href);
}

/** Glass rail on desktop; top bar with a drawer on phones. */
export default function Menu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const links = ITEMS.map((item) => {
    const content = (
      <>
        <Icon name={item.icon} size={28} />
        <span className={styles.label}>{item.label}</span>
      </>
    );
    return (
      <li key={item.href}>
        {item.external ? (
          <a href={item.href} className={styles.link} target="_blank" rel="noopener noreferrer">
            {content}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ) : (
          <Link
            href={item.href}
            className={styles.link}
            onClick={() => setOpen(false)}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
          >
            {content}
          </Link>
        )}
      </li>
    );
  });

  return (
    <header className={styles.header}>
      <Link
        href="/"
        className={styles.home}
        aria-label={`${SITE_NAME} home`}
        onClick={() => setOpen(false)}
      >
        <Image src="/great_hikes.svg" alt="" width={44} height={29} />
        <span className={styles.homeName}>{SITE_NAME}</span>
      </Link>

      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name={open ? "close" : "menu"} size={28} />
        <span className="visually-hidden">{open ? "Close menu" : "Open menu"}</span>
      </button>

      <nav id="site-nav" className={`${styles.nav} ${open ? styles.open : ""}`} aria-label="Main">
        <ul>{links}</ul>
      </nav>
    </header>
  );
}
