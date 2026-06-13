"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/cars/ContactForm";
import { useLocale } from "@/hooks/use-locale";
import { offices } from "@/lib/data";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactsPage() {
  const { t, locale } = useLocale();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <h1 className="mb-8 text-3xl font-bold">{t("contact.title")}</h1>

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div>
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                {offices.map((office, oi) => (
                  <div key={office.city_ua || office.city_ru || oi} className="rounded-xl border bg-card p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand" />
                      <h3 className="font-semibold">
                        {locale === "ua" ? office.city_ua : locale === "en" ? (office.city_en || office.city_ru) : office.city_ru}
                      </h3>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {locale === "ua" ? office.address_ua : locale === "en" ? (office.address_en || office.address_ru) : office.address_ru}
                    </p>
                    {office.phones.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone}`}
                        className="flex items-center gap-1.5 text-sm text-brand"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {phone}
                      </a>
                    ))}
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border bg-card p-5">
                  <Mail className="h-5 w-5 text-brand" />
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <a href="mailto:support@electro-motors.top" className="font-medium">
                      support@electro-motors.top
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border bg-card p-5">
                  <Clock className="h-5 w-5 text-brand" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {locale === "ua" ? "Графік роботи" : locale === "en" ? "Working hours" : "График работы"}
                    </div>
                    <div className="font-medium">{t("contact.work_hours")}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">{t("car.callback")}</h2>
              <ContactForm type="general" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
