"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/cars/ContactForm";
import { useLocale } from "@/hooks/use-locale";
import { Home, Building2, Zap, Plug, Gauge, Wrench } from "lucide-react";

export default function ChargingPage() {
  const { locale } = useLocale();

  const content = {
    ua: {
      title: "Зарядні станції",
      subtitle: "Підбір, продаж та встановлення зарядних станцій для дому та бізнесу під ключ.",
      optionsTitle: "Рішення для зарядки",
      options: [
        { icon: Home, title: "Для дому", desc: "Wallbox 7–22 кВт з установкою та налаштуванням" },
        { icon: Building2, title: "Для бізнесу", desc: "Станції для паркінгів, ТРЦ, готелів та автопарків" },
        { icon: Zap, title: "Швидка зарядка", desc: "DC-станції для швидкого поповнення заряду" },
      ],
      stepsTitle: "Як це працює",
      steps: [
        { icon: Plug, title: "Консультація", desc: "Підбираємо станцію під ваше авто та електромережу" },
        { icon: Gauge, title: "Розрахунок", desc: "Оцінюємо потужність і кошторис підключення" },
        { icon: Wrench, title: "Монтаж", desc: "Встановлюємо, підключаємо та проводимо запуск" },
      ],
      formTitle: "Замовити консультацію",
    },
    ru: {
      title: "Зарядные станции",
      subtitle: "Подбор, продажа и установка зарядных станций для дома и бизнеса под ключ.",
      optionsTitle: "Решения для зарядки",
      options: [
        { icon: Home, title: "Для дома", desc: "Wallbox 7–22 кВт с установкой и настройкой" },
        { icon: Building2, title: "Для бизнеса", desc: "Станции для паркингов, ТРЦ, отелей и автопарков" },
        { icon: Zap, title: "Быстрая зарядка", desc: "DC-станции для быстрого пополнения заряда" },
      ],
      stepsTitle: "Как это работает",
      steps: [
        { icon: Plug, title: "Консультация", desc: "Подбираем станцию под ваше авто и электросеть" },
        { icon: Gauge, title: "Расчёт", desc: "Оцениваем мощность и смету подключения" },
        { icon: Wrench, title: "Монтаж", desc: "Устанавливаем, подключаем и проводим запуск" },
      ],
      formTitle: "Заказать консультацию",
    },
    en: {
      title: "Charging stations",
      subtitle: "Turnkey selection, sale and installation of charging stations for home and business.",
      optionsTitle: "Charging solutions",
      options: [
        { icon: Home, title: "For home", desc: "7–22 kW wallbox with installation and setup" },
        { icon: Building2, title: "For business", desc: "Stations for parking lots, malls, hotels and fleets" },
        { icon: Zap, title: "Fast charging", desc: "DC stations for quick top-ups" },
      ],
      stepsTitle: "How it works",
      steps: [
        { icon: Plug, title: "Consultation", desc: "We pick a station for your car and power grid" },
        { icon: Gauge, title: "Assessment", desc: "We estimate the power and connection cost" },
        { icon: Wrench, title: "Installation", desc: "We install, connect and commission it" },
      ],
      formTitle: "Request a consultation",
    },
  };

  const c = content[locale as "ua" | "ru" | "en"] ?? content.ua;

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-zinc-950 to-zinc-900 py-16 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="mb-3 text-3xl font-bold lg:text-4xl">{c.title}</h1>
            <p className="text-zinc-300">{c.subtitle}</p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold">{c.optionsTitle}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {c.options.map((o) => (
              <div key={o.title} className="rounded-xl border p-6 transition-colors hover:border-brand-400/40">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                  <o.icon className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="mb-1 font-semibold">{o.title}</h3>
                <p className="text-sm text-muted-foreground">{o.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-section py-14">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <h2 className="mb-10 text-center text-2xl font-bold">{c.stepsTitle}</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {c.steps.map((s, i) => (
                <div key={s.title} className="relative rounded-xl border bg-card p-6">
                  <span className="absolute right-4 top-4 text-3xl font-black text-brand/10">{i + 1}</span>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                    <s.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <h3 className="mb-1 font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-md px-4 py-14 lg:px-8">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-center text-lg font-semibold">{c.formTitle}</h2>
            <ContactForm type="general" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
