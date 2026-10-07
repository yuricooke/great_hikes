import React, { useEffect, useRef, useState } from "react";

import Menu from "./Menu";
import Background from "./Background";

import "./FeedGallery.css";

// Instagram captions often glue hashtags together ("#a#b#c") and use lines of
// dots/asterisks as spacers. Split the hashtags so text can wrap, and drop spacer lines.
export function cleanCaption(caption = "") {
  return caption
    .replace(/(\S)#/g, "$1 #")
    .replace(/(^|[ \t])#(?=\s|$)/gm, "$1")
    .split("\n")
    .filter((line) => !/^[\s.*•▪_\-#]*$/.test(line))
    .join("\n")
    .trim();
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function imageUrl(post, size) {
  return post?.sizes?.[size]?.mediaUrl || post?.mediaUrl || "";
}

export default function FeedGallery({ feedUrl, title, subtitle }) {
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [zoomed, setZoomed] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!feedUrl) return;
    fetch(feedUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Feed responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setFeed(data);
        setSelected(data.posts?.[0] || null);
      })
      .catch((err) => setError(err.message));
  }, [feedUrl]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (zoomed && !dialog.open) dialog.showModal();
    if (!zoomed && dialog.open) dialog.close();
  }, [zoomed]);

  const posts = feed?.posts || [];
  const backgroundUrl = imageUrl(selected, "full");

  return (
    <div className="FeedGallery">
      <Background backgroundImage={backgroundUrl ? `url(${backgroundUrl})` : ""} />
      <Menu />

      <div className="FeedGallery_Content">
        <div className="FeedGallery_Header">
          <img src="/great_hikes.svg" alt="" width="70px" />
          <div>
            <h1>{title}</h1>
            <p>
              {subtitle}
              {feed && <> · {posts.length} posts</>}
            </p>
          </div>
        </div>

        {!feedUrl && <p className="FeedGallery_Status">This feed isn't connected yet.</p>}
        {error && <p className="FeedGallery_Status">Couldn't load the feed: {error}</p>}
        {feedUrl && !feed && !error && <p className="FeedGallery_Status">Loading photos…</p>}

        {selected && (
          <div className="FeedGallery_Selected">
            <p className="FeedGallery_Caption">
              {cleanCaption(selected.prunedCaption || selected.caption) || "No caption"}
            </p>
            <p className="FeedGallery_Meta">
              {formatDate(selected.timestamp)}
              {selected.likeCount != null && <> · {selected.likeCount} likes</>}
            </p>
            <div className="FeedGallery_Actions">
              <button
                type="button"
                className="FeedGallery_Pill"
                onClick={() => setZoomed(selected)}
              >
                View photo
              </button>
              <a
                className="FeedGallery_Pill"
                href={selected.permalink}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Instagram
              </a>
            </div>
          </div>
        )}

        <div className="FeedGallery_Grid">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`FeedGallery_Card${post.id === selected?.id ? " is-selected" : ""}`}
            >
              <button
                type="button"
                className="FeedGallery_Thumb"
                onClick={() => setSelected(post)}
                aria-label={`Show post from ${formatDate(post.timestamp)}`}
              >
                <img src={imageUrl(post, "small")} alt="" loading="lazy" />
              </button>
              <button
                type="button"
                className="FeedGallery_Zoom"
                onClick={() => setZoomed(post)}
                aria-label={`Open photo from ${formatDate(post.timestamp)}`}
              >
                <span className="material-symbols-outlined" aria-hidden="true">add</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="FeedGallery_Modal"
        onClose={() => setZoomed(null)}
        onClick={(e) => e.target === e.currentTarget && setZoomed(null)}
        aria-label="Photo"
      >
        {zoomed && (
          <div className="FeedGallery_ModalBody">
            <button
              type="button"
              className="FeedGallery_Close"
              onClick={() => setZoomed(null)}
              aria-label="Close"
            >
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
            <img
              src={imageUrl(zoomed, "full")}
              alt={cleanCaption(zoomed.prunedCaption).slice(0, 120) || "Instagram post"}
            />
            <div className="FeedGallery_ModalInfo">
              <p className="FeedGallery_ModalCaption">
                {cleanCaption(zoomed.prunedCaption || zoomed.caption)}
              </p>
              <p className="FeedGallery_Meta">
                {formatDate(zoomed.timestamp)}
                {zoomed.likeCount != null && <> · {zoomed.likeCount} likes</>}
              </p>
              <a
                className="FeedGallery_Pill"
                href={zoomed.permalink}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Instagram
              </a>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
