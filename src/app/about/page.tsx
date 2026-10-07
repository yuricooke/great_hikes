import type { Metadata } from "next";
import Link from "next/link";

import InfoPage from "@/components/InfoPage/InfoPage";
import { hikeBySlug } from "@/lib/hikes";
import { INSTAGRAM_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Great Hikes is a community of hikers sharing the trails they love — how we choose hikes, credit photographers and check facts.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <InfoPage
      title="About Great Hikes"
      description="Great hikes from hikers for hikers — famous trails and hidden gems, photographed by the people who walked them."
      image={hikeBySlug("isle-of-skye")!.photo.src}
      updated="2026-10-07"
    >
      <h2>Who we are</h2>
      <p>
        Great Hikes began as <a href={INSTAGRAM_URL}>@great_hikes on Instagram</a>, a collective where
        hikers from around the world share their best trail photos. This site gives those places a
        home: the story of each hike, the facts you need to plan it, and the photographers who
        captured it. Great Hikes is run by Yuri Cooke, a hiker and designer.
      </p>

      <h2>How we choose hikes</h2>
      <p>
        Every hike here was either featured by our community or picked because hikers keep coming back
        to it. We cover famous treks and lesser-known trails on every continent, starting with the
        places our community photographs most.
      </p>

      <h2>Photos and credit</h2>
      <ul>
        <li>We only publish a community photo with the photographer&apos;s permission, and we always credit them by name or handle with a link.</li>
        <li>No photographer credit, no feature — we never post an uncredited photo.</li>
        <li>We post original photos only: no AI-generated or AI-edited images.</li>
      </ul>

      <h2>How we check facts</h2>
      <p>
        Distances, elevation, seasons, permits and access come from official sources — park
        authorities, tourism boards and government sites — listed at the bottom of every hike page with
        the date we checked them. Trails and rules change, so always confirm with the official source
        before you go. Spotted something out of date? <Link href="/contact">Tell us</Link>.
      </p>

      <h2>How we write the journal</h2>
      <p>
        Some journal guides are first drafted with the help of AI writing tools from official sources;
        every guide is reviewed and edited by a person before it is published, and lists its sources.
      </p>

      <h2>How the site is funded</h2>
      <p>
        Great Hikes is free to read. When you buy gear through some of our links we may earn a
        commission, at no extra cost to you. Partners never pay for a place in our guides. Read our{" "}
        <Link href="/affiliate-disclosure">affiliate disclosure</Link>.
      </p>

      <h2>Get in touch</h2>
      <p>
        Photographers, partners and hikers: <Link href="/contact">contact us</Link> or send a DM to{" "}
        <a href={INSTAGRAM_URL}>@great_hikes</a>.
      </p>
    </InfoPage>
  );
}
