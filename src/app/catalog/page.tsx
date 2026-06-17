"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhyUsSection } from "@/components/layout/WhyUsSection";
import { CarCard } from "@/components/cars/CarCard";
import { CarCardSkeleton } from "@/components/cars/CarCardSkeleton";
import { CatalogFilters } from "@/components/cars/CatalogFilters";
import { useLocale } from "@/hooks/use-locale";
import { rememberCatalogUrl } from "@/hooks/use-compare";
import { Car } from "@/types/car";
import { CarFilter } from "@/types/car";
import { Car as CarIcon, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const defaultFilters: CarFilter = {
  minPrice: 0,
  maxPrice: 100000,
};

function usePageSize() {
  const [size, setSize] = useState(9);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setSize(3);       // mobile
      else if (w < 1280) setSize(6); // tablet
      else setSize(9);               // desktop
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

function filtersFromUrl(): CarFilter {
  if (typeof window === "undefined") return defaultFilters;
  const sp = new URLSearchParams(window.location.search);
  const f: CarFilter = { ...defaultFilters };
  if (sp.get("brand")) f.brand = sp.get("brand")!;
  if (sp.get("model")) f.model = sp.get("model")!;
  if (sp.get("bodyType")) f.bodyType = sp.get("bodyType")!;
  if (sp.get("status")) f.status = sp.get("status")!;
  if (sp.get("search")) f.search = sp.get("search")!;
  if (sp.get("minPrice")) f.minPrice = Number(sp.get("minPrice")) || 0;
  if (sp.get("maxPrice")) f.maxPrice = Number(sp.get("maxPrice")) || 100000;
  if (sp.get("minRange")) f.minRange = Number(sp.get("minRange")) || 0;
  const sort = sp.get("sort");
  if (sort === "price_asc" || sort === "price_desc" || sort === "year_desc" || sort === "range_desc") {
    f.sort = sort;
  }
  return f;
}

function filtersToParams(filters: CarFilter): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.model) params.set("model", filters.model);
  if (filters.bodyType) params.set("bodyType", filters.bodyType);
  if (filters.status) params.set("status", filters.status);
  if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice && filters.maxPrice < 100000) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minRange) params.set("minRange", String(filters.minRange));
  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  return params;
}

export default function CatalogPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<CarFilter>(defaultFilters);
  const urlLoaded = useRef(false);

  useEffect(() => {
    setFilters(filtersFromUrl());
    urlLoaded.current = true;
  }, []);

  // Keep filters in the URL via Next.js router so back-navigation restores them,
  // and remember the filtered URL so "back to catalog" (from /compare) can resume it.
  useEffect(() => {
    if (!urlLoaded.current) return;
    const qs = filtersToParams(filters).toString();
    const url = `${pathname}${qs ? `?${qs}` : ""}`;
    router.replace(url, { scroll: false });
    rememberCatalogUrl(url);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const pageSize = usePageSize();
  const [visibleCount, setVisibleCount] = useState(9);

  const loadCars = useCallback(async () => {
    setLoading(true);
    const params = filtersToParams(filters);

    try {
      const res = await fetch(`/api/cars?${params}`);
      const data = await res.json();
      setCars(Array.isArray(data) ? data : []);
    } catch {
      setCars([]);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize]);

  const isFirstLoad = useRef(true);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    setVisibleCount(pageSize);
    const debounce = setTimeout(async () => {
      await loadCars();
      if (!isFirstLoad.current) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      isFirstLoad.current = false;
    }, 300);
    return () => clearTimeout(debounce);
  }, [loadCars, pageSize]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <h1 className="mb-8 text-3xl font-bold">{t("catalog.title")}</h1>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
            <aside className="lg:sticky lg:top-20">
              <CatalogFilters
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(defaultFilters)}
              />
            </aside>

            <div className="min-h-[calc(100vh-200px)]">
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: pageSize }).map((_, i) => (
                    <CarCardSkeleton key={i} />
                  ))}
                </div>
              ) : cars.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20">
                  <CarIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium text-muted-foreground">
                    {t("catalog.not_found")}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {cars.slice(0, visibleCount).map((car) => (
                      <CarCard key={car.id} car={car} />
                    ))}
                  </div>
                  {visibleCount < cars.length && (
                    <div className="mt-8 flex justify-center">
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-12 px-10 text-base"
                        onClick={() => setVisibleCount((prev) => prev + pageSize)}
                      >
                        <ChevronDown className="mr-2 h-4 w-4" />
                        {locale === "ua" ? "Завантажити ще" : locale === "en" ? "Load more" : "Загрузить ещё"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <WhyUsSection />
      <Footer />
    </>
  );
}
