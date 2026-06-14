"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLocale } from "@/hooks/use-locale";
import { ChevronDown } from "lucide-react";

export default function FaqPage() {
  const { locale } = useLocale();
  const [open, setOpen] = useState<number | null>(0);

  const content = {
    ua: {
      title: "Часті запитання",
      subtitle: "Відповіді на найпоширеніші питання про купівлю та обслуговування електромобіля.",
      items: [
        { q: "Чи є гарантія на автомобілі?", a: "Так, на кожен автомобіль діє офіційна гарантія до 3 років. Деталі залежать від моделі та виробника — уточнюйте у менеджера." },
        { q: "Скільки триває доставка?", a: "Авто з наявності в Україні передаємо одразу після оформлення. Поставка під замовлення з Китаю або США зазвичай займає від 4 до 8 тижнів." },
        { q: "Чи допомагаєте з розмитненням?", a: "Так, ми беремо на себе повний супровід розмитнення та оформлення документів. Усі витрати прозоро прописані в договорі." },
        { q: "Чи можна оформити кредит або лізинг?", a: "Так, ми співпрацюємо з банками та лізинговими компаніями. Орієнтовний платіж можна розрахувати на сторінці «Кредит / Лізинг»." },
        { q: "Як працює зарядка електромобіля?", a: "Заряджати можна вдома від звичайної розетки чи wallbox, а також на публічних станціях. Ми встановлюємо домашні зарядні станції — див. сторінку «Зарядні станції»." },
        { q: "Який запас ходу взимку?", a: "Взимку запас ходу зменшується приблизно на 15–30% залежно від моделі та температури. Підігрів батареї та помірний стиль їзди мінімізують втрати." },
        { q: "Чи є сервісне обслуговування?", a: "Так, у нас власна мережа з 8+ сервісних центрів по Україні. Запис на сервіс — на сторінці «Автосервіс»." },
      ],
    },
    ru: {
      title: "Частые вопросы",
      subtitle: "Ответы на самые распространённые вопросы о покупке и обслуживании электромобиля.",
      items: [
        { q: "Есть ли гарантия на автомобили?", a: "Да, на каждый автомобиль действует официальная гарантия до 3 лет. Детали зависят от модели и производителя — уточняйте у менеджера." },
        { q: "Сколько длится доставка?", a: "Авто из наличия в Украине передаём сразу после оформления. Поставка под заказ из Китая или США обычно занимает от 4 до 8 недель." },
        { q: "Помогаете ли с растаможкой?", a: "Да, мы берём на себя полное сопровождение растаможки и оформления документов. Все расходы прозрачно прописаны в договоре." },
        { q: "Можно ли оформить кредит или лизинг?", a: "Да, мы сотрудничаем с банками и лизинговыми компаниями. Ориентировочный платёж можно рассчитать на странице «Кредит / Лизинг»." },
        { q: "Как работает зарядка электромобиля?", a: "Заряжать можно дома от обычной розетки или wallbox, а также на публичных станциях. Мы устанавливаем домашние зарядные станции — см. страницу «Зарядные станции»." },
        { q: "Какой запас хода зимой?", a: "Зимой запас хода уменьшается примерно на 15–30% в зависимости от модели и температуры. Подогрев батареи и умеренный стиль езды минимизируют потери." },
        { q: "Есть ли сервисное обслуживание?", a: "Да, у нас собственная сеть из 8+ сервисных центров по Украине. Запись на сервис — на странице «Автосервис»." },
      ],
    },
    en: {
      title: "Frequently asked questions",
      subtitle: "Answers to the most common questions about buying and owning an electric car.",
      items: [
        { q: "Is there a warranty on the cars?", a: "Yes, every car comes with an official warranty of up to 3 years. Details depend on the model and manufacturer — ask your manager." },
        { q: "How long does delivery take?", a: "In-stock cars in Ukraine are handed over right after paperwork. Made-to-order supply from China or the USA usually takes 4 to 8 weeks." },
        { q: "Do you help with customs clearance?", a: "Yes, we handle the full customs clearance and paperwork. All costs are transparently stated in the contract." },
        { q: "Can I get a loan or leasing?", a: "Yes, we work with banks and leasing companies. You can estimate the monthly payment on the “Financing” page." },
        { q: "How does charging an EV work?", a: "You can charge at home from a regular socket or a wallbox, as well as at public stations. We install home charging stations — see the “Charging stations” page." },
        { q: "What is the winter driving range?", a: "In winter the range drops by roughly 15–30% depending on the model and temperature. Battery preheating and a moderate driving style minimize the loss." },
        { q: "Do you provide servicing?", a: "Yes, we have our own network of 8+ service centers across Ukraine. Book a service on the “Service” page." },
      ],
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

        <section className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
          <div className="space-y-3">
            {c.items.map((item, i) => (
              <div key={i} className="overflow-hidden rounded-xl border bg-card">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium transition-colors hover:bg-muted"
                >
                  {item.q}
                  <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && (
                  <div className="border-t px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
