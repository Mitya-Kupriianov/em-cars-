"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLocale } from "@/hooks/use-locale";
import {
  Shield, Truck, Wrench, Battery, MapPin, Award,
  Search, FileCheck, PackageCheck, Headphones, ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  const { locale } = useLocale();

  const content = {
    ua: {
      title: "Про компанію Electro Motors",
      subtitle:
        "Наша мета — надання високоякісного сервісу в процесі вибору, покупки, супроводу доставки та обслуговування електромобіля.",
      mission:
        "Electro Motors — це мережа автосалонів електромобілів з прямими поставками з Китаю та США. Ми працюємо з 2020 року та вже допомогли тисячам клієнтів обрати свій ідеальний електрокар.",
      statsTitle: "Electro Motors у цифрах",
      stats: [
        { value: "5+", label: "років на ринку" },
        { value: "8", label: "міст України" },
        { value: "1000+", label: "задоволених клієнтів" },
        { value: "3", label: "роки гарантії" },
      ],
      servicesTitle: "Що ми пропонуємо",
      services: [
        { icon: Truck, title: "Прямі поставки", desc: "Автомобілі напряму з конвеєра — без посередників" },
        { icon: Shield, title: "Гарантія", desc: "Офіційна гарантія до 3 років на кожен автомобіль" },
        { icon: Wrench, title: "Сервіс", desc: "Власна мережа з 8+ сервісних центрів по всій Україні" },
        { icon: Battery, title: "Зарядні станції", desc: "Встановлення зарядних станцій для дому та бізнесу" },
        { icon: MapPin, title: "Мережа офісів", desc: "Присутність у 8 містах України" },
        { icon: Award, title: "Якість", desc: "Перевірка техстану кожного авто перед передачею клієнту" },
      ],
      processTitle: "Як ми працюємо",
      process: [
        { icon: Search, title: "Підбір", desc: "Допомагаємо обрати авто під ваш бюджет і потреби" },
        { icon: FileCheck, title: "Оформлення", desc: "Прозорий договір, кредит або лізинг за потреби" },
        { icon: PackageCheck, title: "Доставка", desc: "Привозимо авто та проводимо передпродажну підготовку" },
        { icon: Headphones, title: "Супровід", desc: "Сервіс, запчастини та підтримка після покупки" },
      ],
      ctaTitle: "Готові обрати свій електромобіль?",
      ctaText: "Перегляньте каталог або залиште заявку — ми допоможемо з вибором.",
      ctaCatalog: "Дивитись каталог",
      ctaContact: "Зв'язатися з нами",
    },
    ru: {
      title: "О компании Electro Motors",
      subtitle:
        "Наша цель — предоставление высококачественного сервиса в процессе выбора, покупки, сопровождения доставки и обслуживания электромобиля.",
      mission:
        "Electro Motors — это сеть автосалонов электромобилей с прямыми поставками из Китая и США. Мы работаем с 2020 года и уже помогли тысячам клиентов выбрать свой идеальный электрокар.",
      statsTitle: "Electro Motors в цифрах",
      stats: [
        { value: "5+", label: "лет на рынке" },
        { value: "8", label: "городов Украины" },
        { value: "1000+", label: "довольных клиентов" },
        { value: "3", label: "года гарантии" },
      ],
      servicesTitle: "Что мы предлагаем",
      services: [
        { icon: Truck, title: "Прямые поставки", desc: "Автомобили напрямую с конвейера — без посредников" },
        { icon: Shield, title: "Гарантия", desc: "Официальная гарантия до 3 лет на каждый автомобиль" },
        { icon: Wrench, title: "Сервис", desc: "Собственная сеть из 8+ сервисных центров по всей Украине" },
        { icon: Battery, title: "Зарядные станции", desc: "Установка зарядных станций для дома и бизнеса" },
        { icon: MapPin, title: "Сеть офисов", desc: "Присутствие в 8 городах Украины" },
        { icon: Award, title: "Качество", desc: "Проверка техсостояния каждого авто перед передачей клиенту" },
      ],
      processTitle: "Как мы работаем",
      process: [
        { icon: Search, title: "Подбор", desc: "Помогаем выбрать авто под ваш бюджет и потребности" },
        { icon: FileCheck, title: "Оформление", desc: "Прозрачный договор, кредит или лизинг при необходимости" },
        { icon: PackageCheck, title: "Доставка", desc: "Привозим авто и проводим предпродажную подготовку" },
        { icon: Headphones, title: "Сопровождение", desc: "Сервис, запчасти и поддержка после покупки" },
      ],
      ctaTitle: "Готовы выбрать свой электромобиль?",
      ctaText: "Посмотрите каталог или оставьте заявку — мы поможем с выбором.",
      ctaCatalog: "Смотреть каталог",
      ctaContact: "Связаться с нами",
    },
    en: {
      title: "About Electro Motors",
      subtitle:
        "Our goal is to deliver a high-quality service through the whole journey: choosing, buying, delivering and maintaining your electric car.",
      mission:
        "Electro Motors is a network of EV dealerships with direct supply from China and the USA. We have been operating since 2020 and have already helped thousands of customers choose their perfect electric car.",
      statsTitle: "Electro Motors in numbers",
      stats: [
        { value: "5+", label: "years on the market" },
        { value: "8", label: "cities in Ukraine" },
        { value: "1000+", label: "happy customers" },
        { value: "3", label: "years warranty" },
      ],
      servicesTitle: "What we offer",
      services: [
        { icon: Truck, title: "Direct supply", desc: "Cars straight from the line — no middlemen" },
        { icon: Shield, title: "Warranty", desc: "Official warranty of up to 3 years on every car" },
        { icon: Wrench, title: "Service", desc: "Our own network of 8+ service centers across Ukraine" },
        { icon: Battery, title: "Charging stations", desc: "Installation of charging stations for home and business" },
        { icon: MapPin, title: "Office network", desc: "Presence in 8 cities of Ukraine" },
        { icon: Award, title: "Quality", desc: "Technical inspection of every car before handover" },
      ],
      processTitle: "How we work",
      process: [
        { icon: Search, title: "Selection", desc: "We help you pick a car for your budget and needs" },
        { icon: FileCheck, title: "Paperwork", desc: "Transparent contract, financing or leasing if needed" },
        { icon: PackageCheck, title: "Delivery", desc: "We bring the car and do the pre-sale preparation" },
        { icon: Headphones, title: "Support", desc: "Service, spare parts and support after the purchase" },
      ],
      ctaTitle: "Ready to choose your electric car?",
      ctaText: "Browse the catalog or leave a request — we'll help you choose.",
      ctaCatalog: "View catalog",
      ctaContact: "Contact us",
    },
  };

  const c = content[locale as "ua" | "ru" | "en"] ?? content.ua;

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-zinc-950 to-zinc-900 py-20 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="mb-4 text-3xl font-bold lg:text-4xl">{c.title}</h1>
            <p className="text-lg text-zinc-300">{c.subtitle}</p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b bg-card">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-12 sm:grid-cols-4 lg:px-8">
            {c.stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-brand lg:text-4xl">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission + services */}
        <section className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
          <p className="mb-12 text-center text-lg text-muted-foreground">{c.mission}</p>

          <h2 className="mb-6 text-center text-2xl font-bold">{c.servicesTitle}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.services.map((s) => (
              <div key={s.title} className="rounded-xl border p-6 transition-colors hover:border-brand-400/40">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                  <s.icon className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="mb-1 font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="bg-section py-16">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <h2 className="mb-10 text-center text-2xl font-bold">{c.processTitle}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {c.process.map((p, i) => (
                <div key={p.title} className="relative rounded-xl border bg-card p-6">
                  <span className="absolute right-4 top-4 text-3xl font-black text-brand/10">{i + 1}</span>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                    <p.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <h3 className="mb-1 font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-8">
          <h2 className="mb-3 text-2xl font-bold">{c.ctaTitle}</h2>
          <p className="mb-8 text-muted-foreground">{c.ctaText}</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/catalog"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700 sm:w-auto"
            >
              {c.ctaCatalog}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contacts"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted sm:w-auto"
            >
              {c.ctaContact}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
