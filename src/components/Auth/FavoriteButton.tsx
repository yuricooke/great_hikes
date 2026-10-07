"use client";

import Link from "next/link";

import Icon from "../Icon";
import { useAuth } from "./AuthProvider";
import styles from "./FavoriteButton.module.css";

type Props = { slug: string; title: string; variant?: "overlay" | "pill" };

/** Heart toggle. Signed out: links to sign-in (opens the pop-up). Hidden when sign-in is off. */
export default function FavoriteButton({ slug, title, variant = "overlay" }: Props) {
  const { enabled, user, isFavorite, toggleFavorite } = useAuth();
  if (!enabled) return null;
  const className = `${styles.button} ${styles[variant]}`;

  if (!user) {
    return (
      <Link href="/login" scroll={false} className={className}>
        <Icon name="favorite" size={22} />
        {variant === "pill" ? <span>Save</span> : <span className="visually-hidden">Sign in to save {title}</span>}
      </Link>
    );
  }

  const saved = isFavorite(slug);
  return (
    <button
      type="button"
      className={`${className} ${saved ? styles.saved : ""}`}
      aria-pressed={saved}
      onClick={() => toggleFavorite(slug)}
    >
      <Icon name={saved ? "favoriteFilled" : "favorite"} size={22} />
      {variant === "pill" ? (
        <span>{saved ? "Saved" : "Save"}</span>
      ) : (
        <span className="visually-hidden">{saved ? `Remove ${title} from favorites` : `Save ${title} to favorites`}</span>
      )}
    </button>
  );
}
