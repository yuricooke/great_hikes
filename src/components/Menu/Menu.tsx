"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { INSTAGRAM_URL, SITE_NAME } from "@/lib/site";
import { useAuth } from "../Auth/AuthProvider";
import Icon, { type IconName } from "../Icon";
import styles from "./Menu.module.css";

type Item = { label: string; href: string; icon: IconName; external?: boolean; match?: string[] };

const MAIN: Item[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Hikes", href: "/hikes", icon: "hiking", match: ["/hikes", "/explore"] },
  { label: "Search", href: "/search", icon: "search" },
  { label: "Journal", href: "/journal", icon: "stories" },
  { label: "Community", href: "/community", icon: "groups" },
  { label: "Our feed", href: "/our-feed", icon: "photoLibrary" },
  { label: "Shop", href: "/shop", icon: "shoppingBag" },
];

function isActive(pathname: string, item: Item) {
  if (item.href === "/") return pathname === "/";
  return (item.match ?? [item.href]).some((m) => pathname.startsWith(m));
}

/** Glass rail on desktop; top bar with a drawer on phones. Account controls sit at the bottom. */
export default function Menu() {
  const pathname = usePathname();
  const { enabled, user } = useAuth();
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

  const close = () => setOpen(false);
  const link = (item: Item) => (
    <li key={item.label}>
      {item.external ? (
        <a href={item.href} className={styles.link} target="_blank" rel="noopener noreferrer">
          <Icon name={item.icon} size={26} />
          <span className={styles.label}>{item.label}</span>
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      ) : (
        <Link
          href={item.href}
          className={styles.link}
          onClick={close}
          scroll={item.href === "/login" ? false : undefined}
          aria-current={isActive(pathname, item) ? "page" : undefined}
        >
          <Icon name={item.icon} size={26} />
          <span className={styles.label}>{item.label}</span>
        </Link>
      )}
    </li>
  );

  const account: Item[] = [
    ...(enabled && user ? [{ label: "Favorites", href: "/favorites", icon: "favorite" as const }] : []),
    { label: "Instagram", href: INSTAGRAM_URL, icon: "photoCamera", external: true },
    ...(enabled ? [{ label: user ? "Account" : "Sign in", href: "/login", icon: "person" as const }] : []),
  ];

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.home} aria-label={`${SITE_NAME} home`} onClick={close}>
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
        <ul>{MAIN.map(link)}</ul>
        <ul className={styles.account}>{account.map(link)}</ul>
      </nav>
    </header>
  );
}
