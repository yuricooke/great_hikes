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

/** Shown in the top bar on wide screens and in the menu card everywhere. */
const PRIMARY: Item[] = [
  { label: "Hikes", href: "/hikes", icon: "hiking", match: ["/hikes", "/explore"] },
  { label: "Search", href: "/search", icon: "search" },
  { label: "Journal", href: "/journal", icon: "stories" },
  { label: "Shop", href: "/shop", icon: "shoppingBag" },
];

const MORE: Item[] = [
  { label: "Community", href: "/community", icon: "groups" },
  { label: "Our feed", href: "/our-feed", icon: "photoLibrary" },
  { label: "Instagram", href: INSTAGRAM_URL, icon: "photoCamera", external: true },
];

function isActive(pathname: string, item: Item) {
  return (item.match ?? [item.href]).some((m) => pathname.startsWith(m));
}

/**
 * Floating navigation (owner request 2026-10-07): logo pill top-left; glass bar top-right with the
 * main links, account and a Menu button that opens a rounded card. Nothing touches the edges.
 */
export default function Menu() {
  const pathname = usePathname();
  const { enabled, user } = useAuth();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    cardRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!cardRef.current?.contains(target) && !toggleRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const close = () => setOpen(false);
  const account: Item | null = enabled ? { label: user ? "Account" : "Sign in", href: "/login", icon: "person" } : null;
  const favorites: Item | null = enabled && user ? { label: "Favorites", href: "/favorites", icon: "favorite" } : null;

  const cardLink = (item: Item) => (
    <li key={item.label}>
      {item.external ? (
        <a href={item.href} className={styles.cardLink} target="_blank" rel="noopener noreferrer" onClick={close}>
          <Icon name={item.icon} size={24} />
          <span>{item.label}</span>
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      ) : (
        <Link
          href={item.href}
          className={styles.cardLink}
          onClick={close}
          scroll={item.href === "/login" ? false : undefined}
          aria-current={isActive(pathname, item) ? "page" : undefined}
        >
          <Icon name={item.icon} size={24} />
          <span>{item.label}</span>
        </Link>
      )}
    </li>
  );

  return (
    <header className={styles.header}>
      <Link href="/" className={`${styles.pill} ${styles.logo}`} aria-label={`${SITE_NAME} home`}>
        <Image src="/great_hikes.svg" alt="" width={40} height={26} priority />
        <span className={styles.logoName}>{SITE_NAME}</span>
      </Link>

      <div className={`${styles.pill} ${styles.bar}`}>
        <nav aria-label="Primary" className={styles.primary}>
          <ul>
            {PRIMARY.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className={styles.barLink} aria-current={isActive(pathname, item) ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {favorites && (
          <Link href={favorites.href} className={styles.iconButton} aria-current={isActive(pathname, favorites) ? "page" : undefined}>
            <Icon name="favorite" size={22} />
            <span className="visually-hidden">Favorites</span>
          </Link>
        )}
        {account && (
          <Link href={account.href} scroll={false} className={styles.iconButton}>
            <Icon name="person" size={22} />
            <span className="visually-hidden">{account.label}</span>
          </Link>
        )}
        <button
          ref={toggleRef}
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} size={22} />
          <span className={styles.menuLabel}>Menu</span>
        </button>
      </div>

      <div
        ref={cardRef}
        id="site-menu"
        className={`${styles.card} ${open ? styles.cardOpen : ""}`}
        hidden={!open}
      >
        <div className={styles.cardHeader}>
          <span className={styles.cardBrand}>
            <Image src="/great_hikes.svg" alt="" width={34} height={22} />
            {SITE_NAME}
          </span>
          <button type="button" className={styles.close} onClick={() => setOpen(false)}>
            <Icon name="close" size={22} />
            <span className="visually-hidden">Close menu</span>
          </button>
        </div>
        <nav aria-label="Main">
          <ul className={styles.cardList}>
            {cardLink({ label: "Home", href: "/", icon: "home", match: [] })}
            {PRIMARY.map(cardLink)}
          </ul>
          <ul className={`${styles.cardList} ${styles.cardSecondary}`}>
            {MORE.map(cardLink)}
            {favorites && cardLink(favorites)}
            {account && cardLink(account)}
          </ul>
        </nav>
      </div>
    </header>
  );
}
