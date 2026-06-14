"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CarCard } from "@/components/cars/CarCard";
import { useFavorites } from "@/hooks/use-favorites";
import { useLocale } from "@/hooks/use-locale";
import { Car } from "@/types/car";
import { Heart, Loader2, Trash2 } from "lucide-react";

export default function FavoritesPage() {
  const { locale } = useLocale();
  const { items, hydrated, clear, count } = useFavorites();
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const c = {
    ua: { title: "Обране", empty: "У вас поки немає збережених авто.", emptyHint: "Натискайте ♥ на картках, щоб додати їх сюди.", toCatalog: "Перейти до каталогу", clear: "Очистити" },
    ru: { title: "Избранное", empty: "У вас пока нет сохранённых авто.", emptyHint: "Нажимайте ♥ на карточках, чтобы добавить их сюда.", toCatalog: "Перейти в каталог", clear: "Очистить" },
    en: { title: "Favorites", empty: "You have no saved cars yet.", emptyHint: "Tap ♥ on the cards to add them here.", toCatalog: "Browse catalog", clear: "Clear" },
  }[locale as "ua" | "ru" | "en"] ?? { title: "Обране", empty: "У вас поки немає збережених авто.", emptyHint: "Натискайте ♥ на картках, щоб додати їх сюди.", toCatalog: "Перейти до каталогу", clear: "Очистити" };

  useEffect(() => {
    fetch("/api/cars")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAllCars(data); })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, []);

  // Preserve the order in which cars were favorited
  const favCars = items
    .map((id) => allCars.find((car) => car.id === id))
    .filter((car): car is Car => Boolean(car));

  const isLoading = loading || !hydrated;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <Heart className="h-7 w-7 text-[#F23645]" />
              {c.title}
              {count > 0 && <span className="text-xl font-medium text-muted-foreground">({count})</span>}
            </h1>
            {count > 0 && (
              <button
                onClick={clear}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-[#F23645]"
              >
                <Trash2 className="h-4 w-4" />
                {c.clear}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : favCars.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 text-center">
              <Heart className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="mb-1 text-lg font-medium text-muted-foreground">{c.empty}</p>
              <p className="mb-6 text-sm text-muted-foreground">{c.emptyHint}</p>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                {c.toCatalog}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
