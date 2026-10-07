import type { Metadata } from "next";
import Link from "next/link";

import InfoPage from "@/components/InfoPage/InfoPage";
import { hikeBySlug } from "@/lib/hikes";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The rules for using Great Hikes, photo credits, and an important note about hiking safety.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms of use"
      description="The ground rules — and a reminder that the mountains decide."
      image={hikeBySlug("plitvice-lakes-national-park")!.photo.src}
      updated="2026-10-07"
    >
      <h2>Using Great Hikes</h2>
      <p>
        By using this site you agree to these terms. Great Hikes is free for personal use. Please
        don&apos;t copy our content or photos in bulk, scrape the site, or use it for anything unlawful.
      </p>

      <h2>Hiking is at your own risk</h2>
      <p>
        Our guides are for inspiration and planning only. Trails, weather, access rules and permits
        change, and our information may be incomplete or out of date. You are responsible for your own
        safety: check conditions and rules with official sources, know your limits, carry the right
        gear, and turn back when in doubt. Great Hikes isn&apos;t liable for injury, loss or damage
        arising from using information on this site.
      </p>

      <h2>Photos and content</h2>
      <p>
        Photos belong to their photographers and are shown with their permission and credit. Text and
        design are © Great Hikes. Don&apos;t reuse photos without the photographer&apos;s permission. If
        you believe something here uses your work without permission, <Link href="/contact">contact us</Link>{" "}
        and we&apos;ll review and remove it promptly.
      </p>

      <h2>Your account</h2>
      <p>
        Keep access to your email secure — sign-in links are sent there. We may suspend accounts that
        abuse the site. You can ask us to delete your account at any time.
      </p>

      <h2>Links and partners</h2>
      <p>
        We link to other sites, including stores through <Link href="/affiliate-disclosure">affiliate links</Link>.
        We don&apos;t control those sites; purchases are between you and the store, under its terms.
        Prices and availability shown here may change.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms; the date at the top shows the latest version.</p>
    </InfoPage>
  );
}
