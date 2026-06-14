"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLocale } from "@/hooks/use-locale";
import { sortedArticles, type Lang } from "@/lib/blog";
import { Clock, ArrowRight, Newspaper } from "lucide-react";

export default function BlogPage() {
  const { locale } = useLocale();
  const lang = (["ua", "ru", "en"].includes(locale) ? locale : "ua") as Lang;

  const head = {
    ua: { title: "Блог", subtitle: "Корисні статті про електромобілі: зарядка, експлуатація, поради." },
    ru: { title: "Блог", subtitle: "Полезные статьи об электромобилях: зарядка, эксплуатация, советы." },
    en: { title: "Blog", subtitle: "Useful articles about EVs: charging, ownership and tips." },
  }[lang];

  const readLabel = lang === "ru" ? "мин чтения" : lang === "en" ? "min read" : "хв читання";
  const articles = sortedArticles();

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-zinc-950 to-zinc-900 py-16 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="mb-3 flex items-center justify-center gap-2 text-3xl font-bold lg:text-4xl">
              <Newspaper className="h-8 w-8" />
              {head.title}
            </h1>
            <p className="text-zinc-300">{head.subtitle}</p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-1 hover:border-brand-400/40 hover:shadow-md"
              >
                {a.cover ? (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={a.cover} alt={a.title[lang]} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-section">
                    <Newspaper className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{new Date(a.date).toLocaleDateString(lang === "ua" ? "uk-UA" : lang === "en" ? "en-US" : "ru-RU")}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.readMinutes} {readLabel}</span>
                  </div>
                  <h2 className="mb-2 font-semibold leading-tight">{a.title[lang]}</h2>
                  <p className="mb-4 text-sm text-muted-foreground">{a.excerpt[lang]}</p>
                  <span className="mt-auto flex items-center gap-1 text-sm font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                    {lang === "ru" ? "Читать" : lang === "en" ? "Read" : "Читати"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
