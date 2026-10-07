import type { Metadata } from "next";

import LoginForm from "@/components/Auth/LoginForm";
import BackgroundVideo from "@/components/Background/BackgroundVideo";
import Brand from "@/components/Brand/Brand";
import GlassPanel from "@/components/GlassPanel/GlassPanel";
import { featuredHike } from "@/lib/featured";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

/** Full sign-in page (direct visits, refresh, shared links) with the hiking video, split layout. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;
  return (
    <div className={styles.split}>
      <GlassPanel tone="strong" className={styles.panel}>
        <Brand size="sm" />
        <LoginForm linkError={error === "link"} next={safeNext} />
      </GlassPanel>
      <div className={styles.media}>
        <BackgroundVideo src="/video/hikes.mp4" poster={featuredHike().photo.src} />
      </div>
    </div>
  );
}
