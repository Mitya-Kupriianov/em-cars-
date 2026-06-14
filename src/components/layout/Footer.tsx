"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

export function Footer() {
  const { t, locale } = useLocale();

  const servicesLabels = {
    ua: { heading: "Послуги", service: "Автосервіс", charging: "Зарядні станції", financing: "Кредит / Лізинг", testdrive: "Тест-драйв", tradein: "Trade-in", faq: "Часті питання" },
    ru: { heading: "Услуги", service: "Автосервис", charging: "Зарядные станции", financing: "Кредит / Лизинг", testdrive: "Тест-драйв", tradein: "Trade-in", faq: "Частые вопросы" },
    en: { heading: "Services", service: "Service", charging: "Charging stations", financing: "Financing", testdrive: "Test drive", tradein: "Trade-in", faq: "FAQ" },
  };
  const s = servicesLabels[locale as "ua" | "ru" | "en"] ?? servicesLabels.ua;

  return (
    <footer className="border-t bg-[#15171B] text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <img src="/logo.PNG" alt="EM" className="h-16 w-auto brightness-0 invert" />
              <span className="text-lg font-bold text-white">
                Electro<span className="text-brand-400">Motors</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-zinc-400">{t("footer.company")}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t("footer.links")}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm hover:text-white transition-colors">
                {t("nav.home")}
              </Link>
              <Link href="/catalog" className="text-sm hover:text-white transition-colors">
                {t("nav.catalog")}
              </Link>
              <Link href="/about" className="text-sm hover:text-white transition-colors">
                {t("nav.about")}
              </Link>
              <Link href="/contacts" className="text-sm hover:text-white transition-colors">
                {t("nav.contacts")}
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {s.heading}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link href="/service" className="text-sm hover:text-white transition-colors">
                {s.service}
              </Link>
              <Link href="/charging" className="text-sm hover:text-white transition-colors">
                {s.charging}
              </Link>
              <Link href="/financing" className="text-sm hover:text-white transition-colors">
                {s.financing}
              </Link>
              <Link href="/test-drive" className="text-sm hover:text-white transition-colors">
                {s.testdrive}
              </Link>
              <Link href="/trade-in" className="text-sm hover:text-white transition-colors">
                {s.tradein}
              </Link>
              <Link href="/faq" className="text-sm hover:text-white transition-colors">
                {s.faq}
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t("footer.contact")}
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+380966789000"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4 text-brand-400" />
                +380 96 678 90 00
              </a>
              <a
                href="tel:+380996789000"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4 text-brand-400" />
                +380 99 678 90 00
              </a>
              <a
                href="mailto:support@electro-motors.top"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4 text-brand-400" />
                support@electro-motors.top
              </a>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <span>
                  {t("contact.work_hours")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Electro Motors. {t("footer.rights")}.
        </div>
      </div>
    </footer>
  );
}
