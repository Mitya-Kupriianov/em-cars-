"use client";

import { useState } from "react";
import { MessageCircle, X, Phone, Send } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

// Реальні канали зв'язку (з linktr.ee/electromotorstop).
const PHONE = "+380966789000";
const CHANNELS = [
  { key: "telegram", label: "Telegram", href: "https://t.me/electromotorstop", color: "#229ED9", Icon: Send },
  { key: "viber", label: "Viber", href: "https://share.cdn.viber.com/pg_download?id=0-04-05-00580e61de8594db02c53972408fad23a10c60a2f8fda2c8078d5d9c8bd1190a", color: "#7360F2", Icon: MessageCircle },
  { key: "phone", label: PHONE, href: `tel:${PHONE}`, color: "#2B57A5", Icon: Phone },
];

export function FloatingContact() {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);

  const aria = locale === "ru" ? "Связаться с нами" : locale === "en" ? "Contact us" : "Зв'язатися з нами";

  return (
    <div className="fixed bottom-5 right-5 z-[55] flex flex-col items-end gap-3 print:hidden">
      {open && (
        <div className="flex flex-col items-end gap-2">
          {CHANNELS.map(({ key, label, href, color, Icon }) => (
            <a
              key={key}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-full bg-card py-2 pl-3 pr-4 text-sm font-medium shadow-lg ring-1 ring-black/5 transition-transform hover:scale-105"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ backgroundColor: color }}>
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </a>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={aria}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl transition-colors hover:bg-brand-700"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
