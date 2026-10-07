"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { Post } from "@/lib/instagram";
import Icon from "../Icon";
import PillButton from "../PillButton/PillButton";
import styles from "./FeedGallery.module.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" });
}

function Credit({ handle }: { handle: string | null }) {
  if (!handle) return null;
  return (
    <p className={styles.credit}>
      Photo:{" "}
      <a href={`https://www.instagram.com/${handle}/`} target="_blank" rel="noopener noreferrer">
        @{handle}
      </a>
    </p>
  );
}

/** Grid of Instagram posts with a glass lightbox (carousel slides, caption, credit). */
export default function FeedGallery({ posts, emptyText }: { posts: Post[]; emptyText: string }) {
  const [open, setOpen] = useState<Post | null>(null);
  const [slide, setSlide] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Deep link from the landing: /our-feed#post-<id> opens that post.
  useEffect(() => {
    const id = window.location.hash.replace("#post-", "");
    const match = posts.find((p) => p.id === id);
    // Opening the lightbox for a hash in the URL syncs with the browser location.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (match) setOpen(match);
  }, [posts]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (posts.length === 0) return <p className={styles.empty}>{emptyText}</p>;

  const slides = open ? (open.slides.length > 1 ? open.slides : [open.image.full]) : [];

  return (
    <>
      <ul className={styles.grid} aria-label="Photos">
        {posts.map((post) => (
          <li key={post.id} id={`post-${post.id}`} className={styles.item}>
            <button
              type="button"
              className={styles.thumb}
              onClick={() => {
                setSlide(0);
                setOpen(post);
              }}
            >
              <Image src={post.image.medium} alt="" fill sizes="(min-width: 992px) 25vw, 50vw" className={styles.image} />
              <span className={styles.caption}>
                <span className={styles.title}>{post.title ?? "From Instagram"}</span>
                {post.handle && <span className={styles.handle}>@{post.handle}</span>}
              </span>
              <span className={styles.plus} aria-hidden="true">
                <Icon name="add" size={22} />
              </span>
              <span className="visually-hidden">Open photo{post.title ? `: ${post.title}` : ""}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={styles.modal}
        aria-label={open?.title ?? "Photo"}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
      >
        {open && (
          <div className={styles.modalBody}>
            <button type="button" className={styles.close} onClick={() => setOpen(null)}>
              <Icon name="close" size={24} />
              <span className="visually-hidden">Close</span>
            </button>
            <div className={styles.media}>
              <Image src={slides[slide] ?? open.image.full} alt={open.title ?? "Instagram photo"} fill sizes="70vw" className={styles.mediaImage} />
              {slides.length > 1 && (
                <div className={styles.slides}>
                  {slides.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      className={i === slide ? styles.slideActive : ""}
                      onClick={() => setSlide(i)}
                      aria-label={`Image ${i + 1} of ${slides.length}`}
                    >
                      <Image src={src} alt="" width={44} height={55} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.info}>
              {open.title && <h2 className={styles.modalTitle}>{open.title}</h2>}
              <Credit handle={open.handle} />
              {open.body && <p className={styles.body}>{open.body}</p>}
              <p className={styles.meta}>
                {formatDate(open.date)}
                {open.likes != null && <> · {open.likes} likes</>}
              </p>
              <PillButton href={open.permalink} external icon="openInNew">
                View on Instagram
              </PillButton>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
