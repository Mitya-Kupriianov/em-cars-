"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/cars/ContactForm";
import { useLocale } from "@/hooks/use-locale";
import { Repeat, Banknote, FileText } from "lucide-react";

export default function TradeInPage() {
  const { locale } = useLocale();

  const content = {
    ua: {
      title: "Trade-in: обмін авто",
      subtitle: "Здайте свій автомобіль у залік вартості нового електромобіля. Швидка оцінка та прозорі умови.",
      points: [
        { icon: Banknote, title: "Чесна оцінка", desc: "Ринкова вартість вашого авто за актуальними цінами" },
        { icon: Repeat, title: "Залік у вартість", desc: "Сума одразу йде в рахунок нового електрокара" },
        { icon: FileText, title: "Все оформлення на нас", desc: "Документи та переоформлення беремо на себе" },
      ],
      formTitle: "Оцінити моє авто",
      hint: "Вкажіть марку, модель, рік і пробіг вашого авто в повідомленні.",
    },
    ru: {
      title: "Trade-in: обмен авто",
      subtitle: "Сдайте свой автомобиль в зачёт стоимости нового электромобиля. Быстрая оценка и прозрачные условия.",
      points: [
        { icon: Banknote, title: "Честная оценка", desc: "Рыночная стоимость вашего авто по актуальным ценам" },
        { icon: Repeat, title: "Зачёт в стоимость", desc: "Сумма сразу идёт в счёт нового электрокара" },
        { icon: FileText, title: "Всё оформление на нас", desc: "Документы и переоформление берём на себя" },
      ],
      formTitle: "Оценить моё авто",
      hint: "Укажите марку, модель, год и пробег вашего авто в сообщении.",
    },
    en: {
      title: "Trade-in",
      subtitle: "Trade in your car toward the price of a new electric vehicle. Fast valuation and transparent terms.",
      points: [
        { icon: Banknote, title: "Fair valuation", desc: "Market value of your car at current prices" },
        { icon: Repeat, title: "Credited to the price", desc: "The amount goes straight toward your new EV" },
        { icon: FileText, title: "We handle the paperwork", desc: "Documents and re-registration are on us" },
      ],
      formTitle: "Value my car",
      hint: "Specify the make, model, year and mileage of your car in the message.",
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
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="grid gap-6 sm:grid-cols-3 lg:content-start">
              {c.points.map((p) => (
                <div key={p.title} className="rounded-xl border p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                    <p.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <h3 className="mb-1 font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-1 text-lg font-semibold">{c.formTitle}</h2>
              <p className="mb-4 text-sm text-muted-foreground">{c.hint}</p>
              <ContactForm type="trade_in" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
