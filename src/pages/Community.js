import React from "react";

import FeedGallery from "../components/FeedGallery";

// Behold JSON feed of #great_hikes (advanced source via the Great Hikes Business Portfolio).
const FEED_URL = "https://feeds.behold.so/55drRZJL76ax5gl1tw7r";

export default function Community() {
  return (
    <FeedGallery
      feedUrl={FEED_URL}
      title="From the community"
      subtitle={<>Photos shared with <strong>#great_hikes</strong> on Instagram</>}
    />
  );
}
