"use client";

import { useSearchParams } from "next/navigation";

import HikeBrowser, { type BrowserHike } from "./HikeBrowser";

/** Reads `?continent=` on the client so the hikes page itself stays static. */
export default function HikeBrowserWithParams({ hikes }: { hikes: BrowserHike[] }) {
  const continentParam = useSearchParams().get("continent");
  return <HikeBrowser hikes={hikes} continentParam={continentParam} />;
}
