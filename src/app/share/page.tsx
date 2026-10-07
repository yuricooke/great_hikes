import type { Metadata } from "next";

import InfoPage from "@/components/InfoPage/InfoPage";
import ShareForm from "@/components/Share/ShareForm";
import { allHikes, hikeBySlug } from "@/lib/hikes";

export const metadata: Metadata = {
  title: "Share your hike",
  description: "Share your hiking photo with the Great Hikes community — every photo is credited to you.",
  alternates: { canonical: "/share" },
};

export default async function SharePage({ searchParams }: { searchParams: Promise<{ hike?: string }> }) {
  const { hike } = await searchParams;
  const places = allHikes()
    .map((h) => ({ slug: h.slug, title: h.title }))
    .sort((a, b) => a.title.localeCompare(b.title));
  return (
    <InfoPage
      title="Share your hike"
      description="Hikes from hikers, for hikers. Add your photo and your best tip — we credit every photo to the hiker who took it."
      image={hikeBySlug("los-glaciares-national-park")!.photo.src}
    >
      <ShareForm places={places} initialPlace={hike && hikeBySlug(hike) ? hike : ""} />
    </InfoPage>
  );
}
