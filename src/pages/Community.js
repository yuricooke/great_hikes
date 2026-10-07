import React, { useEffect, useState } from "react";

import Menu from "../components/Menu";
import Background from "../components/Background";

import "./Community.css";

// Behold JSON feed of #great_hikes (advanced source via the Great Hikes Business Portfolio).
const FEED_URL = "https://feeds.behold.so/55drRZJL76ax5gl1tw7r";

export default function Community() {
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(FEED_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Feed responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setFeed(data);
        setSelected(data.posts?.[0] || null);
      })
      .catch((err) => setError(err.message));
  }, []);

  const posts = feed?.posts || [];
  const backgroundUrl = selected?.sizes?.full?.mediaUrl || selected?.mediaUrl || "";

  return (
    <div className="Community">
      <Background backgroundImage={backgroundUrl ? `url(${backgroundUrl})` : ""} />
      <Menu />

      <div className="Community_Content">
        <div className="Community_Header">
          <img src="/great_hikes.svg" alt="" width="70px" />
          <div>
            <h1>From the community</h1>
            <p>
              Photos shared with <strong>#great_hikes</strong> on Instagram.
              {feed && <> · {posts.length} posts · @{feed.username}</>}
            </p>
          </div>
        </div>

        {error && <p className="Community_Status">Couldn't load the feed: {error}</p>}
        {!feed && !error && <p className="Community_Status">Loading photos…</p>}

        {selected && (
          <div className="Community_Selected">
            <p className="Community_Caption">
              {selected.prunedCaption || "No caption"}
            </p>
            <p className="Community_Meta">
              {new Date(selected.timestamp).toLocaleDateString("en", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {selected.likeCount != null && <> · {selected.likeCount} likes</>}
            </p>
            <a
              className="Community_Link"
              href={selected.permalink}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Instagram
            </a>
          </div>
        )}

        <div className="Community_Grid">
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              className={`Community_Card${post.id === selected?.id ? " is-selected" : ""}`}
              onClick={() => setSelected(post)}
              aria-label={`Show post from ${post.timestamp.slice(0, 10)}`}
            >
              <img
                src={post.sizes?.small?.mediaUrl || post.mediaUrl}
                alt={post.prunedCaption?.slice(0, 120) || "Instagram post"}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
