import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getArticle, articles, type Lang } from "@/lib/blog";
import ArticleClient from "./ArticleClient";

const BASE_URL = "https://electro-motors.top";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

function langFrom(value: string | undefined): Lang {
  return value === "ru" || value === "en" ? value : "ua";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    return { title: "Статтю не знайдено — Electro Motors" };
  }
  const cookieStore = await cookies();
  const lang = langFrom(cookieStore.get("locale")?.value);
  const title = `${article.title[lang]} — Electro Motors`;
  const description = article.excerpt[lang];
  const url = `${BASE_URL}/blog/${article.slug}`;
  const images = article.cover ? [article.cover] : [];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: article.date,
      images: images.map((src) => ({ url: src })),
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  const cookieStore = await cookies();
  const lang = langFrom(cookieStore.get("locale")?.value);

  const jsonLd = article && {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title[lang],
    description: article.excerpt[lang],
    datePublished: article.date,
    image: article.cover ? [article.cover] : undefined,
    author: { "@type": "Organization", name: "Electro Motors" },
    publisher: { "@type": "Organization", name: "Electro Motors" },
    mainEntityOfPage: `${BASE_URL}/blog/${article.slug}`,
  };

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      )}
      <ArticleClient slug={slug} />
    </>
  );
}
