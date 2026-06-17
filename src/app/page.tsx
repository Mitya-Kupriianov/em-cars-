"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DealTools } from "@/components/layout/DealTools";
import { HeroSearch } from "@/components/cars/HeroSearch";
import { WhyUsSection } from "@/components/layout/WhyUsSection";
import { VideoReviews } from "@/components/layout/VideoReviews";
import { CarCard } from "@/components/cars/CarCard";
import { CarCardSkeleton } from "@/components/cars/CarCardSkeleton";
import { ContactForm } from "@/components/cars/ContactForm";
import { useLocale } from "@/hooks/use-locale";
import { offices as defaultOffices } from "@/lib/data";
import { Car } from "@/types/car";
import {
  ArrowRight,
  Shield,
  Wrench,
  CreditCard,
  MapPin,
  DollarSign,
  Phone,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Banner {
  id: string;
  title_ua: string;
  title_ru: string;
  subtitle_ua: string;
  subtitle_ru: string;
  image_url: string;
  link: string;
  show_button: boolean;
  show_callback: boolean;
}

function getLowQualityUrl(src: string): string {
  if (src.includes("supabase.co/storage/v1/object/public/")) {
    return src.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/"
    ) + "?width=64&quality=20";
  }
  return src;
}

function BannerImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const lowSrc = getLowQualityUrl(src);

  const onLoad = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    setLoaded(false);
    const img = new window.Image();
    img.onload = onLoad;
    img.src = src;
    if (img.complete) setLoaded(true);
  }, [src, onLoad]);

  return (
    <>
      {/* Low-quality blurred placeholder */}
      <img
        src={lowSrc}
        alt=""
        aria-hidden
        className={`absolute inset-0 h-full w-full object-contain scale-105 transition-opacity duration-500 sm:object-cover ${loaded ? "opacity-0" : "opacity-100"}`}
        style={{ filter: "blur(20px)" }}
      />
      {/* Full quality image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 sm:object-cover ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}

export default function HomePage() {
  const { t, locale } = useLocale();
  const [popularCars, setPopularCars] = useState<Car[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [offices, setOffices] = useState(defaultOffices);
  const [showCallbackModal, setShowCallbackModal] = useState(false);

  useEffect(() => {
    fetch("/api/cars?sort=price_desc")
      .then((r) => r.json())
      .then((data: Car[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const shuffle = (arr: Car[]) => [...arr].sort(() => Math.random() - 0.5);
        const promo = data.filter((c) => c.is_promo);
        let list: Car[];
        if (promo.length > 3) {
          // More than 3 promo cars — show a random 3 each visit
          list = shuffle(promo).slice(0, 3);
        } else {
          // 0–3 promo cars — promo first, then fill from in-transit / in-stock
          const fillers = shuffle(
            data.filter(
              (c) => !c.is_promo && (c.status === "in_transit" || c.status === "in_stock")
            )
          );
          list = [...shuffle(promo), ...fillers].slice(0, 3);
        }
        setPopularCars(list);
      })
      .catch(() => {})
      .finally(() => setPopularLoading(false));
    fetch("/api/banners")
      .then((r) => r.json())
      .then((data) => setBanners(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch("/api/offices")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length > 0) setOffices(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ── Hero: car finder ── */}
        <section className="relative flex min-h-[85vh] flex-col overflow-hidden bg-section text-foreground">
          <div className="pointer-events-none absolute -top-44 left-1/2 h-96 w-[720px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="relative mx-auto flex flex-1 max-w-7xl flex-col items-center justify-center px-4 py-14 text-center sm:py-20 lg:px-8">
            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {locale === "ua" ? "Знайдіть свій електромобіль" : locale === "en" ? "Find Your Electric Car" : "Найдите свой электромобиль"}
            </h1>
            <p className="mb-8 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {locale === "ua"
                ? "Прямі поставки з Китаю та США · гарантія до 3 років · доставка по всій Україні"
                : locale === "en"
                ? "Direct deliveries from China & USA · warranty up to 3 years · delivery across Ukraine"
                : "Прямые поставки из Китая и США · гарантия до 3 лет · доставка по всей Украине"}
            </p>
            <HeroSearch />
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:text-sm">
              <span>{locale === "ua" ? "Гарантія до 3 років" : locale === "en" ? "Warranty up to 3 years" : "Гарантия до 3 лет"}</span>
              <span>{locale === "ua" ? "Кредит до 84 місяців" : locale === "en" ? "Loan up to 84 months" : "Кредит до 84 месяцев"}</span>
              <span>{locale === "ua" ? "8 міст України" : locale === "en" ? "8 cities in Ukraine" : "8 городов Украины"}</span>
            </div>
          </div>
        </section>

        {/* ── Deal tools (bento) ── */}
        <DealTools />

        {/* ── Promo Banners ── */}
        {false && <section className="relative overflow-hidden bg-zinc-950 text-white">
          {/* Mobile: aspect-ratio based | sm+: viewport-height based */}
          <div className="relative aspect-[16/9] sm:aspect-auto sm:h-[45vh] md:h-[50vh]">
            {/* Fallback while banners load */}
            {banners.length === 0 && (
              <div className="absolute inset-0">
                <img
                  src={getLowQualityUrl("https://idrnxozpkvzizqjtmxrc.supabase.co/storage/v1/object/public/car-images/Baner/1780787694453-default-gradient-banner.jpg")}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ filter: "blur(20px)", transform: "scale(1.05)" }}
                />
              </div>
            )}

            {banners.length > 0 && (
              <div className="absolute inset-0">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: index === currentSlide ? 1 : 0, pointerEvents: index === currentSlide ? "auto" : "none" }}
                  >
                    <BannerImage
                      src={banner.image_url}
                      alt={locale === "ua" ? banner.title_ua : banner.title_ru}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

                    {/* Full-slide link (clickable on all devices) */}
                    {banner.link && (
                      <Link href={banner.link} className="absolute inset-0 z-10">
                        <span className="sr-only">Go to slide link</span>
                      </Link>
                    )}

                    {/* Title + button overlay */}
                    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center">
                      {(banner.title_ua || banner.title_ru) && (
                        <h2 className="mb-2 w-full text-2xl font-bold tracking-tight drop-shadow-lg sm:mb-4 sm:text-3xl lg:text-4xl">
                          {locale === "ua" ? banner.title_ua : banner.title_ru}
                        </h2>
                      )}
                      {(banner.subtitle_ua || banner.subtitle_ru) && (
                        <p className="mb-4 hidden w-full text-lg text-zinc-200 drop-shadow-md sm:block">
                          {locale === "ua" ? banner.subtitle_ua : banner.subtitle_ru}
                        </p>
                      )}
                      {/* "Подробнее" — only on sm+ */}
                      {banner.link && banner.show_button !== false && (
                        <Link href={banner.link} className="pointer-events-auto hidden sm:inline-flex">
                          <Button size="lg" className="h-13 bg-brand-600 text-base px-10 hover:bg-brand-500">
                            {locale === "ua" ? "Детальніше" : "Подробнее"}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}

                {/* "Замовити дзвінок" — only on sm+ and if current banner has show_callback */}
                {banners[currentSlide]?.show_callback !== false && (
                  <div className="absolute bottom-10 left-0 right-0 z-30 hidden justify-center sm:flex">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-13 border-white/60 bg-white/10 text-base text-white backdrop-blur-sm px-10 hover:bg-white/20"
                      onClick={() => setShowCallbackModal(true)}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      {locale === "ua" ? "Замовити дзвінок" : "Заказать звонок"}
                    </Button>
                  </div>
                )}

                {/* Slide navigation arrows + dots */}
                {banners.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
                      className="absolute left-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:left-4 sm:p-2"
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
                      className="absolute right-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:right-4 sm:p-2"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1.5 sm:bottom-6 sm:gap-2">
                      {banners.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          className={`h-2 rounded-full transition-all sm:h-2.5 ${
                            i === currentSlide ? "w-6 bg-brand-500 sm:w-8" : "w-2 bg-white/50 hover:bg-white/80 sm:w-2.5"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* "Замовити дзвінок" — mobile only (below banner) */}
          {banners[currentSlide]?.show_callback !== false && (
          <div className="flex justify-center px-4 py-3 sm:hidden">
            <Button
              size="lg"
              className="h-12 w-full bg-brand-600 text-base hover:bg-brand-500"
              onClick={() => setShowCallbackModal(true)}
            >
              <Phone className="mr-2 h-4 w-4" />
              {locale === "ua" ? "Замовити дзвінок" : "Заказать звонок"}
            </Button>
          </div>
          )}
        </section>}

        {/* ── Popular Cars ── */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16 lg:px-8">
          <div className="mb-6 flex items-end justify-between sm:mb-8">
            <h2 className="text-xl font-bold sm:text-2xl lg:text-3xl">{t("home.popular")}</h2>
            <Link
              href="/catalog"
              className="flex items-center gap-1 text-sm font-medium text-brand hover:opacity-80"
            >
              {t("catalog.title")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {popularLoading
              ? Array.from({ length: 3 }).map((_, i) => <CarCardSkeleton key={i} />)
              : popularCars.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
        </section>

        {/* ── Why Us ── */}
        <WhyUsSection />

        {/* ── About & Advantages ── */}
        <section className="cv-section bg-section py-10 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-8 sm:gap-12 lg:grid-cols-2">
              {/* About text */}
              <div>
                <h2 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl lg:text-3xl">
                  <span className="text-brand">Electro-Motors</span>
                  {" — "}
                  {locale === "ua" ? "все для електромобілів" : locale === "en" ? "everything for electric cars" : "всё для электромобилей"}
                </h2>
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:space-y-4 sm:text-base">
                  <p>
                    {locale === "ua"
                      ? "Наша мета — надання високоякісного сервісу в процесі вибору, покупки, супроводу доставки та обслуговування автомобіля. ELECTRO-MOTORS може запропонувати широкі можливості придбання електрокарів як для фізичних, так і для юридичних осіб."
                      : locale === "en" ? "Our goal is to provide high-quality service throughout the selection, purchase, delivery, and maintenance of your vehicle. ELECTRO-MOTORS offers wide opportunities to acquire electric cars for both individuals and businesses."
                      : "Наша цель — предоставление высококачественного сервиса в процессе выбора, покупки, сопровождения доставки и обслуживания автомобиля. ELECTRO-MOTORS предлагает широкие возможности приобретения электрокаров как для физических, так и для юридических лиц."}
                  </p>
                  <p>
                    {locale === "ua"
                      ? "Працюючи безпосередньо із заводами в Китаї, ми маємо можливість надавати гарантію на куплені у нас автомобілі. Ми не просто допоможемо з вибором і доставимо для Вас авто, а і будемо з вами в процесі всього терміну експлуатації."
                      : locale === "en" ? "Working directly with factories in China, we are able to provide a warranty on every car we sell. We don't just help you choose and deliver the car — we stay with you throughout its entire lifetime."
                      : "Работая напрямую с заводами в Китае, мы имеем возможность предоставлять гарантию на купленные у нас автомобили. Мы не просто поможем с выбором и доставим для Вас авто, а и будем с вами на протяжении всего срока эксплуатации."}
                  </p>
                </div>
              </div>

              {/* Advantages checklist */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 lg:p-8">
                <h3 className="mb-4 text-lg font-bold sm:mb-6 sm:text-xl">
                  {locale === "ua" ? "Переваги Electro-Motors:" : locale === "en" ? "Electro-Motors advantages:" : "Преимущества Electro-Motors:"}
                </h3>
                <ul className="space-y-2.5 sm:space-y-3">
                  {(locale === "ua" ? [
                    "Гарантія до 3-х років на куплені у нас автомобілі",
                    "1 рік безкоштовного сервісного обслуговування",
                    "Перевірка технічного стану авто перед передачею клієнту",
                    "Оплата на рахунок юридичної особи, захист законодавством України",
                    "Прямі поставки електрокарів із конвеєра",
                    "Доснащення автомобіля охоронним комплексом та аксесуарами",
                    "Встановимо зарядну станцію у Вас вдома",
                    "Розстрочка або кредит до 84 місяців",
                    "Доставимо сертифікований автомобіль до Вас додому",
                    "Найбільша мережа автосервісів в Україні",
                    "Власний склад запасних частин для ремонту",
                    "Страхування автомобілів КАСКО та ОСАЦВ",
                  ] : locale === "en" ? [
                    "Warranty up to 3 years on purchased vehicles",
                    "1 year of free service maintenance",
                    "Technical inspection before handover to the client",
                    "Payment to a legal entity, protected by Ukrainian law",
                    "Direct factory deliveries of electric cars",
                    "Vehicle upgrades with security systems and accessories",
                    "Home charging station installation",
                    "Installment or loan up to 84 months",
                    "Certified vehicle delivery to your door",
                    "Largest service center network in Ukraine",
                    "Own spare parts warehouse for repairs",
                    "CASCO and OSAGO vehicle insurance",
                  ] : [
                    "Гарантия до 3-х лет на купленные у нас автомобили",
                    "1 год бесплатного сервисного обслуживания",
                    "Проверка технического состояния авто перед передачей клиенту",
                    "Оплата на счёт юридического лица, защита законодательством Украины",
                    "Прямые поставки электрокаров с конвейера",
                    "Дооснащение автомобиля охранным комплексом и аксессуарами",
                    "Установим зарядную станцию у Вас дома",
                    "Рассрочка или кредит до 84 месяцев",
                    "Доставим сертифицированный автомобиль к Вам домой",
                    "Крупнейшая сеть автосервисов в Украине",
                    "Собственный склад запчастей для ремонта",
                    "Страхование автомобилей КАСКО и ОСАГО",
                  ]).map((item) => (
                    <li key={item} className="flex items-start gap-2.5 sm:gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand sm:h-5 sm:w-5" />
                      <span className="text-xs text-muted-foreground sm:text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Video Reviews ── */}
        <VideoReviews />

        {/* ── Offices (hidden on mobile) ── */}
        <section className="hidden sm:block">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:py-16 lg:px-8">
            <h2 className="mb-6 text-xl font-bold sm:mb-8 sm:text-2xl lg:text-3xl">
              {t("home.our_offices")}
            </h2>
            <div className="flex min-h-[248px] flex-wrap justify-center gap-4">
              {offices.map((office, oi) => (
                <div
                  key={office.city_ua || office.city_ru || oi}
                  className="w-[calc(50%-8px)] rounded-xl border p-4 transition-colors hover:border-brand-400/40 lg:w-[calc(25%-12px)]"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand" />
                    <span className="font-semibold">
                      {locale === "ua" ? office.city_ua : locale === "en" ? (office.city_en || office.city_ru) : office.city_ru}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {locale === "ua" ? office.address_ua : locale === "en" ? (office.address_en || office.address_ru) : office.address_ru}
                  </p>
                  <a
                    href={`tel:${office.phones[0]}`}
                    className="text-sm font-medium text-brand"
                  >
                    {office.phones[0]}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact Form (light on mobile, dark on sm+) ── */}
        <section className="bg-section py-10 sm:py-16">
          <div className="mx-auto max-w-lg px-4">
            <h2 className="mb-4 text-center text-xl font-bold sm:mb-6 sm:text-2xl">
              {t("contact.title")}
            </h2>
            <ContactForm />
          </div>
        </section>
      </main>

      {/* Callback modal */}
      <Dialog open={showCallbackModal} onOpenChange={setShowCallbackModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {locale === "ua" ? "Замовити дзвінок" : "Заказать звонок"}
            </DialogTitle>
            <p className="text-center text-sm text-muted-foreground">
              {locale === "ua"
                ? "Менеджер зв'яжеться з Вами найближчим часом"
                : "Менеджер свяжется с Вами в ближайшее время"}
            </p>
          </DialogHeader>
          <ContactForm type="callback" compact />
        </DialogContent>
      </Dialog>
      <Footer />
    </>
  );
}
