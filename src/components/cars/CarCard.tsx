"use client";

import Link from "next/link";
import { Battery, Gauge, Zap, MapPin, Scale, Heart } from "lucide-react";
import { CarImage } from "@/components/ui/car-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Car } from "@/types/car";
import { useLocale } from "@/hooks/use-locale";
import { useCompare } from "@/hooks/use-compare";
import { useFavorites } from "@/hooks/use-favorites";
import { localizedCity } from "@/lib/utils";

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  const { t, locale } = useLocale();
  const { has, toggle, isFull, hasSpecs } = useCompare();
  const { has: hasFav, toggle: toggleFav } = useFavorites();
  const city = localizedCity(car, locale);
  const comparable = hasSpecs(car.brand, car.model);
  const inCompare = has(car.id);
  const inFav = hasFav(car.id);
  const favLabel = locale === "ru" ? "В избранное" : locale === "en" ? "Add to favorites" : "В обране";

  const statusColor: Record<string, string> = {
    in_stock: "bg-emerald-500 text-white",
    in_transit: "bg-blue-500 text-white",
    on_order: "bg-amber-500 text-white",
    commission: "bg-pink-200 text-pink-900",
  };

  const statusLabel: Record<string, string> = {
    in_stock: t("catalog.in_stock"),
    in_transit: t("catalog.in_transit"),
    on_order: t("catalog.on_order"),
    commission: t("catalog.commission"),
  };

  return (
    <Link href={`/catalog/${car.slug}`} className="h-full">
      <Card className="group flex h-full flex-col overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:border-brand-400/40 hover:-translate-y-1">
        <div className="relative aspect-[16/10] overflow-hidden">
          <CarImage
            src={car.thumbnail || ""}
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute left-3 right-3 top-3 flex flex-wrap gap-2">
            <Badge className={`${statusColor[car.status]} border-0`}>
              {statusLabel[car.status]}
            </Badge>
            {car.mileage_km > 100 ? (
              <Badge variant="secondary" className="bg-white/90 text-zinc-900">
                {locale === "ua" ? "з пробігом" : locale === "en" ? "used" : "с пробегом"} · {car.mileage_km.toLocaleString()} km
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-white/90 text-zinc-900">
                {t("car.new")}
              </Badge>
            )}
            {city && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {city}
              </Badge>
            )}
          </div>

          <div className="absolute bottom-3 right-3 z-10 flex gap-2">
            {comparable && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(car.id); }}
                disabled={!inCompare && isFull}
                aria-label={inCompare ? t("compare.remove") : t("compare.add")}
                title={inCompare ? t("compare.remove") : t("compare.add")}
                className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                  inCompare
                    ? "scale-110 bg-brand-600 text-white ring-2 ring-white/70"
                    : "bg-white/90 text-zinc-700 hover:bg-white hover:scale-105"
                }`}
              >
                <Scale className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(car.id); }}
              aria-label={favLabel}
              title={favLabel}
              className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-200 ${
                inFav
                  ? "scale-110 bg-[#F23645] text-white ring-2 ring-white/70"
                  : "bg-white/90 text-zinc-700 hover:bg-white hover:scale-105"
              }`}
            >
              <Heart className={`h-4 w-4 ${inFav ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {car.brand} {car.year}
          </div>
          <h3 className="mb-3 text-lg font-semibold leading-tight">
            {car.model}{car.trim ? ` ${car.trim}` : ""}
          </h3>

          <div className="mt-auto mb-4 flex items-center gap-3 text-sm text-muted-foreground flex-nowrap min-w-0">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Gauge className="h-3.5 w-3.5 shrink-0" />
              {car.range_km ? `${car.range_km} ${t("catalog.km")}` : "—"}
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Zap className="h-3.5 w-3.5 shrink-0" />
              {car.power_hp ? `${car.power_hp} ${t("catalog.hp")}` : "—"}
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Battery className="h-3.5 w-3.5 shrink-0" />
              {car.battery_kwh ? `${car.battery_kwh} kWh` : "—"}
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              {car.price_usd > 0 ? (
                <>
                  {!!car.old_price_usd && car.old_price_usd > car.price_usd && (
                    <div className="text-sm text-muted-foreground line-through">
                      ${car.old_price_usd.toLocaleString()}
                    </div>
                  )}
                  <div className={`text-2xl font-bold${!!car.old_price_usd && car.old_price_usd > car.price_usd ? " text-[#F23645]" : ""}`}>
                    {t("catalog.from")} ${car.price_usd.toLocaleString()}
                  </div>
                  {car.price_uah > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {!!car.old_price_uah && car.old_price_uah > car.price_uah && (
                        <span className="mr-1.5 line-through">{car.old_price_uah.toLocaleString()} &#8372;</span>
                      )}
                      <span className={!!car.old_price_uah && car.old_price_uah > car.price_uah ? "font-semibold text-[#F23645]" : ""}>
                        {car.price_uah.toLocaleString()} &#8372;
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-lg font-semibold text-amber-400">
                  {locale === "ua" ? "Уточнити ціну" : locale === "en" ? "Request price" : "Уточнить цену"}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
              {t("catalog.details")} &rarr;
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
