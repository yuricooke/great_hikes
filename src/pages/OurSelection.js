import React from "react";

import FeedGallery from "../components/FeedGallery";

// Behold JSON feed of the @great_hikes account's own posts ("User" content type).
// TODO: paste the feed URL once it's created in Behold.
const FEED_URL = "";

export default function OurSelection() {
  return (
    <FeedGallery
      feedUrl={FEED_URL}
      title="Our selection"
      subtitle={<>Featured on <strong>@great_hikes</strong></>}
    />
  );
}
