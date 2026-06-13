import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Pick the city name for the current locale, falling back across languages. */
export function localizedCity(
  car: { city_ua?: string | null; city_ru?: string | null; city_en?: string | null },
  locale: string
): string {
  if (locale === "ua") return car.city_ua || car.city_ru || car.city_en || "";
  if (locale === "en") return car.city_en || car.city_ru || car.city_ua || "";
  return car.city_ru || car.city_ua || car.city_en || "";
}
