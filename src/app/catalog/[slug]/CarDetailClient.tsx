"use client";

import Image from "next/image";
import { CarImage } from "@/components/ui/car-image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhyUsSection } from "@/components/layout/WhyUsSection";
import { ContactForm } from "@/components/cars/ContactForm";
import { CreditCalc } from "@/components/cars/CreditCalc";
import { useModelSpecs, ModelSpecsContent } from "@/components/cars/ModelSpecsTable";
import { CarCard } from "@/components/cars/CarCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocale } from "@/hooks/use-locale";
import { localizedCity } from "@/lib/utils";
import { Car } from "@/types/car";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Gauge,
  Battery,
  Zap,
  Timer,
  Cog,
  Palette,
  Calendar,
  Milestone,
  ArrowLeft,
  Phone,
  Check,
  MapPin,
} from "lucide-react";

export default function CarDetailClient({ slug }: { slug: string }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const [car, setCar] = useState<Car | null>(null);
  const [similarCarsData, setSimilarCarsData] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const { spec: modelSpec } = useModelSpecs(car?.brand || "", car?.model || "");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/cars?search=`);
        const allCars: Car[] = await res.json();
        const found = allCars.find((c: Car) => c.slug === slug);
        setCar(found || null);
        if (found) {
          setSimilarCarsData(
            allCars
              .filter((c: Car) => c.id !== found.id && (c.brand === found.brand || c.body_type === found.body_type))
              .slice(0, 3)
          );
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </main>
        <Footer />
      </>
    );
  }

  if (!car) {
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center py-20">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">{t("catalog.not_found")}</h1>
            <Link href="/catalog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("catalog.title")}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const similarCars = similarCarsData;

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

  const specs = [
    { icon: Gauge, label: t("car.range"), value: car.range_km ? `${car.range_km} ${t("catalog.km")}` : "—" },
    { icon: Battery, label: t("car.battery"), value: car.battery_kwh ? `${car.battery_kwh} kWh` : "—" },
    { icon: Zap, label: t("car.power"), value: car.power_hp ? `${car.power_hp} ${t("catalog.hp")}` : "—" },
    { icon: Timer, label: t("car.acceleration"), value: car.acceleration_0_100 ? `${car.acceleration_0_100} ${t("car.sec")}` : "—" },
    { icon: Cog, label: t("car.drive"), value: car.drive_type || "—" },
    { icon: Milestone, label: t("car.body"), value: car.body_type || "—" },
    { icon: Palette, label: t("car.color"), value: car.color || "—" },
    { icon: Calendar, label: t("car.year"), value: car.year ? car.year.toString() : "—" },
  ];

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="border-b bg-section">
          <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">{t("nav.home")}</Link>
              <span>/</span>
              <button onClick={() => router.back()} className="hover:text-foreground transition-colors">
                {t("nav.catalog")}
              </button>
              <span>/</span>
              <span className="text-foreground">{car.brand} {car.model}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === "ua" ? "Назад до каталогу" : locale === "en" ? "Back to catalog" : "Назад в каталог"}
          </button>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Left Column */}
            <div>
              {/* Image Gallery */}
              <div className="mb-6 overflow-hidden rounded-2xl bg-card">
                <div className="relative aspect-[16/10]">
                  <CarImage
                    src={car.images[currentImage] || car.thumbnail || ""}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                  {car.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImage((p) => (p > 0 ? p - 1 : car.images.length - 1))}
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur transition hover:bg-white"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImage((p) => (p < car.images.length - 1 ? p + 1 : 0))}
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur transition hover:bg-white"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
                {car.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-3">
                    {car.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                          i === currentImage ? "border-brand-600" : "border-transparent opacity-60"
                        }`}
                      >
                        <CarImage src={img} alt="" fill className="object-cover" sizes="96px" fallbackText="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabs — only show tabs that have content */}
              {(() => {
                const hasSpecs = true;
                const hasDescription = !!(locale === "ua" ? car.description_ua : locale === "en" ? (car.description_en || car.description_ru || car.description_ua) : car.description_ru);
                const hasFeatures = (car.specs.features || []).length > 0;
                const hasModelSpecs = !!(modelSpec?.spec_sheet?.categories?.length && modelSpec?.spec_sheet?.trims?.length);
                const defaultTab = hasSpecs ? "specs" : hasModelSpecs ? "tech_specs" : hasDescription ? "description" : hasFeatures ? "features" : null;

                if (!defaultTab) return null;

                return (
                  <Tabs defaultValue={defaultTab}>
                    <TabsList className="grid w-full grid-cols-2 sm:flex sm:w-auto sm:justify-start">
                      {hasSpecs && <TabsTrigger value="specs">{t("car.specs")}</TabsTrigger>}
                      {hasDescription && <TabsTrigger value="description">{t("car.description")}</TabsTrigger>}
                      {hasFeatures && <TabsTrigger value="features">{t("car.features")}</TabsTrigger>}
                      {hasModelSpecs && (
                        <TabsTrigger value="tech_specs">
                          {locale === "ua" ? "Тех. характеристики" : locale === "en" ? "Tech. specs" : "Тех. характеристики"}
                        </TabsTrigger>
                      )}
                    </TabsList>

                    {hasSpecs && (
                      <TabsContent value="specs" className="mt-4">
                        <div className="grid grid-cols-2 gap-3">
                          {specs.map((spec) => (
                            <div
                              key={spec.label}
                              className="flex items-center gap-3 rounded-lg border bg-card p-3"
                            >
                              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                                <spec.icon className="h-4 w-4 text-brand" />
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">{spec.label}</div>
                                <div className="font-semibold">{spec.value}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}

                    {hasModelSpecs && (
                      <TabsContent value="tech_specs" className="mt-4">
                        <ModelSpecsContent sheet={modelSpec!.spec_sheet} modelName={`${modelSpec!.brand} ${modelSpec!.model}`} />
                      </TabsContent>
                    )}

                    {hasDescription && (
                      <TabsContent value="description" className="mt-4">
                        <div className="prose prose-invert max-w-none rounded-xl border bg-card p-6">
                          <p>{locale === "ua" ? car.description_ua : locale === "en" ? (car.description_en || car.description_ru || car.description_ua) : car.description_ru}</p>
                        </div>
                      </TabsContent>
                    )}

                    {hasFeatures && (
                      <TabsContent value="features" className="mt-4">
                        <div className="rounded-xl border bg-card p-6">
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {(car.specs.features || []).map((f) => (
                              <li key={f} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-brand" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                );
              })()}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <div className="rounded-xl border bg-card p-6">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className={`${statusColor[car.status]} border-0`}>
                    {statusLabel[car.status]}
                  </Badge>
                  {car.mileage_km > 100 ? (
                    <Badge variant="secondary">{locale === "ua" ? "з пробігом" : locale === "en" ? "used" : "с пробегом"} · {car.mileage_km.toLocaleString()} km</Badge>
                  ) : (
                    <Badge variant="secondary">{t("car.new")}</Badge>
                  )}
                  {localizedCity(car, locale) && (
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {localizedCity(car, locale)}
                    </Badge>
                  )}
                </div>

                <h1 className="mb-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {car.brand} {car.year}
                </h1>
                <h2 className="mb-4 text-2xl font-bold">{car.model}{car.trim ? ` ${car.trim}` : ""}</h2>

                <div className="mb-6">
                  {car.price_usd > 0 ? (
                    <>
                      {!!car.old_price_usd && car.old_price_usd > car.price_usd && (
                        <div className="text-lg text-muted-foreground line-through">
                          ${car.old_price_usd.toLocaleString()}
                        </div>
                      )}
                      <div className={`text-3xl font-bold ${!!car.old_price_usd && car.old_price_usd > car.price_usd ? "text-[#F23645]" : "text-brand"}`}>
                        {t("catalog.from")} ${car.price_usd.toLocaleString()}
                      </div>
                      {car.price_uah > 0 && (
                        <div className="text-sm text-muted-foreground">
                          {!!car.old_price_uah && car.old_price_uah > car.price_uah && (
                            <span className="mr-2 line-through">{car.old_price_uah.toLocaleString()} &#8372;</span>
                          )}
                          <span className={!!car.old_price_uah && car.old_price_uah > car.price_uah ? "font-semibold text-[#F23645]" : ""}>
                            {car.price_uah.toLocaleString()} &#8372;
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-2xl font-semibold text-amber-600">
                      {locale === "ua" ? "Уточнити ціну" : locale === "en" ? "Request price" : "Уточнить цену"}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <a href="tel:+380966789000" className="block">
                    <Button className="w-full bg-brand-600 hover:bg-brand-500" size="lg">
                      <Phone className="mr-2 h-4 w-4" />
                      {t("car.order")}
                    </Button>
                  </a>
                </div>
              </div>

              <CreditCalc price={car.price_usd} />
            </div>
          </div>

          {/* Similar Cars */}
          {similarCars.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-6 text-2xl font-bold">{t("car.similar")}</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similarCars.map((c) => (
                  <CarCard key={c.id} car={c} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <WhyUsSection />
      <Footer />
    </>
  );
}
