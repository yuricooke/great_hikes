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

// Featured posts on @great_hikes follow "Place | @photographer" on the first line.
// Split that into a title and a photographer credit; the rest stays as caption.
export function parsePost(post, ownUsername) {
  const caption = cleanCaption(post.prunedCaption || post.caption);
  const [firstLine = "", ...rest] = caption.split("\n");
  const handle = (post.mentions || []).find((m) => m !== ownUsername) || null;

  let title = null;
  let body = caption;
  if (firstLine.includes("|")) {
    title = firstLine
      .split("|")
      .map((part) => part.replace(/@[\w.]+/g, "").replace(/[\s.]+$/, "").trim())
      .filter(Boolean)
      .join(" · ") || null;
    body = rest.join("\n");
  }
  body = body
    .replace(new RegExp(`^.*Use @${ownUsername}.*$`, "gim"), "")
    .trim();

  return { title, body, handle };
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

function PostText({ post, ownUsername, clamp = false }) {
  const { title, body, handle } = parsePost(post, ownUsername);
  return (
    <>
      {title && <h2 className="FeedGallery_Title">{title}</h2>}
      {handle && (
        <p className="FeedGallery_Credit">
          Photo:{" "}
          <a
            href={`https://www.instagram.com/${handle}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{handle}
          </a>
        </p>
      )}
      {body && (
        <p className={clamp ? "FeedGallery_Caption" : "FeedGallery_ModalCaption"}>{body}</p>
      )}
      {!title && !body && <p className="FeedGallery_Caption">No caption</p>}
    </>
  );
}

export default function FeedGallery({ feedUrl, title, subtitle }) {
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [zoomed, setZoomed] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
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
    setSlideIndex(0);
    if (zoomed && !dialog.open) dialog.showModal();
    if (!zoomed && dialog.open) dialog.close();
  }, [zoomed]);

  const posts = feed?.posts || [];
  const backgroundUrl = imageUrl(selected, "full");
  const zoomedSlides = zoomed?.children?.filter((c) => c.mediaType === "IMAGE") || [];
  const zoomedImage = zoomedSlides[slideIndex] || zoomed;

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
            <PostText post={selected} ownUsername={feed?.username} clamp />
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
            <div className="FeedGallery_ModalMedia">
              <img
                src={imageUrl(zoomedImage, "full")}
                alt={parsePost(zoomed, feed?.username).title || "Instagram post"}
              />
              {zoomedSlides.length > 1 && (
                <div className="FeedGallery_Slides">
                  {zoomedSlides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      className={index === slideIndex ? "is-selected" : ""}
                      onClick={() => setSlideIndex(index)}
                      aria-label={`Show image ${index + 1} of ${zoomedSlides.length}`}
                    >
                      <img src={imageUrl(slide, "small")} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="FeedGallery_ModalInfo">
              <PostText post={zoomed} ownUsername={feed?.username} />
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
