import type { Metadata } from "next";

import ListingHeader from "@/components/ListingHeader/ListingHeader";
import PhotoCard from "@/components/PhotoCard/PhotoCard";
import { hikeBySlug } from "@/lib/hikes";
import { articlePath, articles, type Article } from "@/lib/journal";
import styles from "../section.module.css";
import grid from "./journal.module.css";

export const metadata: Metadata = {
  title: "Journal",
  description: "Guides from Great Hikes and experiences from hikers in our community.",
  alternates: { canonical: "/journal" },
};

function Section({ title, items }: { title: string; items: Article[] }) {
  if (items.length === 0) return null;
  return (
    <section className={styles.section} aria-labelledby={`${title}-h`}>
      <h2 id={`${title}-h`} className={styles.sectionTitle}>
        {title}
      </h2>
      <ul className={grid.grid}>
        {items.map((a) => (
          <li key={a.slug}>
            <PhotoCard
              href={articlePath(a)}
              image={hikeBySlug(a.cover)!.photo.src}
              title={a.title}
              subtitle={`${a.readMinutes} min read`}
              badge={a.status === "sample" ? "Sample" : undefined}
              aspect="landscape"
              sizes="(min-width: 992px) 33vw, 100vw"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function JournalPage() {
  const all = articles();
  const cover = all[0] ? hikeBySlug(all[0].cover)!.photo.src : "/hikes/machu-picchu.jpg";
  return (
    <>
      <ListingHeader
        image={cover}
        title="Journal"
        description="Guides from Great Hikes and experiences from hikers in our community."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Journal" }]}
      />
      <div className={grid.sections}>
        <Section title="Our content" items={articles("guide")} />
        <Section title="Hikers' experiences" items={articles("experience")} />
        {all.length === 0 && <p className={styles.muted}>Stories are coming soon.</p>}
      </div>
    </>
  );
}
