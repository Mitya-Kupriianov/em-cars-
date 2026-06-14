"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/cars/ContactForm";
import { useLocale } from "@/hooks/use-locale";
import { CalendarCheck, Car, MapPin } from "lucide-react";

export default function TestDrivePage() {
  const { locale } = useLocale();

  const content = {
    ua: {
      title: "Запис на тест-драйв",
      subtitle: "Відчуйте електромобіль у русі. Оберіть зручний час — менеджер зв'яжеться для підтвердження.",
      points: [
        { icon: Car, title: "Будь-яка модель", desc: "Тест-драйв доступний для авто в наявності" },
        { icon: MapPin, title: "8 міст України", desc: "Оберіть найближчий до вас салон" },
        { icon: CalendarCheck, title: "Зручний час", desc: "Підлаштуємось під ваш графік" },
      ],
      formTitle: "Залишити заявку",
      hint: "У повідомленні вкажіть бажану модель, місто та дату.",
    },
    ru: {
      title: "Запись на тест-драйв",
      subtitle: "Почувствуйте электромобиль в движении. Выберите удобное время — менеджер свяжется для подтверждения.",
      points: [
        { icon: Car, title: "Любая модель", desc: "Тест-драйв доступен для авто в наличии" },
        { icon: MapPin, title: "8 городов Украины", desc: "Выберите ближайший к вам салон" },
        { icon: CalendarCheck, title: "Удобное время", desc: "Подстроимся под ваш график" },
      ],
      formTitle: "Оставить заявку",
      hint: "В сообщении укажите желаемую модель, город и дату.",
    },
    en: {
      title: "Book a test drive",
      subtitle: "Feel the electric car in motion. Pick a convenient time — a manager will call to confirm.",
      points: [
        { icon: Car, title: "Any model", desc: "Test drive available for in-stock cars" },
        { icon: MapPin, title: "8 cities in Ukraine", desc: "Choose the showroom nearest to you" },
        { icon: CalendarCheck, title: "Convenient time", desc: "We'll fit your schedule" },
      ],
      formTitle: "Leave a request",
      hint: "In the message, specify the preferred model, city and date.",
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
              <ContactForm type="test_drive" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
