"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { CarFilter } from "@/types/car";
import { useLocale } from "@/hooks/use-locale";

interface CatalogFiltersProps {
  filters: CarFilter;
  onChange: (filters: CarFilter) => void;
  onReset: () => void;
}

export function CatalogFilters({ filters, onChange, onReset }: CatalogFiltersProps) {
  const { t, locale } = useLocale();
  const [brands, setBrands] = useState<string[]>([]);
  const [modelsByBrand, setModelsByBrand] = useState<Record<string, string[]>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/cars")
      .then((r) => r.json())
      .then((cars) => {
        if (!Array.isArray(cars)) return;
        const unique = [...new Set(cars.map((c: { brand: string }) => c.brand))].sort() as string[];
        setBrands(unique);
        const map: Record<string, Set<string>> = {};
        cars.forEach((c: { brand: string; model: string }) => {
          if (!map[c.brand]) map[c.brand] = new Set();
          map[c.brand].add(c.model);
        });
        const result: Record<string, string[]> = {};
        for (const [brand, models] of Object.entries(map)) {
          result[brand] = [...models].sort();
        }
        setModelsByBrand(result);
      })
      .catch(() => {});
  }, []);

  const availableModels = filters.brand ? modelsByBrand[filters.brand] || [] : [];

  const statusLabels: Record<string, string> = {
    all: t("catalog.all_statuses"),
    in_stock: t("catalog.in_stock"),
    in_transit: t("catalog.in_transit"),
    on_order: t("catalog.on_order"),
    commission: t("catalog.commission"),
  };

  const sortLabels: Record<string, string> = {
    default: t("catalog.sort_default"),
    price_asc: t("catalog.sort_price_asc"),
    price_desc: t("catalog.sort_price_desc"),
    year_desc: t("catalog.sort_year"),
    range_desc: t("catalog.sort_range"),
  };

  const hasActiveFilters =
    filters.brand || filters.model || filters.bodyType || filters.status || filters.search ||
    (filters.minPrice && filters.minPrice > 0) ||
    (filters.maxPrice && filters.maxPrice < 100000);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="flex cursor-pointer items-center gap-2 font-semibold sm:cursor-default"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t("catalog.filter")}
          <ChevronDown className={`h-4 w-4 transition-transform sm:hidden ${mobileOpen ? "rotate-180" : ""}`} />
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
            <X className="mr-1 h-3 w-3" />
            {t("catalog.reset_filters")}
          </Button>
        )}
      </div>

      <div className="space-y-5">
        {/* Search — always visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="BYD, Tesla, Volkswagen..."
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Collapsible on mobile, always visible on sm+ */}
        <div className={`space-y-5 ${mobileOpen ? "" : "hidden"} sm:block`}>

        {/* Brand */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("catalog.brand")}</label>
          <Select
            value={filters.brand || "all"}
            onValueChange={(v) => onChange({ ...filters, brand: v === "all" ? undefined : v || undefined, model: undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("catalog.all_brands")}>
                {filters.brand || t("catalog.all_brands")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("catalog.all_brands")}</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model (only when brand selected) */}
        {filters.brand && availableModels.length > 1 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">{locale === "en" ? "Model" : "Модель"}</label>
            <Select
              value={filters.model || "all"}
              onValueChange={(v) => onChange({ ...filters, model: v === "all" ? undefined : v || undefined })}
            >
              <SelectTrigger>
                <SelectValue>
                  {filters.model || (locale === "ua" ? "Всі моделі" : locale === "en" ? "All models" : "Все модели")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{locale === "ua" ? "Всі моделі" : locale === "en" ? "All models" : "Все модели"}</SelectItem>
                {availableModels.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("catalog.status")}</label>
          <Select
            value={filters.status || "all"}
            onValueChange={(v) => onChange({ ...filters, status: v === "all" ? undefined : v || undefined })}
          >
            <SelectTrigger>
              <SelectValue>
                {statusLabels[filters.status || "all"]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{statusLabels.all}</SelectItem>
              <SelectItem value="in_stock">{statusLabels.in_stock}</SelectItem>
              <SelectItem value="in_transit">{statusLabels.in_transit}</SelectItem>
              <SelectItem value="on_order">{statusLabels.on_order}</SelectItem>
              <SelectItem value="commission">{statusLabels.commission}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Body type (engine type) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("catalog.body_type")}</label>
          <Select
            value={filters.bodyType || "all"}
            onValueChange={(v) => onChange({ ...filters, bodyType: v === "all" ? undefined : v || undefined })}
          >
            <SelectTrigger>
              <SelectValue>
                {filters.bodyType || t("catalog.all_types")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("catalog.all_types")}</SelectItem>
              <SelectItem value="EV">EV</SelectItem>
              <SelectItem value="EREV">EREV</SelectItem>
              <SelectItem value="PHEV">PHEV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div>
          <label className="mb-3 flex items-center justify-between text-sm font-medium">
            <span>{t("catalog.price_range")}</span>
            <span className="text-xs text-muted-foreground">
              ${(filters.minPrice || 0).toLocaleString("uk-UA")} &mdash; ${(filters.maxPrice || 100000).toLocaleString("uk-UA")}
            </span>
          </label>
          <Slider
            min={0}
            max={100000}
            step={1000}
            value={[filters.minPrice || 0, filters.maxPrice || 100000]}
            onValueChange={(val) => { const arr = val as number[]; onChange({ ...filters, minPrice: arr[0], maxPrice: arr[1] }); }}
            className="mt-2"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("catalog.sort")}</label>
          <Select
            value={filters.sort || "default"}
            onValueChange={(v) => onChange({ ...filters, sort: v === "default" ? undefined : v as CarFilter["sort"] })}
          >
            <SelectTrigger>
              <SelectValue>
                {sortLabels[filters.sort || "default"]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{sortLabels.default}</SelectItem>
              <SelectItem value="price_asc">{sortLabels.price_asc}</SelectItem>
              <SelectItem value="price_desc">{sortLabels.price_desc}</SelectItem>
              <SelectItem value="year_desc">{sortLabels.year_desc}</SelectItem>
              <SelectItem value="range_desc">{sortLabels.range_desc}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </div>{/* end collapsible */}
      </div>
    </div>
  );
}
