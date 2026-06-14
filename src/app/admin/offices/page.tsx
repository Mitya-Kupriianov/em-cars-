"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, Loader2, MapPin, GripVertical } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { PhoneInput } from "@/components/ui/phone-input";

interface Office {
  id?: string;
  city_ua: string;
  city_ru: string;
  city_en?: string;
  address_ua: string;
  address_ru: string;
  address_en?: string;
  phones: string[];
  sort_order?: number;
}

const emptyOffice = (): Office => ({
  city_ua: "",
  city_ru: "",
  city_en: "",
  address_ua: "",
  address_ru: "",
  address_en: "",
  phones: [""],
});

export default function OfficesPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
  const [confirmDeletePhone, setConfirmDeletePhone] = useState<{ office: number; phone: number } | null>(null);

  useEffect(() => {
    fetch("/api/offices")
      .then((r) => r.json())
      .then((data) => setOffices(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function addOffice() {
    setOffices([...offices, emptyOffice()]);
    setSaved(false);
  }

  function updateOffice(index: number, field: keyof Office, value: string | string[]) {
    setOffices((prev) =>
      prev.map((o, i) => (i === index ? { ...o, [field]: value } : o))
    );
    setSaved(false);
  }

  function updatePhone(officeIndex: number, phoneIndex: number, value: string) {
    setOffices((prev) =>
      prev.map((o, i) => {
        if (i !== officeIndex) return o;
        const phones = [...o.phones];
        phones[phoneIndex] = value;
        return { ...o, phones };
      })
    );
    setSaved(false);
  }

  function addPhone(officeIndex: number) {
    setOffices((prev) =>
      prev.map((o, i) => (i === officeIndex ? { ...o, phones: [...o.phones, ""] } : o))
    );
    setSaved(false);
  }

  function removePhone(officeIndex: number, phoneIndex: number) {
    setOffices((prev) =>
      prev.map((o, i) => {
        if (i !== officeIndex) return o;
        return { ...o, phones: o.phones.filter((_, pi) => pi !== phoneIndex) };
      })
    );
    setSaved(false);
  }

  function removeOffice(index: number) {
    setOffices((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  }

  async function saveAll() {
    setSaving(true);
    try {
      const res = await fetch("/api/offices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offices),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setOffices(data);
        setSaved(true);
      } else {
        alert(`Помилка: ${data.error || "Unknown error"}`);
      }
    } catch {
      alert("Помилка збереження");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Офіси ({offices.length})</h2>
        <div className="flex gap-2">
          <Button onClick={addOffice} className="bg-brand-600 hover:bg-brand-700">
            <Plus className="mr-2 h-4 w-4" />
            Додати офіс
          </Button>
          <Button
            onClick={saveAll}
            disabled={saving}
            className={saved ? "bg-brand-600 hover:bg-brand-700" : ""}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saved ? "Збережено" : "Зберегти все"}
          </Button>
        </div>
      </div>

      {offices.length === 0 && (
        <div className="rounded-xl border bg-card p-12 text-center">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Немає офісів. Додайте перший офіс.</p>
        </div>
      )}

      <div className="space-y-4">
        {offices.map((office, index) => (
          <div key={office.id || `new-${index}`} className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <MapPin className="h-4 w-4 text-brand-600" />
                <span className="font-semibold">
                  {office.city_ua || office.city_ru || `Офіс #${index + 1}`}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setConfirmDeleteIndex(index)}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Видалити
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Місто (UA)</Label>
                <Input
                  value={office.city_ua}
                  onChange={(e) => updateOffice(index, "city_ua", e.target.value)}
                  placeholder="Київ"
                />
              </div>
              <div>
                <Label>Місто (RU)</Label>
                <Input
                  value={office.city_ru}
                  onChange={(e) => updateOffice(index, "city_ru", e.target.value)}
                  placeholder="Киев"
                />
              </div>
              <div>
                <Label>Місто (EN)</Label>
                <Input
                  value={office.city_en || ""}
                  onChange={(e) => updateOffice(index, "city_en", e.target.value)}
                  placeholder="Kyiv"
                />
              </div>
              <div className="hidden sm:block" />
              <div>
                <Label>Адреса (UA)</Label>
                <Input
                  value={office.address_ua}
                  onChange={(e) => updateOffice(index, "address_ua", e.target.value)}
                  placeholder="вул. Голосіївська, 11"
                />
              </div>
              <div>
                <Label>Адреса (RU)</Label>
                <Input
                  value={office.address_ru}
                  onChange={(e) => updateOffice(index, "address_ru", e.target.value)}
                  placeholder="ул. Голосеевская, 11"
                />
              </div>
              <div>
                <Label>Адреса (EN)</Label>
                <Input
                  value={office.address_en || ""}
                  onChange={(e) => updateOffice(index, "address_en", e.target.value)}
                  placeholder="11 Holosiivska St."
                />
              </div>
            </div>

            <div className="mt-4">
              <Label className="mb-2 block">Телефони</Label>
              <div className="space-y-2">
                {office.phones.map((phone, pi) => (
                  <div key={pi} className="flex gap-2">
                    <PhoneInput
                      value={phone}
                      onChange={(val) => updatePhone(index, pi, val)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 text-red-500"
                      onClick={() => setConfirmDeletePhone({ office: index, phone: pi })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addPhone(index)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Додати телефон
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={confirmDeleteIndex !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteIndex(null); }}
        onConfirm={() => { if (confirmDeleteIndex !== null) removeOffice(confirmDeleteIndex); }}
        title="Видалити офіс?"
        description="Офіс буде видалено. Не забудьте натиснути «Зберегти все»."
        variant="warning"
      />
      <ConfirmDialog
        open={!!confirmDeletePhone}
        onOpenChange={(open) => { if (!open) setConfirmDeletePhone(null); }}
        onConfirm={() => { if (confirmDeletePhone) removePhone(confirmDeletePhone.office, confirmDeletePhone.phone); }}
        title="Видалити номер телефону?"
        description="Номер буде видалено. Не забудьте натиснути «Зберегти все»."
        variant="warning"
      />
    </div>
  );
}
