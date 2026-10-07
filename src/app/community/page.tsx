import type { Metadata } from "next";

import FeedGallery from "@/components/FeedGallery/FeedGallery";
import ListingHeader from "@/components/ListingHeader/ListingHeader";
import PillButton from "@/components/PillButton/PillButton";
import { communityPosts } from "@/lib/instagram";
import { allHikes } from "@/lib/hikes";
import styles from "../section.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our community",
  description: "Photos shared by hikers with #great_hikes on Instagram.",
  alternates: { canonical: "/community" },
};

export default async function CommunityPage() {
  const posts = await communityPosts();
  return (
    <>
      <ListingHeader
        image={posts[0]?.image.full ?? allHikes()[0].photo.src}
        title="Our community"
        description="Photos shared by hikers with #great_hikes on Instagram."
        meta={posts.length ? `${posts.length} photos` : undefined}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Our community" }]}
      >
        <div className={styles.actions}>
          <PillButton href="https://www.instagram.com/explore/tags/great_hikes/" external icon="photoCamera">
            #great_hikes on Instagram
          </PillButton>
        </div>
      </ListingHeader>
      <section className={styles.section}>
        <FeedGallery
          posts={posts}
          emptyText="New community photos are on their way — share yours with #great_hikes on Instagram."
        />
      </section>
    </>
  );
}
