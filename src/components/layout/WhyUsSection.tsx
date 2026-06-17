"use client";

import { Shield, Wrench, CreditCard, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContactForm } from "@/components/cars/ContactForm";

export function WhyUsSection() {
  const { locale } = useLocale();
  const [showModal, setShowModal] = useState(false);

  const benefits = [
    {
      icon: Shield,
      title: locale === "ua" ? "Гарантія до 3 років" : locale === "en" ? "Warranty up to 3 years" : "Гарантия до 3 лет",
      desc: locale === "ua"
        ? "На всі наші електромобілі даємо чесну гарантію до 3 років"
        : locale === "en" ? "We provide an honest warranty of up to 3 years on all our electric cars"
        : "На все наши электромобили даём честную гарантию до 3 лет",
    },
    {
      icon: Wrench,
      title: locale === "ua" ? "Обслуговування 1 рік" : locale === "en" ? "Free service 1 year" : "Обслуживание 1 год",
      desc: locale === "ua"
        ? "Безкоштовне сервісне обслуговування 1 рік на нашому СТО"
        : locale === "en" ? "Free service maintenance for 1 year at our certified service center"
        : "Бесплатное сервисное обслуживание 1 год на нашем СТО",
    },
    {
      icon: CreditCard,
      title: locale === "ua" ? "Розстрочка та кредит" : locale === "en" ? "Installments & financing" : "Рассрочка и кредит",
      desc: locale === "ua"
        ? "Надаємо розстрочку на електрокар до 84 місяців, для комфортної покупки"
        : locale === "en" ? "We offer installment plans up to 84 months for a comfortable purchase"
        : "Предоставляем рассрочку на электрокар до 84 месяцев, для комфортной покупки",
    },
  ];

  return (
    <>
      <section className="cv-section py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold uppercase tracking-wide lg:text-3xl">
            {locale === "ua" ? "Чому ми найкращі" : locale === "en" ? "Why we are the best" : "Почему мы лучшие"}
          </h2>
          <div className="rounded-2xl border bg-card p-8 lg:p-10">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="space-y-8">
                {benefits.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100">
                      <item.icon className="h-6 w-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100">
                  <Phone className="h-9 w-9 text-brand-600" />
                </div>
                <h3 className="mb-6 text-xl font-bold lg:text-2xl">
                  {locale === "ua" ? "Отримайте консультацію фахівця" : locale === "en" ? "Get expert consultation" : "Получите консультацию специалиста"}
                </h3>
                <Button
                  size="lg"
                  className="h-14 bg-brand-600 px-12 text-base font-semibold uppercase tracking-wide hover:bg-brand-500"
                  onClick={() => setShowModal(true)}
                >
                  {locale === "ua" ? "Залишити запит" : locale === "en" ? "Leave a request" : "Оставить заявку"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {locale === "ua" ? "Замовити дзвінок" : locale === "en" ? "Request a Call" : "Заказать звонок"}
            </DialogTitle>
            <p className="text-center text-sm text-muted-foreground">
              {locale === "ua"
                ? "Менеджер зв'яжеться з Вами найближчим часом"
                : locale === "en" ? "Our manager will contact you shortly"
                : "Менеджер свяжется с Вами в ближайшее время"}
            </p>
          </DialogHeader>
          <ContactForm type="callback" compact />
        </DialogContent>
      </Dialog>
    </>
  );
}
