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
  { label: "Map", href: "/map", icon: "map" },
  { label: "Search", href: "/search", icon: "search" },
  { label: "Journal", href: "/journal", icon: "stories" },
  { label: "Shop", href: "/shop", icon: "shoppingBag" },
];

const MORE: Item[] = [
  { label: "Share your hike", href: "/share", icon: "add" },
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
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Hide while scrolling down; show again when scrolling up or near the top (owner request).
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < 80) setHidden(false);
        else if (y > last + 6) setHidden(true);
        else if (y < last - 6) setHidden(false);
        last = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
  // Always visible (phones and tablets too); /login says "coming soon" while sign-in is off.
  const account: Item = { label: user ? "Account" : "Sign in", href: "/login", icon: "person" };
  // Favorites is always one tap away; the page explains sign-in when needed.
  const favorites: Item = { label: "Favorites", href: "/favorites", icon: "favorite" };

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
    <header
      className={`${styles.header} ${hidden && !open ? styles.hidden : ""}`}
      onFocusCapture={() => setHidden(false)}
    >
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
        {/* Phones and tablets: Shop as an icon in the bar (wide screens show it as a text link). */}
        <Link
          href="/shop"
          className={`${styles.iconButton} ${styles.compactOnly}`}
          title="Shop"
          aria-current={pathname.startsWith("/shop") ? "page" : undefined}
        >
          <Icon name="shoppingBag" size={22} />
          <span className="visually-hidden">Shop</span>
        </Link>
        <Link
          href={favorites.href}
          className={styles.iconButton}
          title="Favorites"
          aria-current={isActive(pathname, favorites) ? "page" : undefined}
        >
          <Icon name="favorite" size={22} />
          <span className="visually-hidden">Favorites</span>
        </Link>
        <Link href={account.href} scroll={false} className={styles.iconButton} title={account.label}>
          <Icon name="person" size={22} />
          <span className="visually-hidden">{account.label}</span>
        </Link>
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
        <nav aria-label="Main">
          {/* The bar shows the primary links on wide screens (Shop as an icon on phones), so the card lists the rest. */}
          <ul className={`${styles.cardList} ${styles.cardPrimary}`}>
            {PRIMARY.filter((item) => item.href !== "/shop").map(cardLink)}
          </ul>
          <ul className={`${styles.cardList} ${styles.cardSecondary}`}>{MORE.map(cardLink)}</ul>
        </nav>
      </div>
    </header>
  );
}
