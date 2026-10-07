import type { Metadata } from "next";
import Link from "next/link";

import InfoPage from "@/components/InfoPage/InfoPage";
import { hikeBySlug } from "@/lib/hikes";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What personal data Great Hikes collects, why, who processes it and your rights.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy policy"
      description="We collect as little as we can, never sell it, and don't use advertising trackers."
      image={hikeBySlug("fiordland-national-park")!.photo.src}
      updated="2026-10-07"
    >
      <h2>Who is responsible</h2>
      <p>
        Great Hikes (great-hikes.vercel.app) is run by Yuri Cooke. For anything about your data, use
        our <Link href="/contact">contact form</Link>.
      </p>

      <h2>What we collect and why</h2>
      <ul>
        <li>
          <strong>Your account</strong> (if you sign in): your email address, display name and the
          hikes you save as favorites — so you can sign in and see your favorites on any device.
        </li>
        <li>
          <strong>Reviews and tips you post</strong>: shown publicly with your display name, the
          date and the hike. You can delete them at any time.
        </li>
        <li>
          <strong>Photos you share</strong>: the photo (resized, with location data removed), the
          credit name, optional Instagram handle and story. Approved photos are public with your
          credit; rejected photos are deleted.
        </li>
        <li>
          <strong>Messages you send us</strong>: your name, email and message — to reply to you. We
          delete messages within 12 months.
        </li>
        <li>
          <strong>Visit statistics</strong>: we use Vercel Web Analytics, which counts page views
          without cookies and without identifying you or following you across other sites.
        </li>
        <li>
          <strong>Server logs</strong>: our host processes your IP address and browser details to
          deliver pages and protect the site from abuse.
        </li>
      </ul>
      <p>We don&apos;t sell or rent personal data, and we don&apos;t use advertising cookies or trackers.</p>

      <h2>Cookies and storage</h2>
      <p>
        We only use cookies that the site needs: a sign-in cookie that keeps you signed in. We may keep
        small preferences in your browser&apos;s storage. Because we use no tracking cookies, we
        don&apos;t show a cookie banner.
      </p>

      <h2>Services that process data for us</h2>
      <ul>
        <li><strong>Vercel</strong> — hosting and visit statistics.</li>
        <li><strong>Supabase</strong> — accounts, favorites and messages.</li>
        <li><strong>Google</strong> — only if you choose &ldquo;Continue with Google&rdquo; to sign in.</li>
      </ul>
      <p>These providers may process data outside your country under their own safeguards.</p>

      <h2>Content from other sites</h2>
      <ul>
        <li>Hike maps are loaded from <strong>OpenStreetMap</strong>, which receives your IP address when the map loads.</li>
        <li>Instagram photos are served through <strong>Behold</strong> image servers.</li>
        <li>Weather forecasts come from <strong>MET Norway</strong> via our server — your data isn&apos;t sent to them.</li>
        <li>
          When you follow an <Link href="/affiliate-disclosure">affiliate link</Link>, you leave Great
          Hikes; the store&apos;s own privacy policy and cookies then apply.
        </li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can ask us to show, correct, export or delete your data, or to delete your account, at any
        time through the <Link href="/contact">contact form</Link>. Depending on where you live (for
        example the EU, UK or California), you may also have the right to object to processing and to
        complain to your data protection authority.
      </p>

      <h2>Children</h2>
      <p>Great Hikes isn&apos;t aimed at children under 16, and we don&apos;t knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>If we change this policy we&apos;ll update the date at the top, and tell signed-in members about important changes.</p>
    </InfoPage>
  );
}
