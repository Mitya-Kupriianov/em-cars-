"use client";

import { createContext, useContext, useState, useCallback, createElement, type ReactNode } from "react";
import ua from "@/messages/ua.json";
import ru from "@/messages/ru.json";
import en from "@/messages/en.json";

export type Locale = "ua" | "ru" | "en";
type Messages = typeof ua;

const messagesMap: Record<Locale, Messages> = { ua, ru, en };

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

interface LocaleContextValue {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Seeded with `initialLocale` read from the `locale` cookie on the server, so the
 * very first server render and the client hydration agree on the language — no flash,
 * no hydration mismatch.
 */
export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof document !== "undefined") {
      // Persist so the server renders the right language on the next load
      document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.setAttribute("data-locale", next);
      document.documentElement.setAttribute("lang", next);
    }
  }, []);

  const t = useCallback(
    (path: string) => getNestedValue(messagesMap[locale] as unknown as Record<string, unknown>, path),
    [locale]
  );

  const value: LocaleContextValue = { locale, messages: messagesMap[locale], setLocale, t };
  return createElement(LocaleContext.Provider, { value }, children);
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Fallback (e.g. component rendered outside the provider) — default to uk
    return {
      locale: "ua",
      messages: messagesMap.ua,
      setLocale: () => {},
      t: (path: string) => getNestedValue(messagesMap.ua as unknown as Record<string, unknown>, path),
    };
  }
  return ctx;
}
