import type { Metadata } from "next";

import ContactForm from "@/components/Contact/ContactForm";
import InfoPage from "@/components/InfoPage/InfoPage";
import { hikeBySlug } from "@/lib/hikes";
import { INSTAGRAM_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about a hike, photo features, partnerships or your data — get in touch with Great Hikes.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact"
      description="Hikers, photographers and partners — we'd love to hear from you."
      image={hikeBySlug("torres-del-paine-national-park")!.photo.src}
    >
      <p>
        Send us a message below, or a DM to <a href={INSTAGRAM_URL}>@great_hikes</a> on Instagram.
        Photographers: tag @great_hikes or use #great_hikes to be considered for a feature.
      </p>
      <ContactForm />
    </InfoPage>
  );
}
