import Image from "next/image";
import Link from "next/link";

import type { Hike } from "@/lib/schema";
import styles from "./HikeCard.module.css";

type CardHike = Pick<Hike, "slug" | "title" | "continent" | "country" | "photo">;

type Props = {
  hike: CardHike;
  /** Link to the hike page, or act as a selection button (hikes browser). */
  href?: string;
  onSelect?: () => void;
  selected?: boolean;
};

/** Glass card with photo and title — the hike list item from the original design. */
export default function HikeCard({ hike, href, onSelect, selected = false }: Props) {
  const body = (
    <>
      <Image
        src={hike.photo.src}
        alt=""
        width={150}
        height={100}
        sizes="150px"
        quality={60}
        className={styles.image}
      />
      <span className={styles.info}>
        <span className={styles.title}>{hike.title}</span>
        <span className={styles.place}>
          {hike.continent} <span aria-hidden="true">|</span> {hike.country}
        </span>
      </span>
    </>
  );

  const classes = [styles.card, selected ? styles.selected : ""].join(" ");
  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} onClick={onSelect} aria-pressed={selected}>
      {body}
    </button>
  );
}
