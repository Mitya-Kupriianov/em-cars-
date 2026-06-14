"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLocale } from "@/hooks/use-locale";
import { getArticle, sortedArticles, type Lang } from "@/lib/blog";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";

export default function ArticleClient({ slug }: { slug: string }) {
  const { locale } = useLocale();
  const lang = (["ua", "ru", "en"].includes(locale) ? locale : "ua") as Lang;
  const article = getArticle(slug);

  if (!article) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center py-24 text-center">
          <div>
            <p className="mb-4 text-lg text-muted-foreground">
              {lang === "ru" ? "Статья не найдена" : lang === "en" ? "Article not found" : "Статтю не знайдено"}
            </p>
            <Link href="/blog" className="text-brand hover:underline">
              {lang === "ru" ? "Все статьи" : lang === "en" ? "All articles" : "Усі статті"}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const readLabel = lang === "ru" ? "мин чтения" : lang === "en" ? "min read" : "хв читання";
  const others = sortedArticles().filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
          <Link href="/blog" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            {lang === "ru" ? "Все статьи" : lang === "en" ? "All articles" : "Усі статті"}
          </Link>

          <h1 className="mb-3 text-3xl font-bold leading-tight lg:text-4xl">{article.title[lang]}</h1>
          <div className="mb-8 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{new Date(article.date).toLocaleDateString(lang === "ua" ? "uk-UA" : lang === "en" ? "en-US" : "ru-RU")}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{article.readMinutes} {readLabel}</span>
          </div>

          {article.cover && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl">
              <Image src={article.cover} alt={article.title[lang]} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
            </div>
          )}

          <p className="mb-8 text-lg text-muted-foreground">{article.excerpt[lang]}</p>

          <div className="space-y-8">
            {article.body.map((section, i) => (
              <section key={i}>
                {section.h && <h2 className="mb-3 text-xl font-semibold">{section.h[lang]}</h2>}
                <div className="space-y-3 leading-relaxed text-foreground/90">
                  {section.p[lang].map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-xl border bg-section p-6 text-center">
            <p className="mb-4 font-medium">
              {lang === "ru" ? "Хотите подобрать электромобиль?" : lang === "en" ? "Want help choosing an EV?" : "Хочете підібрати електромобіль?"}
            </p>
            <Link href="/catalog" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700">
              {lang === "ru" ? "Смотреть каталог" : lang === "en" ? "View catalog" : "Дивитись каталог"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        {others.length > 0 && (
          <section className="bg-section py-14">
            <div className="mx-auto max-w-5xl px-4 lg:px-8">
              <h2 className="mb-6 text-xl font-bold">
                {lang === "ru" ? "Другие статьи" : lang === "en" ? "More articles" : "Інші статті"}
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {others.map((a) => (
                  <Link key={a.slug} href={`/blog/${a.slug}`} className="group rounded-xl border bg-card p-5 transition-all hover:-translate-y-1 hover:border-brand-400/40">
                    <h3 className="mb-2 font-semibold leading-tight">{a.title[lang]}</h3>
                    <p className="text-sm text-muted-foreground">{a.excerpt[lang]}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
