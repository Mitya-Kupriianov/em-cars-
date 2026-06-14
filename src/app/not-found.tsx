"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLocale } from "@/hooks/use-locale";
import { Home, Search, Zap } from "lucide-react";

export default function NotFound() {
  const { locale } = useLocale();

  const content = {
    ua: {
      heading: "Сторінку не знайдено",
      text: "Можливо, її переміщено, перейменовано або видалено. Перевірте адресу або скористайтесь посиланнями нижче.",
      home: "На головну",
      catalog: "Перейти до каталогу",
    },
    ru: {
      heading: "Страница не найдена",
      text: "Возможно, она перемещена, переименована или удалена. Проверьте адрес или воспользуйтесь ссылками ниже.",
      home: "На главную",
      catalog: "Перейти в каталог",
    },
    en: {
      heading: "Page not found",
      text: "It may have been moved, renamed or deleted. Check the URL or use the links below.",
      home: "Go home",
      catalog: "Browse catalog",
    },
  };

  const c = content[locale as "ua" | "ru" | "en"] ?? content.ua;

  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center bg-section px-4 py-20">
        <div className="w-full max-w-md text-center">
          <div className="relative mb-6 select-none">
            <span className="bg-gradient-to-b from-brand-500 to-brand-700 bg-clip-text text-[7rem] font-black leading-none tracking-tighter text-transparent sm:text-[9rem]">
              404
            </span>
            <Zap className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-brand-500/15" />
          </div>

          <h1 className="mb-3 text-2xl font-bold">{c.heading}</h1>
          <p className="mb-8 text-muted-foreground">{c.text}</p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 sm:w-auto"
            >
              <Home className="h-4 w-4" />
              {c.home}
            </Link>
            <Link
              href="/catalog"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted sm:w-auto"
            >
              <Search className="h-4 w-4" />
              {c.catalog}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
