"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";

interface BudgetOption {
  id: string;
  minPrice?: number;
  maxPrice?: number;
}

const budgetOptions: BudgetOption[] = [
  { id: "any" },
  { id: "to25", maxPrice: 25000 },
  { id: "25to40", minPrice: 25000, maxPrice: 40000 },
  { id: "from40", minPrice: 40000 },
];

export function HeroSearch() {
  const { locale } = useLocale();
  const router = useRouter();
  const [brands, setBrands] = useState<string[]>([]);
  const [brand, setBrand] = useState("all");
  const [budget, setBudget] = useState("any");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    fetch("/api/cars")
      .then((r) => r.json())
      .then((cars) => {
        if (!Array.isArray(cars)) return;
        setBrands([...new Set(cars.map((c: { brand: string }) => c.brand))].sort() as string[]);
      })
      .catch(() => {});
  }, []);

  const budgetLabels: Record<string, string> = {
    any:    locale === "ua" ? "Будь-який бюджет" : locale === "en" ? "Any budget"    : "Любой бюджет",
    to25:   "До $25 000",
    "25to40": "$25 000 — $40 000",
    from40: locale === "ua" ? "Від $40 000"      : locale === "en" ? "From $40 000"  : "От $40 000",
  };

  function submit() {
    const params = new URLSearchParams();
    if (brand !== "all") params.set("brand", brand);
    const b = budgetOptions.find((o) => o.id === budget);
    if (b?.minPrice) params.set("minPrice", String(b.minPrice));
    if (b?.maxPrice) params.set("maxPrice", String(b.maxPrice));
    if (status !== "all") params.set("status", status);
    router.push(`/catalog${params.size ? `?${params}` : ""}`);
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="grid gap-2 rounded-2xl border bg-card/90 p-3 backdrop-blur-md sm:grid-cols-[1fr_1fr_1fr_auto]">
        <Select value={brand} onValueChange={(v) => setBrand(v || "all")}>
          <SelectTrigger className="w-full" data-size="default">
            <SelectValue>{brand === "all" ? (locale === "ua" ? "Всі марки" : locale === "en" ? "All brands" : "Все марки") : brand}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === "ua" ? "Всі марки" : locale === "en" ? "All brands" : "Все марки"}</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={budget} onValueChange={(v) => setBudget(v || "any")}>
          <SelectTrigger className="w-full" data-size="default">
            <SelectValue>{budgetLabels[budget]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {budgetOptions.map((o) => (
              <SelectItem key={o.id} value={o.id}>{budgetLabels[o.id]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => setStatus(v || "all")}>
          <SelectTrigger className="w-full" data-size="default">
            <SelectValue>
              {status === "in_stock"
                ? locale === "ua" ? "В наявності"   : locale === "en" ? "In stock"        : "В наличии"
                : locale === "ua" ? "Наявність: всі" : locale === "en" ? "Availability: all" : "Наличие: все"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === "ua" ? "Наявність: всі" : locale === "en" ? "Availability: all" : "Наличие: все"}</SelectItem>
            <SelectItem value="in_stock">{locale === "ua" ? "В наявності" : locale === "en" ? "In stock" : "В наличии"}</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={submit} className="h-9 bg-brand-600 px-6 hover:bg-brand-500">
          <Search className="mr-2 h-4 w-4" />
          {locale === "ua" ? "Знайти" : locale === "en" ? "Search" : "Найти"}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <Link
          href="/catalog?maxPrice=25000"
          className="rounded-full border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-brand-400/60 hover:text-brand"
        >
          Up to $25 000
        </Link>
        <Link
          href="/catalog?status=in_stock"
          className="rounded-full border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-brand-400/60 hover:text-brand"
        >
          {locale === "ua" ? "В наявності" : locale === "en" ? "In stock" : "В наличии"}
        </Link>
        <Link
          href="/catalog?sort=year_desc"
          className="rounded-full border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-brand-400/60 hover:text-brand"
        >
          {locale === "ua" ? "Новинки" : locale === "en" ? "New arrivals" : "Новинки"}
        </Link>
        <Link
          href="/catalog?sort=range_desc"
          className="rounded-full border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-brand-400/60 hover:text-brand"
        >
          {locale === "ua" ? "Максимальний запас ходу" : locale === "en" ? "Max range" : "Максимальный запас хода"}
        </Link>
      </div>
    </div>
  );
}
