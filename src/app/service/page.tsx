"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/cars/ContactForm";
import { useLocale } from "@/hooks/use-locale";
import { Battery, Wrench, Gauge, Snowflake, CircuitBoard, ShieldCheck } from "lucide-react";

export default function ServicePage() {
  const { locale } = useLocale();

  const content = {
    ua: {
      title: "Автосервіс електромобілів",
      subtitle: "Власна мережа сервісних центрів. Діагностика, обслуговування та ремонт електрокарів будь-якої складності.",
      servicesTitle: "Послуги сервісу",
      services: [
        { icon: Battery, title: "Діагностика батареї", desc: "Перевірка стану та ємності високовольтної батареї" },
        { icon: CircuitBoard, title: "Електроніка", desc: "Ремонт і налаштування інверторів, контролерів, BMS" },
        { icon: Wrench, title: "Планове ТО", desc: "Регламентне обслуговування за пробігом" },
        { icon: Gauge, title: "Ходова та гальма", desc: "Підвіска, гальмівна система, рекуперація" },
        { icon: Snowflake, title: "Клімат і термоменеджмент", desc: "Кондиціонер, тепловий насос, охолодження батареї" },
        { icon: ShieldCheck, title: "Передпродажна підготовка", desc: "Повна перевірка авто перед передачею клієнту" },
      ],
      formTitle: "Записатися на сервіс",
    },
    ru: {
      title: "Автосервис электромобилей",
      subtitle: "Собственная сеть сервисных центров. Диагностика, обслуживание и ремонт электрокаров любой сложности.",
      servicesTitle: "Услуги сервиса",
      services: [
        { icon: Battery, title: "Диагностика батареи", desc: "Проверка состояния и ёмкости высоковольтной батареи" },
        { icon: CircuitBoard, title: "Электроника", desc: "Ремонт и настройка инверторов, контроллеров, BMS" },
        { icon: Wrench, title: "Плановое ТО", desc: "Регламентное обслуживание по пробегу" },
        { icon: Gauge, title: "Ходовая и тормоза", desc: "Подвеска, тормозная система, рекуперация" },
        { icon: Snowflake, title: "Климат и терморегуляция", desc: "Кондиционер, тепловой насос, охлаждение батареи" },
        { icon: ShieldCheck, title: "Предпродажная подготовка", desc: "Полная проверка авто перед передачей клиенту" },
      ],
      formTitle: "Записаться на сервис",
    },
    en: {
      title: "EV service center",
      subtitle: "Our own network of service centers. Diagnostics, maintenance and repair of electric cars of any complexity.",
      servicesTitle: "Service offering",
      services: [
        { icon: Battery, title: "Battery diagnostics", desc: "Health and capacity check of the high-voltage battery" },
        { icon: CircuitBoard, title: "Electronics", desc: "Repair and tuning of inverters, controllers, BMS" },
        { icon: Wrench, title: "Scheduled maintenance", desc: "Routine servicing based on mileage" },
        { icon: Gauge, title: "Chassis & brakes", desc: "Suspension, braking system, regenerative braking" },
        { icon: Snowflake, title: "Climate & thermal management", desc: "A/C, heat pump, battery cooling" },
        { icon: ShieldCheck, title: "Pre-sale preparation", desc: "Full inspection of the car before handover" },
      ],
      formTitle: "Book a service",
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
          <h2 className="mb-8 text-center text-2xl font-bold">{c.servicesTitle}</h2>
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

        <section className="bg-section py-14">
          <div className="mx-auto max-w-md px-4 lg:px-8">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-center text-lg font-semibold">{c.formTitle}</h2>
              <ContactForm type="general" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
