import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AdBanner from "@/components/AdBanner/AdBanner";
import ArticleBody from "@/components/Article/ArticleBody";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import GlassPanel from "@/components/GlassPanel/GlassPanel";
import Hero from "@/components/Hero/Hero";
import PhotoCard from "@/components/PhotoCard/PhotoCard";
import PhotoCredit from "@/components/PhotoCredit/PhotoCredit";
import Rail from "@/components/Rail/Rail";
import { pickAd } from "@/lib/ads";
import { hikeBySlug, hikePath } from "@/lib/hikes";
import { articleBySlug, articlePath, articles } from "@/lib/journal";
import styles from "./article.module.css";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return articles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const article = articleBySlug((await params).slug);
  if (!article) return {};
  const cover = hikeBySlug(article.cover)!;
  return {
    title: article.title,
    description: article.lead,
    alternates: { canonical: articlePath(article) },
    robots: article.status !== "published" ? { index: false } : undefined,
    openGraph: { type: "article", title: article.title, description: article.lead, images: [{ url: cover.photo.src }] },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" });
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const article = articleBySlug((await params).slug);
  if (!article) notFound();
  const cover = hikeBySlug(article.cover)!;
  const related = article.relatedHikes.map((s) => hikeBySlug(s)!);
  const more = articles().filter((a) => a.slug !== article.slug);
  const section = article.kind === "guide" ? "Our content" : "Hikers' experiences";

  return (
    <article>
      <Hero image={cover.photo.src}>
        <div className={styles.heroInner}>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Journal", href: "/journal" }, { label: article.title }]} />
          <GlassPanel tone="light" className={styles.heroPanel}>
            <p className={styles.eyebrow}>
              {section}
              {article.status !== "published" && (
                <span className={styles.sample}>{article.status === "draft" ? "Draft" : "Sample"}</span>
              )}
            </p>
            <h1 className={styles.title}>{article.title}</h1>
            <p className={styles.lead}>{article.lead}</p>
            <p className={styles.meta}>
              By {article.author} · <time dateTime={article.date}>{formatDate(article.date)}</time> · {article.readMinutes} min read
            </p>
          </GlassPanel>
          <PhotoCredit photo={cover.photo} />
        </div>
      </Hero>

      <div className={styles.column}>
        <ArticleBody blocks={article.blocks} />
        {article.sources.length > 0 && (
          <section className={styles.sources} aria-labelledby="sources-title">
            <h2 id="sources-title" className={styles.sourcesTitle}>
              Sources
            </h2>
            <ul>
              {article.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className={styles.after}>
        <AdBanner ad={pickAd("article", { hikes: related })} />
        <Rail id="story-hikes" title="Hikes in this story" seeAllHref="/hikes" seeAllLabel="All hikes">
          {related.map((h) => (
            <PhotoCard key={h.slug} href={hikePath(h)} image={h.photo.src} title={h.title} subtitle={`${h.country} · ${h.continent}`} favoriteSlug={h.slug} />
          ))}
        </Rail>
        {more.length > 0 && (
          <Rail id="more-stories" title="More stories" seeAllHref="/journal" seeAllLabel="Journal">
            {more.map((a) => (
              <PhotoCard
                key={a.slug}
                href={articlePath(a)}
                image={hikeBySlug(a.cover)!.photo.src}
                title={a.title}
                subtitle={a.kind === "guide" ? "Our content" : "Hiker experience"}
                badge={a.status === "sample" ? "Sample" : undefined}
                aspect="landscape"
              />
            ))}
          </Rail>
        )}
      </div>
    </article>
  );
}
