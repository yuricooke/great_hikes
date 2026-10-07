import type { Metadata } from "next";

import MapExplorer from "@/components/MapExplorer/MapExplorer";
import { mapItems } from "@/lib/map-data";

export const metadata: Metadata = {
  title: "Map",
  description: "Find a hike on the map — every Great Hikes place and trail, filtered by landscape, difficulty and season.",
  alternates: { canonical: "/map" },
};

export default async function MapPage() {
  return <MapExplorer items={await mapItems()} />;
}
