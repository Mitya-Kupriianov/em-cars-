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
    <header className="sticky top-0 z-50 border-b bg-background">
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
          <a
            href="tel:+380966789000"
            className="hidden items-center gap-1.5 text-sm font-medium lg:flex"
          >
            <Phone className="h-4 w-4" />
            +380 96 678 90 00
          </a>

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

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:+380966789000"
              className="mt-2 flex items-center gap-2 text-base font-medium text-brand"
            >
              <Phone className="h-4 w-4" />
              +380 96 678 90 00
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
