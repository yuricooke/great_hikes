import type { Metadata } from "next";
import { Suspense } from "react";

import HikeBrowser, { type BrowserHike } from "@/components/HikeBrowser/HikeBrowser";
import HikeBrowserWithParams from "@/components/HikeBrowser/HikeBrowserWithParams";
import { allHikes } from "@/lib/hikes";

export const metadata: Metadata = {
  title: "Hikes",
  description: "Browse great hikes on every continent — from Patagonia to the Himalayas.",
  alternates: { canonical: "/hikes" },
  openGraph: { images: [{ url: allHikes()[0].photo.src }] },
};

export default function HikesPage() {
  // Only the fields the browser needs are sent to the client.
  const hikes: BrowserHike[] = allHikes().map(({ slug, title, continent, country, description, photo }) => ({
    slug,
    title,
    continent,
    country,
    description,
    photo,
  }));

  return (
    <Suspense fallback={<HikeBrowser hikes={hikes} continentParam={null} />}>
      <HikeBrowserWithParams hikes={hikes} />
    </Suspense>
  );
}
