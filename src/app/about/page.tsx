"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLocale } from "@/hooks/use-locale";
import { Shield, Truck, Wrench, Battery, MapPin, Award } from "lucide-react";

export default function AboutPage() {
  const { locale } = useLocale();

  const content = {
    ua: {
      title: "Про компанію Electro Motors",
      subtitle:
        "Наша мета — надання високоякісного сервісу в процесі вибору, покупки, супроводу доставки та обслуговування електромобіля.",
      mission:
        "Electro Motors — це мережа автосалонів електромобілів з прямими поставками з Китаю та США. Ми працюємо з 2020 року та вже допомогли тисячам клієнтів обрати свій ідеальний електрокар.",
      services: [
        { icon: Truck, title: "Прямі поставки", desc: "Автомобілі напряму з конвеєра — без посередників" },
        { icon: Shield, title: "Гарантія", desc: "Офіційна гарантія до 3 років на кожен автомобіль" },
        { icon: Wrench, title: "Сервіс", desc: "Власна мережа з 8+ сервісних центрів по всій Україні" },
        { icon: Battery, title: "Зарядні станції", desc: "Встановлення зарядних станцій для дому та бізнесу" },
        { icon: MapPin, title: "Мережа офісів", desc: "Присутність у 8 містах України" },
        { icon: Award, title: "Якість", desc: "Перевірка техстану кожного авто перед передачею клієнту" },
      ],
    },
    ru: {
      title: "О компании Electro Motors",
      subtitle:
        "Наша цель — предоставление высококачественного сервиса в процессе выбора, покупки, сопровождения доставки и обслуживания электромобиля.",
      mission:
        "Electro Motors — это сеть автосалонов электромобилей с прямыми поставками из Китая и США. Мы работаем с 2020 года и уже помогли тысячам клиентов выбрать свой идеальный электрокар.",
      services: [
        { icon: Truck, title: "Прямые поставки", desc: "Автомобили напрямую с конвейера — без посредников" },
        { icon: Shield, title: "Гарантия", desc: "Официальная гарантия до 3 лет на каждый автомобиль" },
        { icon: Wrench, title: "Сервис", desc: "Собственная сеть из 8+ сервисных центров по всей Украине" },
        { icon: Battery, title: "Зарядные станции", desc: "Установка зарядных станций для дома и бизнеса" },
        { icon: MapPin, title: "Сеть офисов", desc: "Присутствие в 8 городах Украины" },
        { icon: Award, title: "Качество", desc: "Проверка техсостояния каждого авто перед передачей клиенту" },
      ],
    },
  };

  const c = content[locale as "ua" | "ru"] ?? content.ua;

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-zinc-950 to-zinc-900 py-20 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="mb-4 text-3xl font-bold lg:text-4xl">{c.title}</h1>
            <p className="text-lg text-zinc-300">{c.subtitle}</p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
          <p className="mb-12 text-center text-lg text-muted-foreground">{c.mission}</p>

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
      </main>
      <Footer />
    </>
  );
}
