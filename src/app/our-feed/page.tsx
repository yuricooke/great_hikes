import type { Metadata } from "next";

import FeedGallery from "@/components/FeedGallery/FeedGallery";
import ListingHeader from "@/components/ListingHeader/ListingHeader";
import PillButton from "@/components/PillButton/PillButton";
import { featuredPosts } from "@/lib/instagram";
import { allHikes } from "@/lib/hikes";
import { INSTAGRAM_URL } from "@/lib/site";
import styles from "../section.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our feed",
  description: "Hikers featured on @great_hikes — every photo credited to its photographer.",
  alternates: { canonical: "/our-feed" },
};

export default async function OurFeedPage() {
  const posts = await featuredPosts();
  return (
    <>
      <ListingHeader
        image={posts[0]?.image.full ?? allHikes()[0].photo.src}
        title="Our feed"
        description="Hikers featured on @great_hikes — every photo credited to its photographer."
        meta={posts.length ? `${posts.length} features` : undefined}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Our feed" }]}
      >
        <div className={styles.actions}>
          <PillButton href={INSTAGRAM_URL} external icon="photoCamera">
            Follow @great_hikes
          </PillButton>
        </div>
      </ListingHeader>
      <section className={styles.section}>
        <FeedGallery posts={posts} emptyText="Our latest features will appear here soon." />
      </section>
    </>
  );
}
