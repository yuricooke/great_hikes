import React from "react";

import FeedGallery from "../components/FeedGallery";

// Behold JSON feed of the @great_hikes account's own posts ("User" content type).
const FEED_URL = "https://feeds.behold.so/z6suMCUuC1CDmLXvx9RX";

export default function OurSelection() {
  return (
    <FeedGallery
      feedUrl={FEED_URL}
      title="Our selection"
      subtitle={<>Featured on <strong>@great_hikes</strong></>}
    />
  );
}
