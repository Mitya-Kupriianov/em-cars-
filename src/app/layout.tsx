import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { LocaleProvider, type Locale } from "@/hooks/use-locale";
import { CompareProvider } from "@/hooks/use-compare";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Electro Motors — Електромобілі з Китаю та США",
  description:
    "Продаж електромобілів BYD, Zeekr, Volkswagen, Honda та інших. Прямі поставки, гарантія до 3 років, кредитування до 84 місяців.",
  keywords: "електромобілі, купити електромобіль, BYD, Zeekr, електрокар, Україна",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale")?.value;
  const locale: Locale = localeCookie === "ru" || localeCookie === "en" || localeCookie === "ua" ? localeCookie : "ua";
  const isLight = cookieStore.get("theme")?.value === "light";

  return (
    <html
      lang={locale}
      data-locale={locale}
      className={`${inter.variable} h-full antialiased${isLight ? " light" : ""}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <LocaleProvider initialLocale={locale}>
          <ClerkProvider>
            <CompareProvider>
              {children}
            </CompareProvider>
          </ClerkProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}