import type { Metadata } from "next";

import InfoPage from "@/components/InfoPage/InfoPage";
import ModerationQueue from "@/components/Share/ModerationQueue";
import { allHikes, hikeBySlug } from "@/lib/hikes";

export const metadata: Metadata = { title: "Moderation", robots: { index: false, follow: false } };

export default function ModerationPage() {
  const titles = Object.fromEntries(allHikes().map((h) => [h.slug, h.title]));
  return (
    <InfoPage title="Moderation" description="Photos shared by hikers, waiting for your review." image={hikeBySlug("isle-of-skye")!.photo.src}>
      <ModerationQueue titles={titles} />
    </InfoPage>
  );
}
