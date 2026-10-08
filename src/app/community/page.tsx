import { permanentRedirect } from "next/navigation";

/**
 * Owner policy 2026-10-08: we no longer show every #great_hikes post on the web — only the features
 * the owner posts on @great_hikes (curated, credited, with permission). Old links go to Our feed.
 */
export default function CommunityPage() {
  permanentRedirect("/our-feed");
}
