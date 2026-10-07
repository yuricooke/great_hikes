import type { Metadata } from "next";
import Link from "next/link";

import InfoPage from "@/components/InfoPage/InfoPage";
import { hikeBySlug } from "@/lib/hikes";

export const metadata: Metadata = {
  title: "Affiliate disclosure",
  description: "How Great Hikes earns money from affiliate links, and how that does and doesn't affect what we recommend.",
  alternates: { canonical: "/affiliate-disclosure" },
};

export default function AffiliateDisclosurePage() {
  return (
    <InfoPage
      title="Affiliate disclosure"
      description="How we make money, in plain words."
      image={hikeBySlug("banff-national-park")!.photo.src}
      updated="2026-10-07"
    >
      <h2>The short version</h2>
      <p>
        Some links on Great Hikes are affiliate links. If you click one and buy something, the store
        may pay us a commission. You pay the same price. We label these links and pages where they
        appear.
      </p>

      <h2>Where you&apos;ll find affiliate links</h2>
      <ul>
        <li>Products in our <Link href="/shop">shop</Link> — each one opens the partner&apos;s store, where you buy directly from them.</li>
        <li>Gear suggestions in journal guides and on hike pages.</li>
        <li>Gear banners marked &ldquo;Sponsored&rdquo; or &ldquo;Partner&rdquo;.</li>
      </ul>
      <p>
        Affiliate links pass through a short Great Hikes address (/go/…) before reaching the store, so
        we can count clicks. We don&apos;t see who you are or what you buy — partners report only
        totals and commissions.
      </p>

      <h2>Who we work with</h2>
      <p>
        We join affiliate programs run by outdoor brands and retailers, usually through networks such as
        AvantLink. Partners don&apos;t pay to appear in our guides and don&apos;t review what we write
        before it&apos;s published.
      </p>

      <h2>How we pick products</h2>
      <p>
        We recommend gear that suits the hike — the season, terrain and weather — and that our community
        actually uses. A higher commission never decides what we recommend.
      </p>

      <h2>Questions</h2>
      <p>
        <Link href="/contact">Contact us</Link> any time.
      </p>
    </InfoPage>
  );
}
