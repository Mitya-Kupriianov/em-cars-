"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Calculator, CarFront, Repeat } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { ContactForm } from "@/components/cars/ContactForm";
import { CreditCalc } from "@/components/cars/CreditCalc";
import { useLocale } from "@/hooks/use-locale";

type ModalKind = "credit" | "trade_in" | "test_drive" | null;

export function DealTools() {
  const { locale } = useLocale();
  const [modal, setModal] = useState<ModalKind>(null);
  const [inStock, setInStock] = useState<number | null>(null);
  const [calcPrice, setCalcPrice] = useState(30000);

  useEffect(() => {
    fetch("/api/cars?status=in_stock")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setInStock(data.length); })
      .catch(() => {});
  }, []);

  const tiles = [
    {
      key: "credit" as const,
      icon: Calculator,
      value: locale === "ua" ? "від $310/міс" : locale === "en" ? "from $310/mo" : "от $310/мес",
      label: locale === "ua" ? "Кредитний калькулятор" : locale === "en" ? "Loan Calculator" : "Кредитный калькулятор",
      onClick: () => setModal("credit"),
    },
    {
      key: "trade_in" as const,
      icon: Repeat,
      value: "Trade-in",
      label: locale === "ua" ? "Оцінка вашого авто" : locale === "en" ? "Estimate your car" : "Оценка вашего авто",
      onClick: () => setModal("trade_in"),
    },
    {
      key: "test_drive" as const,
      icon: CalendarCheck,
      value: locale === "ua" ? "Тест-драйв" : locale === "en" ? "Test Drive" : "Тест-драйв",
      label: locale === "ua" ? "Запис онлайн" : locale === "en" ? "Book online" : "Запись онлайн",
      onClick: () => setModal("test_drive"),
    },
  ];

  const tileClass =
    "group flex w-full flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left transition-colors hover:border-brand-400/40";

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <button key={tile.key} onClick={tile.onClick} className={`${tileClass} cursor-pointer`}>
            <tile.icon className="h-6 w-6 text-brand" />
            <div>
              <div className="text-xl font-bold text-brand">{tile.value}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{tile.label}</div>
            </div>
          </button>
        ))}

        <Link href="/catalog?status=in_stock" className={tileClass}>
          <CarFront className="h-6 w-6 text-brand" />
          <div>
            <div className="text-xl font-bold text-brand">
              {inStock !== null ? `${inStock}+` : "—"}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              {locale === "ua" ? "Авто в наявності" : locale === "en" ? "Cars in stock" : "Авто в наличии"}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>
      </div>

      <Dialog open={modal === "credit"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {locale === "ua" ? "Кредитний калькулятор" : locale === "en" ? "Loan Calculator" : "Кредитный калькулятор"}
            </DialogTitle>
          </DialogHeader>
          <div className="mb-1">
            <div className="mb-2 flex justify-between text-sm">
              <span>{locale === "ua" ? "Вартість авто" : locale === "en" ? "Car price" : "Стоимость авто"}</span>
              <span className="font-semibold">${calcPrice.toLocaleString()}</span>
            </div>
            <Slider
              min={10000}
              max={80000}
              step={1000}
              value={[calcPrice]}
              onValueChange={(val) => setCalcPrice((val as number[])[0])}
            />
          </div>
          <CreditCalc price={calcPrice} />
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "trade_in"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Trade-in</DialogTitle>
            <p className="text-center text-sm text-muted-foreground">
              {locale === "ua"
                ? "Опишіть ваше авто — менеджер оцінить його та запропонує умови обміну"
                : locale === "en" ? "Describe your car — our manager will assess it and offer trade-in terms"
                : "Опишите ваше авто — менеджер оценит его и предложит условия обмена"}
            </p>
          </DialogHeader>
          <ContactForm type="general" />
        </DialogContent>
      </Dialog>

      <Dialog open={modal === "test_drive"} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {locale === "ua" ? "Запис на тест-драйв" : locale === "en" ? "Book a Test Drive" : "Запись на тест-драйв"}
            </DialogTitle>
            <p className="text-center text-sm text-muted-foreground">
              {locale === "ua"
                ? "Залиште контакти — узгодимо зручний час та авто"
                : locale === "en" ? "Leave your contacts — we'll arrange a convenient time and car"
                : "Оставьте контакты — согласуем удобное время и авто"}
            </p>
          </DialogHeader>
          <ContactForm type="test_drive" compact />
        </DialogContent>
      </Dialog>
    </section>
  );
}
