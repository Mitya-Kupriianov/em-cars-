"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, Phone, X, Globe, Scale } from "lucide-react";
import { useLocale, type Locale } from "@/hooks/use-locale";
import { useCompare } from "@/hooks/use-compare";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "ua", label: "Українська", flag: "🇺🇦" },
  { code: "ru", label: "Русский",    flag: "🇷🇺" },
  { code: "en", label: "English",    flag: "🇬🇧" },
];

export function Header() {
  const { t, locale, setLocale } = useLocale();
  const router = useRouter();
  const { count } = useCompare();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  function openCompare() {
    router.push(count > 0 ? "/compare" : "/catalog");
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/catalog", label: t("nav.catalog") },
    { href: "/about", label: t("nav.about") },
    { href: "/contacts", label: t("nav.contacts") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.PNG" alt="EM" className="h-16 w-auto brightness-0 invert light:filter-none" />
          <span className="text-lg font-bold tracking-tight">
            Electro<span className="text-brand">Motors</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Desktop-only controls */}
          <a
            href="tel:+380966789000"
            className="hidden items-center gap-1.5 text-sm font-medium lg:flex"
          >
            <Phone className="h-4 w-4" />
            +380 96 678 90 00
          </a>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />

            {/* Language switcher */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted"
                aria-label="Select language"
              >
                <Globe className="h-4 w-4" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full z-50 mt-1.5 w-44 overflow-hidden rounded-lg border bg-popover py-1 shadow-lg">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLocale(lang.code); setLangOpen(false); }}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-muted ${locale === lang.code ? "font-semibold text-brand" : "text-foreground"}`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      {lang.label}
                      {locale === lang.code && <span className="ml-auto text-brand">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compare (scales) */}
            <button
              onClick={openCompare}
              className="relative flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted"
              aria-label={t("compare.title")}
              title={t("compare.title")}
            >
              <Scale className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-none text-white">
                  {count}
                </span>
              )}
            </button>
          </div>

          {/* Mobile burger — со счётчиком сравнення над кнопкою */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted md:hidden"
            aria-label="Menu"
          >
            {!mobileOpen && count > 0 && (
              <span className="absolute -right-1 -top-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-none text-white">
                {count}
              </span>
            )}
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile fullscreen menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-background md:hidden">
          {/* Top bar */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
              <img src="/logo.PNG" alt="EM" className="h-12 w-auto brightness-0 invert light:filter-none" />
              <span className="text-lg font-bold tracking-tight">
                Electro<span className="text-brand">Motors</span>
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Закрити"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-lg font-medium transition-colors hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:+380966789000"
              className="mt-2 flex items-center gap-2 rounded-lg px-3 py-3 text-lg font-medium text-brand"
            >
              <Phone className="h-5 w-5" />
              +380 96 678 90 00
            </a>
          </nav>

          {/* Theme / Language / Compare */}
          <div className="shrink-0 border-t p-4">
            <div className="flex items-center justify-between gap-3">
              <ThemeToggle />

              <div className="flex items-center gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors ${locale === lang.code ? "border-brand font-semibold text-brand" : "text-foreground hover:bg-muted"}`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    {lang.code.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Compare — счётчик возле весов */}
              <button
                onClick={() => { setMobileOpen(false); openCompare(); }}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:bg-muted"
                aria-label={t("compare.title")}
                title={t("compare.title")}
              >
                <Scale className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-none text-white">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
