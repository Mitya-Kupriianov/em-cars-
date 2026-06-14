"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

// lucide-react не містить брендових іконок — використовуємо власні SVG.
type IconProps = { className?: string };
const InstagramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.9.07s-3.63 0-4.9-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.21 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.42 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.14 0-3.5 0-4.74.07-.9.04-1.38.2-1.7.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.12.32-.28.8-.32 1.7C3.42 9.08 3.4 9.44 3.4 12.6c0 .14 0 .27 0 .4 0 3.14 0 3.5.07 4.74.04.9.2 1.38.32 1.7.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.12.8.28 1.7.32 1.24.07 1.6.07 4.74.07s3.5 0 4.74-.07c.9-.04 1.38-.2 1.7-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.12-.32.28-.8.32-1.7.07-1.24.07-1.6.07-4.74s0-3.5-.07-4.74c-.04-.9-.2-1.38-.32-1.7a2.85 2.85 0 0 0-.69-1.06 2.85 2.85 0 0 0-1.06-.69c-.32-.12-.8-.28-1.7-.32C15.5 4 15.14 4 12 4Zm0 3.06a4.94 4.94 0 1 1 0 9.88 4.94 4.94 0 0 1 0-9.88Zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28Zm5.14-3.24a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z" />
  </svg>
);
const FacebookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
  </svg>
);
const TikTokIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M16.6 5.82a4.28 4.28 0 0 1-1.03-2.82h-3.2v12.6a2.6 2.6 0 1 1-1.84-2.49V9.83a5.8 5.8 0 1 0 5.04 5.74V9.01a7.4 7.4 0 0 0 4.33 1.39V7.2a4.28 4.28 0 0 1-3.3-1.38Z" />
  </svg>
);
const YoutubeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M23.5 6.5a3 3 0 0 0-2.1-2.12C19.5 3.86 12 3.86 12 3.86s-7.5 0-9.4.52A3 3 0 0 0 .5 6.5 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.12c1.9.52 9.4.52 9.4.52s7.5 0 9.4-.52a3 3 0 0 0 2.1-2.12A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.5ZM9.6 15.57V8.43L15.8 12l-6.2 3.57Z" />
  </svg>
);
const TelegramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M21.94 4.27a1.3 1.3 0 0 0-1.32-.2L3.4 10.83c-.86.34-.85 1.57.02 1.89l4.3 1.56 1.66 5.02a1.07 1.07 0 0 0 1.77.46l2.4-2.27 4.27 3.14a1.3 1.3 0 0 0 2.05-.83l3.07-14.3a1.3 1.3 0 0 0-.99-1.23ZM9.7 14.13l-.66 4.06-.93-4.45 8.9-5.7-7.31 6.09Z" />
  </svg>
);

const SOCIALS = [
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/electromotors.top/", Icon: InstagramIcon },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/electromotorstop", Icon: FacebookIcon },
  { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@electromotors.top", Icon: TikTokIcon },
  { key: "youtube", label: "YouTube", href: "https://www.youtube.com/@Electro-motorstop", Icon: YoutubeIcon },
  { key: "telegram", label: "Telegram", href: "https://t.me/electromotorstop", Icon: TelegramIcon },
];

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
            <div className="mt-4 flex items-center gap-2">
              {SOCIALS.map(({ key, label, href, Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-zinc-300 transition-colors hover:bg-brand-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
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
