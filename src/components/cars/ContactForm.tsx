"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/hooks/use-locale";
import { ContactRequest } from "@/types/car";
import { Send, CheckCircle } from "lucide-react";

interface ContactFormProps {
  carId?: string;
  type?: ContactRequest["type"];
  compact?: boolean;
}

export function ContactForm({ carId, type = "callback", compact }: ContactFormProps) {
  const { t } = useLocale();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: ContactRequest = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: (formData.get("email") as string) || undefined,
      message: (formData.get("message") as string) || undefined,
      car_id: carId,
      type,
    };

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-brand-50 p-6 text-center">
        <CheckCircle className="h-10 w-10 text-brand-600" />
        <p className="font-medium text-brand-800">{t("contact.success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input name="name" placeholder={t("contact.name")} required />
      <PhoneInput name="phone" required />
      {!compact && <Input name="email" placeholder={t("contact.email")} type="email" />}
      {!compact && <Textarea name="message" placeholder={t("contact.message")} rows={3} />}
      <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-500" disabled={loading}>
        <Send className="mr-2 h-4 w-4" />
        {t("contact.send")}
      </Button>
    </form>
  );
}
