"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CarCard } from "@/components/cars/CarCard";
import { Button } from "@/components/ui/button";
import { Plus, Scale, ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import { useCompare, getRememberedCatalogUrl } from "@/hooks/use-compare";
import { Car } from "@/types/car";

export default function ComparePage() {
  const { t } = useLocale();
  const router = useRouter();
  const { items, count, max, clear, hydrated } = useCompare();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogUrl, setCatalogUrl] = useState("/catalog");

  useEffect(() => {
    setCatalogUrl(getRememberedCatalogUrl());
  }, []);

  useEffect(() => {
    fetch("/api/cars")
      .then((r) => r.json())
      .then((data: Car[]) => setCars(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Selected cars in the order they were added
  const byId = new Map(cars.map((c) => [c.id, c]));
  const selected = items.map((id) => byId.get(id)).filter((c): c is Car => !!c);

  const showEmpty = hydrated && !loading && selected.length === 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <Scale className="h-7 w-7 text-brand" />
            {t("compare.heading")}
          </h1>
          <div className="flex items-center gap-2">
            <Link href={catalogUrl}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("compare.backToCatalog")}
              </Button>
            </Link>
            {count > 0 && (
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={clear}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("compare.clear")}
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : showEmpty ? (
          <div className="rounded-xl border border-dashed py-16 text-center">
            <Scale className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">{t("compare.empty")}</p>
            <Link href={catalogUrl}>
              <Button>{t("nav.catalog")}</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {selected.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}

              {/* Add-car tile */}
              {count < max && (
                <Link
                  href={catalogUrl}
                  className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-brand-400 hover:text-brand"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-current">
                    <Plus className="h-7 w-7" />
                  </div>
                  <span className="text-sm font-medium">{t("compare.addCar")}</span>
                </Link>
              )}
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              <Button
                size="lg"
                disabled={count < 2}
                onClick={() => router.push("/compare/table")}
                className="px-10"
              >
                <Scale className="mr-2 h-5 w-5" />
                {t("compare.compareBtn")}
              </Button>
              {count < 2 && (
                <p className="text-sm text-muted-foreground">{t("compare.needTwo")}</p>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
