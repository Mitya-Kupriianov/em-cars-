"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/cars/ContactForm";
import { useLocale } from "@/hooks/use-locale";

export default function FinancingPage() {
  const { locale } = useLocale();

  const content = {
    ua: {
      title: "Кредит та лізинг",
      subtitle: "Гнучкі умови фінансування. Розрахуйте орієнтовний щомісячний платіж за кілька секунд.",
      calc: "Калькулятор платежу",
      price: "Вартість авто, $",
      down: "Перший внесок, $",
      term: "Термін, місяців",
      rate: "Ставка, % річних",
      monthly: "Орієнтовний платіж/міс",
      note: "Розрахунок попередній і не є публічною офертою. Точні умови — після консультації з менеджером.",
      formTitle: "Отримати умови фінансування",
      perMonth: "/міс",
    },
    ru: {
      title: "Кредит и лизинг",
      subtitle: "Гибкие условия финансирования. Рассчитайте ориентировочный ежемесячный платёж за несколько секунд.",
      calc: "Калькулятор платежа",
      price: "Стоимость авто, $",
      down: "Первый взнос, $",
      term: "Срок, месяцев",
      rate: "Ставка, % годовых",
      monthly: "Ориентировочный платёж/мес",
      note: "Расчёт предварительный и не является публичной офертой. Точные условия — после консультации с менеджером.",
      formTitle: "Получить условия финансирования",
      perMonth: "/мес",
    },
    en: {
      title: "Financing & leasing",
      subtitle: "Flexible financing terms. Estimate your approximate monthly payment in a few seconds.",
      calc: "Payment calculator",
      price: "Car price, $",
      down: "Down payment, $",
      term: "Term, months",
      rate: "Rate, % per year",
      monthly: "Estimated payment/mo",
      note: "This estimate is preliminary and not a public offer. Exact terms are confirmed after a consultation.",
      formTitle: "Get financing terms",
      perMonth: "/mo",
    },
  };

  const c = content[locale as "ua" | "ru" | "en"] ?? content.ua;

  const [price, setPrice] = useState(30000);
  const [down, setDown] = useState(9000);
  const [term, setTerm] = useState(36);
  const [rate, setRate] = useState(12);

  const principal = Math.max(0, price - down);
  const r = rate / 100 / 12;
  const monthly =
    principal <= 0
      ? 0
      : r === 0
        ? principal / term
        : (principal * r) / (1 - Math.pow(1 + r, -term));

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === "ua" ? "uk-UA" : locale === "en" ? "en-US" : "ru-RU", {
      maximumFractionDigits: 0,
    }).format(Math.round(n));

  const fields: { label: string; value: number; set: (v: number) => void; min: number; max: number; step: number }[] = [
    { label: c.price, value: price, set: setPrice, min: 5000, max: 200000, step: 1000 },
    { label: c.down, value: down, set: setDown, min: 0, max: price, step: 500 },
    { label: c.term, value: term, set: setTerm, min: 6, max: 84, step: 6 },
    { label: c.rate, value: rate, set: setRate, min: 0, max: 40, step: 0.5 },
  ];

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

        <section className="mx-auto max-w-3xl px-4 py-14 lg:px-8">
          <div className="rounded-xl border bg-card p-6 lg:p-8">
            <h2 className="mb-6 text-xl font-bold">{c.calc}</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.label}>
                  <label className="mb-1.5 flex items-center justify-between text-sm font-medium">
                    <span>{f.label}</span>
                    <span className="text-brand">{fmt(f.value)}</span>
                  </label>
                  <input
                    type="range"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={f.value}
                    onChange={(e) => f.set(Number(e.target.value))}
                    className="w-full accent-brand-600"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-2 rounded-xl bg-section p-6 text-center sm:flex-row sm:text-left">
              <span className="text-sm text-muted-foreground">{c.monthly}</span>
              <span className="text-3xl font-black text-brand">
                ${fmt(monthly)}<span className="text-base font-semibold text-muted-foreground">{c.perMonth}</span>
              </span>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">{c.note}</p>
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
